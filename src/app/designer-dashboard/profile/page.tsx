"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Home, Package, Ruler, Store, Receipt, User,
    ChevronRight, LogOut, Shield, CreditCard, Bell, Globe,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Designer = {
    brand_name: string | null;
    business_type: string | null;
    business_location: string | null;
    profile_image: string | null;
};

export default function ProfilePage() {
    const router = useRouter();
    const [designer, setDesigner] = useState<Designer | null>(null);
    const [loggingOut, setLoggingOut] = useState(false);

    useEffect(() => {
        const load = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) return;

            const { data } = await supabase
                .from("designers")
                .select("brand_name, business_type, business_location, profile_image")
                .eq("id", user.id)
                .single();

            setDesigner(data);
        };

        load();
    }, []);

    const handleLogout = async () => {
        setLoggingOut(true);
        await supabase.auth.signOut();
        router.push("/auth");
    };

    const initial = designer?.brand_name?.[0]?.toUpperCase() ?? "?";

    const businessTypeLabel = (type: string | null) => {
        const map: Record<string, string> = {
            fashion_designer: "Fashion Designer",
            tailor: "Tailor",
            bridal_specialist: "Bridal Specialist",
            fashion_house: "Fashion House",
            ready_to_wear: "Ready to Wear",
            luxury_couture: "Luxury Couture",
        };
        return type ? map[type] ?? type : "Fashion Designer";
    };

    return (
        <main className="min-h-screen bg-[#fafafa] pb-24">
            {/* HEADER */}
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
                <div className="px-5 py-4">
                    <h1 className="text-2xl font-bold">Profile & Settings</h1>
                    <p className="text-sm text-gray-500">Manage your account & store</p>
                </div>
            </header>

            <section className="px-5 py-6">
                {/* PROFILE CARD */}
                <div className="rounded-[30px] bg-black p-6 text-white">
                    <div className="flex items-center gap-4">
                        <div className="h-20 w-20 flex-shrink-0 overflow-hidden rounded-full">
                            {designer?.profile_image ? (
                                <img
                                    src={designer.profile_image}
                                    alt="Profile"
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-emerald-600 text-2xl font-bold text-white">
                                    {initial}
                                </div>
                            )}
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold">
                                {designer?.brand_name ?? "Your Brand"}
                            </h2>
                            <p className="text-sm text-gray-300">
                                {businessTypeLabel(designer?.business_type ?? null)}{" "}
                                {designer?.business_location ? `· ${designer.business_location}` : ""}
                            </p>
                            <p className="mt-1 text-sm text-emerald-400">
                                Verified Designer
                            </p>
                        </div>
                    </div>

                    <Link
                        href="/designer-dashboard/store/edit"
                        className="mt-5 flex w-full items-center justify-center rounded-xl bg-white py-4 font-medium text-black"
                    >
                        Edit Profile
                    </Link>
                </div>

                {/* STORE SETTINGS */}
                <div className="mt-8">
                    <h3 className="mb-4 text-lg font-semibold">Store Settings</h3>
                    <div className="space-y-4">
                        <SettingsCard
                            href="/designer-dashboard/store/edit"
                            icon={<Store size={20} />}
                            title="Storefront Settings"
                            subtitle="Customize your online store"
                        />
                        <SettingsCard
                            href="/designer-dashboard/store"
                            icon={<Globe size={20} />}
                            title="Store Link"
                            subtitle="Share your designer URL"
                        />
                        <SettingsCard
                            href="/designer-dashboard/invoice"
                            icon={<CreditCard size={20} />}
                            title="Payment Settings"
                            subtitle="Bank account & payouts"
                        />
                    </div>
                </div>

                {/* ACCOUNT */}
                <div className="mt-8">
                    <h3 className="mb-4 text-lg font-semibold">Account</h3>
                    <div className="space-y-4">
                        <SettingsCard
                            href="#"
                            icon={<Bell size={20} />}
                            title="Notifications"
                            subtitle="Manage alerts & updates"
                        />
                        <SettingsCard
                            href="#"
                            icon={<Shield size={20} />}
                            title="Privacy & Security"
                            subtitle="Password and protection"
                        />
                        <SettingsCard
                            href="#"
                            icon={<User size={20} />}
                            title="Personal Information"
                            subtitle="Edit account details"
                        />
                    </div>
                </div>

                {/* LOGOUT */}
                <button
                    onClick={handleLogout}
                    disabled={loggingOut}
                    className="mt-10 flex w-full items-center justify-center gap-2 rounded-[20px] border border-emerald-200bg-emerald-50 py-4 font-medium text-emerald-600 disabled:opacity-50"
                >
                    <LogOut size={18} />
                    {loggingOut ? "Logging out..." : "Logout"}
                </button>
            </section>

            {/* BOTTOM NAV */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white">
                <div className="mx-auto flex max-w-md items-center justify-between px-6 py-4">
                    <NavItem href="/designer-dashboard" icon={<Home size={20} />} label="Home" />
                    <NavItem href="/designer-dashboard/orders" icon={<Package size={20} />} label="Orders" />
                    <NavItem href="/designer-dashboard/measurements" icon={<Ruler size={20} />} label="Measure" />
                    <NavItem href="/designer-dashboard/store" icon={<Store size={20} />} label="Store" />
                    <NavItem href="/designer-dashboard/invoice" icon={<Receipt size={20} />} label="Invoice" />
                    <NavItem href="/designer-dashboard/profile" icon={<User size={20} />} label="Profile" active />
                </div>
            </nav>
        </main>
    );
}

function SettingsCard({
    href,
    icon,
    title,
    subtitle,
}: {
    href: string;
    icon: React.ReactNode;
    title: string;
    subtitle: string;
}) {
    return (
        <Link
            href={href}
            className="flex w-full items-center justify-between rounded-[24px] bg-white p-5 shadow-sm"
        >
            <div className="flex items-center gap-4">
                <div className="rounded-xl bg-emerald-50 p-3 text-emerald-600">
                    {icon}
                </div>
                <div className="text-left">
                    <h4 className="font-medium">{title}</h4>
                    <p className="text-sm text-gray-500">{subtitle}</p>
                </div>
            </div>
            <ChevronRight size={18} className="text-gray-400" />
        </Link>
    );
}

function NavItem({
    href, icon, label, active = false,
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
    active?: boolean;
}) {
    return (
        <Link
            href={href}
            className={`flex flex-col items-center gap-1 ${active ? "text-emerald-600" : "text-gray-500"}`}
        >
            {icon}
            <span className="text-xs">{label}</span>
        </Link>
    );
}