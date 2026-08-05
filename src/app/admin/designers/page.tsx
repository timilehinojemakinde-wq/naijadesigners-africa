"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { Check, X, AtSign, ExternalLink, Clock, ChevronRight } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Designer = {
    id: string;
    brand_name: string | null;
    business_type: string | null;
    business_location: string | null;
    instagram_handle: string | null;
    phone: string | null;
    profile_image: string | null;
    approval_status: string | null;
    plan: string | null;
    created_at: string;
    last_seen_at: string | null;
};

const FILTERS = ["pending", "approved", "rejected", "all"] as const;

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

function DesignersContent() {
    const searchParams = useSearchParams();
    const initialFilter = (searchParams.get("filter") as typeof FILTERS[number]) ?? "pending";

    const [designers, setDesigners] = useState<Designer[]>([]);
    const [filter, setFilter] = useState<typeof FILTERS[number]>(initialFilter);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);
    const [actingOn, setActingOn] = useState<string | null>(null);

    useEffect(() => {
        const load = async () => {
            setLoading(true);
            let query = supabase
                .from("designers")
                .select("id, brand_name, business_type, business_location, instagram_handle, phone, profile_image, approval_status, plan, created_at, last_seen_at")
                .order("created_at", { ascending: false });

            if (filter !== "all") {
                query = query.eq("approval_status", filter);
            }

            const { data } = await query;
            setDesigners(data ?? []);
            setLoading(false);
        };
        load();
    }, [filter]);

    const logAction = async (action: string, targetId: string) => {
        const { data: { user } } = await supabase.auth.getUser();
        await supabase.from("admin_actions").insert({
            admin_id: user?.id,
            action,
            target_type: "designer",
            target_id: targetId,
        });
    };

    const handleDecision = async (id: string, decision: "approved" | "rejected") => {
        setActingOn(id);
        await supabase
            .from("designers")
            .update({ approval_status: decision, approved: decision === "approved" })
            .eq("id", id);

        await logAction(decision === "approved" ? "approved_designer" : "rejected_designer", id);

        setDesigners((prev) => prev.filter((d) => d.id !== id));
        setActingOn(null);
    };

    const q = search.toLowerCase();
    const filtered = designers.filter((d) =>
        d.brand_name?.toLowerCase().includes(q) ||
        d.instagram_handle?.toLowerCase().includes(q) ||
        d.phone?.toLowerCase().includes(q)
    );

    return (
        <div className="px-6 py-8 md:px-10">
            <h1 className="text-2xl font-bold text-gray-900">Designers</h1>
            <p className="mt-1 text-sm text-gray-500">Verify designers via Instagram/TikTok before approving.</p>

            <div className="mt-6 flex flex-wrap items-center gap-3">
                <div className="flex gap-2">
                    {FILTERS.map((f) => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`rounded-full px-4 py-1.5 text-xs font-semibold capitalize transition ${filter === f ? "bg-gray-900 text-white" : "border border-gray-200 bg-white text-gray-600"
                                }`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
                <input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search name, Instagram, or phone..."
                    className="h-9 w-64 rounded-lg border border-gray-200 px-3 text-sm outline-none focus:border-gray-900"
                />
            </div>

            <div className="mt-6">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
                        <p className="text-sm font-medium text-gray-700">No designers here</p>
                        <p className="mt-1 text-xs text-gray-400">
                            {search ? "Try a different search term." : `Nothing in the "${filter}" queue right now.`}
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {filtered.map((d) => (
                            <div key={d.id} className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
                                <Link href={`/admin/designers/${d.id}`} className="flex min-w-0 flex-1 items-center gap-4">
                                    <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-emerald-100">
                                        {d.profile_image ? (
                                            <img src={d.profile_image} alt="" className="h-full w-full object-cover" />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-sm font-bold text-emerald-700">
                                                {d.brand_name?.[0]?.toUpperCase() ?? "?"}
                                            </div>
                                        )}
                                    </div>

                                    <div className="min-w-0 flex-1">
                                        <p className="truncate text-sm font-semibold text-gray-900">
                                            {d.brand_name ?? "Unnamed Brand"}
                                        </p>
                                        <p className="text-xs text-gray-400">
                                            {d.business_type ?? "—"} · {d.business_location ?? "—"} · {d.plan ?? "trial"}
                                        </p>
                                        <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                                            <Clock size={11} /> Last seen: {formatLastSeen(d.last_seen_at)}
                                        </p>
                                    </div>
                                </Link>

                                {d.instagram_handle && (
                                    <a
                                        href={`https://instagram.com/${d.instagram_handle.replace("@", "")}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        onClick={(e) => e.stopPropagation()}
                                        className="flex flex-shrink-0 items-center gap-1.5 rounded-xl border border-gray-200 px-3 py-2 text-xs font-semibold text-gray-700"
                                    >
                                        <AtSign size={13} />
                                        Verify
                                        <ExternalLink size={11} />
                                    </a>
                                )}

                                {filter === "pending" && (
                                    <div className="flex flex-shrink-0 gap-2">
                                        <button
                                            onClick={() => handleDecision(d.id, "approved")}
                                            disabled={actingOn === d.id}
                                            className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-white disabled:opacity-50"
                                        >
                                            <Check size={15} />
                                        </button>
                                        <button
                                            onClick={() => handleDecision(d.id, "rejected")}
                                            disabled={actingOn === d.id}
                                            className="flex h-9 w-9 items-center justify-center rounded-full bg-red-50 text-red-600 disabled:opacity-50"
                                        >
                                            <X size={15} />
                                        </button>
                                    </div>
                                )}

                                <Link href={`/admin/designers/${d.id}`} className="flex-shrink-0 text-gray-300">
                                    <ChevronRight size={16} />
                                </Link>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}

export default function DesignersPage() {
    return (
        <Suspense fallback={
            <div className="flex min-h-screen items-center justify-center">
                <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
            </div>
        }>
            <DesignersContent />
        </Suspense>
    );
}