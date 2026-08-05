"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, CreditCard, Clock, LogOut } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const NAV = [
    { href: "/admin", label: "Overview", icon: LayoutDashboard },
    { href: "/admin/designers", label: "Designers", icon: Users },
    { href: "/admin/subscriptions", label: "Subscriptions", icon: CreditCard },
    { href: "/admin/trials", label: "Trials", icon: Clock },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    const router = useRouter();
    const pathname = usePathname();
    const [authorized, setAuthorized] = useState<boolean | null>(null);

    useEffect(() => {
        const checkAccess = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/auth"); return; }

            const { data: profile } = await supabase
                .from("profiles")
                .select("role")
                .eq("id", user.id)
                .single();

            if (profile?.role !== "admin") {
                router.push("/designer-dashboard");
                return;
            }

            setAuthorized(true);
        };
        checkAccess();
    }, [router]);

    const handleLogout = async () => {
        await supabase.auth.signOut();
        router.push("/auth");
    };

    if (authorized === null) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-gray-50">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-gray-900" />
            </main>
        );
    }

    return (
        <div className="flex min-h-screen bg-gray-50">
            {/* SIDEBAR */}
            <aside className="hidden w-60 flex-shrink-0 flex-col border-r border-gray-100 bg-white md:flex">
                <div className="px-6 py-6">
                    <h1 className="text-lg font-bold tracking-tight">
                        FitHouse<span className="text-emerald-600">Admin</span>
                    </h1>
                </div>
                <nav className="flex-1 space-y-1 px-3">
                    {NAV.map((item) => {
                        const active = pathname === item.href;
                        const Icon = item.icon;
                        return (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition ${active ? "bg-gray-900 text-white" : "text-gray-600 hover:bg-gray-50"
                                    }`}
                            >
                                <Icon size={17} />
                                {item.label}
                            </Link>
                        );
                    })}
                </nav>
                <div className="p-3">
                    <button
                        onClick={handleLogout}
                        className="flex w-full items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-gray-500 hover:bg-gray-50"
                    >
                        <LogOut size={17} />
                        Logout
                    </button>
                </div>
            </aside>

            {/* MOBILE TOP NAV */}
            <div className="fixed inset-x-0 top-0 z-40 flex gap-1 overflow-x-auto border-b border-gray-100 bg-white px-3 py-2 md:hidden">
                {NAV.map((item) => {
                    const active = pathname === item.href;
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`flex-shrink-0 rounded-lg px-3 py-1.5 text-xs font-semibold ${active ? "bg-gray-900 text-white" : "text-gray-500"
                                }`}
                        >
                            {item.label}
                        </Link>
                    );
                })}
            </div>

            <main className="flex-1 pt-14 md:pt-0">{children}</main>
        </div>
    );
}