"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, AtSign, ExternalLink, Phone, MessageCircle, Check, X, TrendingUp, Briefcase, Clock } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Designer = {
    id: string;
    brand_name: string | null;
    business_type: string | null;
    business_location: string | null;
    instagram_handle: string | null;
    profile_image: string | null;
    approval_status: string | null;
    plan: string | null;
    phone: string | null;
    bio: string | null;
    created_at: string;
    last_seen_at: string | null;
    trial_ends_at: string | null;
};

type Payment = { id: string; amount: number; plan: string; payment_method: string | null; created_at: string; status: string | null };
type AdminAction = { id: string; action: string; note: string | null; created_at: string };

function formatLastSeen(dateStr: string | null) {
    if (!dateStr) return "Never logged in";
    const diffMs = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return "Just now";
    if (mins < 60) return `${mins}m ago`;
    const hours = Math.floor(mins / 60);
    if (hours < 24) return `${hours}h ago`;
    return `${Math.floor(hours / 24)}d ago`;
}

export default function DesignerDetailPage() {
    const router = useRouter();
    const params = useParams();
    const designerId = params.id as string;

    const [designer, setDesigner] = useState<Designer | null>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [jobsCount, setJobsCount] = useState(0);
    const [actions, setActions] = useState<AdminAction[]>([]);
    const [loading, setLoading] = useState(true);
    const [acting, setActing] = useState(false);

    const load = async () => {
        setLoading(true);
        const [{ data: designerData }, { data: paymentsData }, { count }, { data: actionsData }] = await Promise.all([
            supabase.from("designers").select("*").eq("id", designerId).single(),
            supabase.from("subscription_payments").select("*").eq("designer_id", designerId).order("created_at", { ascending: false }),
            supabase.from("jobs").select("*", { count: "exact", head: true }).eq("designer_id", designerId),
            supabase.from("admin_actions").select("*").eq("target_id", designerId).order("created_at", { ascending: false }),
        ]);

        setDesigner(designerData);
        setPayments(paymentsData ?? []);
        setJobsCount(count ?? 0);
        setActions(actionsData ?? []);
        setLoading(false);
    };

    useEffect(() => { load(); }, [designerId]);

    const logAction = async (action: string, note?: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from("admin_actions").insert({
            admin_id: user?.id,
            action,
            target_type: "designer",
            target_id: designerId,
            note: note ?? null,
        });
    };

    const handleDecision = async (decision: "approved" | "rejected") => {
        setActing(true);
        await supabase.from("designers").update({ approval_status: decision, approved: decision === "approved" }).eq("id", designerId);
        await logAction(decision === "approved" ? "approved_designer" : "rejected_designer");
        await load();
        setActing(false);
    };

    const handleSendReminder = async () => {
        await logAction("sent_reminder", "Manual reminder sent via WhatsApp");
        const message = encodeURIComponent(
            `Hi ${designer?.brand_name ?? "there"}, this is FitHouseAfrica — just checking in to see how things are going and if you need any help getting the most out of your account!`
        );
        window.open(`https://wa.me/${designer?.phone?.replace(/\D/g, "")}?text=${message}`, "_blank");
        await load();
    };

    const totalPaid = payments.filter((p) => p.status === "paid").reduce((sum, p) => sum + Number(p.amount), 0);

    if (loading) {
        return (
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
            </div>
        );
    }

    if (!designer) {
        return (
            <div className="px-6 py-8 md:px-10">
                <p className="text-sm text-gray-500">Designer not found.</p>
                <Link href="/admin/designers" className="mt-2 inline-block text-sm text-emerald-600">← Back to Designers</Link>
            </div>
        );
    }

    return (
        <div className="px-6 py-8 md:px-10">
            <Link href="/admin/designers" className="flex w-fit items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900">
                <ArrowLeft size={14} /> Back to Designers
            </Link>

            {/* HEADER */}
            <div className="mt-4 flex flex-wrap items-center gap-4 rounded-2xl bg-white p-5 shadow-sm">
                <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full bg-emerald-100">
                    {designer.profile_image ? (
                        <img src={designer.profile_image} alt="" className="h-full w-full object-cover" />
                    ) : (
                        <div className="flex h-full w-full items-center justify-center text-lg font-bold text-emerald-700">
                            {designer.brand_name?.[0]?.toUpperCase() ?? "?"}
                        </div>
                    )}
                </div>
                <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2">
                        <h1 className="text-lg font-bold text-gray-900">{designer.brand_name ?? "Unnamed Brand"}</h1>
                        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${designer.approval_status === "approved" ? "bg-emerald-100 text-emerald-700" :
                                designer.approval_status === "rejected" ? "bg-red-100 text-red-700" : "bg-amber-100 text-amber-700"
                            }`}>
                            {designer.approval_status ?? "pending"}
                        </span>
                    </div>
                    <p className="text-xs text-gray-400">
                        {designer.business_type ?? "—"} · {designer.business_location ?? "—"} · {designer.plan ?? "trial"} plan
                    </p>
                    <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                        <Clock size={11} /> Last seen: {formatLastSeen(designer.last_seen_at)}
                    </p>
                </div>

                {designer.approval_status === "pending" && (
                    <div className="flex gap-2">
                        <button onClick={() => handleDecision("approved")} disabled={acting} className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white disabled:opacity-50">
                            <Check size={15} />
                        </button>
                        <button onClick={() => handleDecision("rejected")} disabled={acting} className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-600 disabled:opacity-50">
                            <X size={15} />
                        </button>
                    </div>
                )}
            </div>

            {/* CONTACT + BIO */}
            <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-2">
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Contact</p>
                    <div className="space-y-2 text-sm">
                        {designer.phone && (
                            <div className="flex items-center justify-between">
                                <span className="flex items-center gap-2 text-gray-600"><Phone size={13} /> {designer.phone}</span>
                                <a href={`https://wa.me/${designer.phone.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer" className="text-emerald-600">
                                    <MessageCircle size={15} />
                                </a>
                            </div>
                        )}
                        {designer.instagram_handle && (
                            <a href={`https://instagram.com/${designer.instagram_handle.replace("@", "")}`} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-gray-600 hover:text-emerald-600">
                                <AtSign size={13} /> {designer.instagram_handle} <ExternalLink size={11} />
                            </a>
                        )}
                        {!designer.phone && !designer.instagram_handle && <p className="text-gray-400">No contact info on file</p>}
                    </div>
                    {designer.phone && (
                        <button onClick={handleSendReminder} className="mt-4 flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-semibold text-white">
                            <MessageCircle size={14} /> Send Reminder Message
                        </button>
                    )}
                </div>

                <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Bio</p>
                    <p className="text-sm text-gray-600">{designer.bio || "No bio provided."}</p>
                </div>
            </div>

            {/* STATS */}
            <div className="mt-4 grid grid-cols-2 gap-4">
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="inline-flex rounded-xl bg-emerald-50 p-2.5 text-emerald-600"><TrendingUp size={16} /></div>
                    <p className="mt-3 text-xl font-bold text-gray-900">₦{totalPaid.toLocaleString()}</p>
                    <p className="text-xs text-gray-500">Total Subscription Paid</p>
                </div>
                <div className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="inline-flex rounded-xl bg-blue-50 p-2.5 text-blue-600"><Briefcase size={16} /></div>
                    <p className="mt-3 text-xl font-bold text-gray-900">{jobsCount}</p>
                    <p className="text-xs text-gray-500">Total Jobs Created</p>
                </div>
            </div>

            {/* PAYMENT HISTORY */}
            <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Payment History</p>
                {payments.length === 0 ? (
                    <p className="text-sm text-gray-400">No payments logged yet.</p>
                ) : (
                    <div className="space-y-2">
                        {payments.map((p) => (
                            <div key={p.id} className="flex items-center justify-between text-sm">
                                <span className="capitalize text-gray-600">{p.plan} · {p.payment_method?.replace("_", " ") ?? "—"}</span>
                                <span className="font-semibold text-emerald-600">₦{Number(p.amount).toLocaleString()}</span>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* ACTIVITY LOG */}
            <div className="mt-4 rounded-2xl bg-white p-5 shadow-sm">
                <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">Admin Activity</p>
                {actions.length === 0 ? (
                    <p className="text-sm text-gray-400">No actions logged yet.</p>
                ) : (
                    <div className="space-y-2">
                        {actions.map((a) => (
                            <div key={a.id} className="flex items-center justify-between text-xs">
                                <span className="capitalize text-gray-600">{a.action.replace(/_/g, " ")}</span>
                                <span className="text-gray-400">
                                    {new Date(a.created_at).toLocaleDateString("en-NG", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                                </span>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}