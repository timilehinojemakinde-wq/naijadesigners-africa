"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { Phone, MessageCircle, AlertTriangle } from "lucide-react";

type Designer = {
    id: string;
    brand_name: string | null;
    phone: string | null;
    trial_ends_at: string | null;
    plan: string | null;
};

export default function TrialsPage() {
    const [designers, setDesigners] = useState<Designer[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const { data } = await supabase
                .from("designers")
                .select("id, brand_name, phone, trial_ends_at, plan")
                .eq("approval_status", "approved")
                .eq("plan", "trial")
                .not("trial_ends_at", "is", null)
                .order("trial_ends_at", { ascending: true });

            setDesigners(data ?? []);
            setLoading(false);
        };
        load();
    }, []);

    const daysLeft = (dateStr: string) => {
        const days = Math.ceil((new Date(dateStr).getTime() - Date.now()) / 86400000);
        return days;
    };

    return (
        <div className="px-6 py-8 md:px-10">
            <h1 className="text-2xl font-bold text-gray-900">Trials</h1>
            <p className="mt-1 text-sm text-gray-500">Designers on trial, sorted by soonest expiry — your callback list.</p>

            <div className="mt-6">
                {loading ? (
                    <div className="flex justify-center py-16">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
                    </div>
                ) : designers.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-gray-200 bg-white p-10 text-center">
                        <p className="text-sm font-medium text-gray-700">No active trials</p>
                    </div>
                ) : (
                    <div className="space-y-2">
                        {designers.map((d) => {
                            const days = d.trial_ends_at ? daysLeft(d.trial_ends_at) : null;
                            const urgent = days !== null && days <= 3;
                            return (
                                <div key={d.id} className="flex flex-wrap items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
                                    <div className="min-w-0 flex-1">
                                        <p className="text-sm font-semibold text-gray-900">{d.brand_name ?? "Unnamed Brand"}</p>
                                        <p className="text-xs text-gray-400">{d.phone ?? "No phone on file"}</p>
                                    </div>

                                    <div className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${urgent ? "bg-red-50 text-red-600" : "bg-gray-100 text-gray-600"
                                        }`}>
                                        {urgent && <AlertTriangle size={12} />}
                                        {days !== null ? (days < 0 ? `Expired ${Math.abs(days)}d ago` : days === 0 ? "Ends today" : `${days} days left`) : "—"}
                                    </div>

                                    {d.phone && (
                                        <div className="flex gap-2">
                                            <a
                                                href={`https://wa.me/${d.phone.replace(/\D/g, "")}`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-50 text-emerald-600"
                                            >
                                                <MessageCircle size={15} />
                                            </a>
                                            <a
                                                href={`tel:${d.phone}`}
                                                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-600"
                                            >
                                                <Phone size={15} />
                                            </a>
                                        </div>
                                    )
                                    }
                                </div>
                            );
                        })}
                    </div>
                )
                }
            </div >
        </div >
    );
}