"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Search, Plus, ChevronRight, Users } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import BottomNav from "@/components/dashboard/BottomNav";

type Client = {
    id: string;
    title: string | null;
    full_name: string;
    phone: string | null;
    email: string | null;
    created_at: string;
    job_count: number;
};

export default function ClientsPage() {
    const router = useRouter();
    const [clients, setClients] = useState<Client[]>([]);
    const [filtered, setFiltered] = useState<Client[]>([]);
    const [search, setSearch] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/auth"); return; }

            const { data: clientsData } = await supabase
                .from("clients")
                .select("id, title, full_name, phone, email, created_at")
                .eq("designer_id", user.id)
                .order("full_name", { ascending: true });

            if (!clientsData) { setLoading(false); return; }

            // Get job counts per client
            const clientIds = clientsData.map(c => c.id);
            const { data: jobCounts } = await supabase
                .from("jobs")
                .select("client_id")
                .in("client_id", clientIds);

            const countMap: Record<string, number> = {};
            (jobCounts ?? []).forEach((j) => {
                if (j.client_id) {
                    countMap[j.client_id] = (countMap[j.client_id] ?? 0) + 1;
                }
            });

            const enriched = clientsData.map((c) => ({
                ...c,
                job_count: countMap[c.id] ?? 0,
            }));

            setClients(enriched);
            setFiltered(enriched);
            setLoading(false);
        };

        load();
    }, [router]);

    useEffect(() => {
        if (!search.trim()) {
            setFiltered(clients);
            return;
        }
        const q = search.toLowerCase();
        setFiltered(
            clients.filter(
                (c) =>
                    c.full_name.toLowerCase().includes(q) ||
                    c.phone?.includes(q)
            )
        );
    }, [search, clients]);

    return (
        <main className="min-h-screen bg-gray-50 pb-24">
            {/* HEADER */}
            <header className="bg-white px-5 pt-12 pb-4">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-xl font-bold text-gray-900">Clients</h1>
                        <p className="mt-0.5 text-xs text-gray-400">
                            {clients.length} customer{clients.length !== 1 ? "s" : ""}
                        </p>
                    </div>
                    <Link
                        href="/designer-dashboard/jobs/new"
                        className="flex items-center gap-1.5 rounded-xl bg-gray-900 px-4 py-2.5 text-sm font-semibold text-white"
                    >
                        <Plus size={15} />
                        New Job
                    </Link>
                </div>

                {/* SEARCH */}
                <div className="relative mt-4">
                    <Search
                        size={15}
                        className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                    />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by name or phone..."
                        className="h-11 w-full rounded-xl border border-gray-200 bg-gray-50 pl-10 pr-4 text-sm outline-none focus:border-gray-900 focus:bg-white"
                    />
                </div>
            </header>

            <div className="px-5 py-3">
                {loading ? (
                    <div className="flex justify-center py-12">
                        <div className="h-6 w-6 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
                    </div>
                ) : filtered.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-gray-100">
                            <Users size={28} className="text-gray-400" />
                        </div>
                        <h2 className="text-base font-semibold text-gray-900">
                            {search ? "No clients found" : "No clients yet"}
                        </h2>
                        <p className="mt-1.5 max-w-xs text-sm text-gray-400">
                            {search
                                ? "Try a different name or phone number"
                                : "Clients are created automatically when you create a new job."}
                        </p>
                        {!search && (
                            <Link
                                href="/designer-dashboard/jobs/new"
                                className="mt-5 inline-flex items-center gap-1.5 rounded-xl bg-gray-900 px-5 py-2.5 text-sm font-semibold text-white"
                            >
                                <Plus size={15} /> Create First Job
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className="space-y-2">
                        {filtered.map((client) => (
                            <Link
                                key={client.id}
                                href={`/designer-dashboard/clients/${client.id}`}
                                className="flex items-center gap-4 rounded-xl bg-white p-4 shadow-sm"
                            >
                                {/* AVATAR */}
                                <div className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-base font-bold text-emerald-700">
                                    {client.full_name[0]?.toUpperCase()}
                                </div>

                                {/* INFO */}
                                <div className="flex-1 min-w-0">
                                    <p className="truncate text-sm font-semibold text-gray-900">
                                        {`${client.title ? client.title + " " : ""}${client.full_name}`}
                                    </p>
                                    <div className="mt-0.5 flex items-center gap-2">
                                        {client.phone && (
                                            <span className="text-xs text-gray-400">
                                                {client.phone}
                                            </span>
                                        )}
                                        <span className="text-xs text-gray-300">·</span>
                                        <span className="text-xs text-gray-400">
                                            {client.job_count} job{client.job_count !== 1 ? "s" : ""}
                                        </span>
                                    </div>
                                </div>

                                <ChevronRight size={16} className="flex-shrink-0 text-gray-300" />
                            </Link>
                        ))}
                    </div>
                )}
            </div>

            <BottomNav />
        </main>
    );
}