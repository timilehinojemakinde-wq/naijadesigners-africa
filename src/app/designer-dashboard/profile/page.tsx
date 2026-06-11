"use client";

import Link from "next/link";
import {
    Home,
    Package,
    Ruler,
    Store,
    Receipt,
    User,
    ChevronRight,
    LogOut,
    Shield,
    CreditCard,
    Bell,
    Globe,
} from "lucide-react";

export default function ProfilePage() {
    return (
        <main className="min-h-screen bg-[#fafafa] pb-24">
            {/* HEADER */}
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
                <div className="px-5 py-4">
                    <h1 className="text-2xl font-bold">
                        Profile & Settings
                    </h1>

                    <p className="text-sm text-gray-500">
                        Manage your account & store
                    </p>
                </div>
            </header>

            <section className="px-5 py-6">
                {/* PROFILE CARD */}
                <div className="rounded-[30px] bg-black p-6 text-white">
                    <div className="flex items-center gap-4">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-white text-2xl font-bold text-black">
                            M
                        </div>

                        <div>
                            <h2 className="text-xl font-semibold">
                                Mai Atafo
                            </h2>

                            <p className="text-sm text-gray-300">
                                Luxury Fashion Designer 🇳🇬
                            </p>

                            <p className="mt-1 text-sm text-red-400">
                                Verified Designer
                            </p>
                        </div>
                    </div>

                    <button className="mt-5 w-full rounded-xl bg-red-600 py-4 font-medium">
                        Edit Profile
                    </button>
                </div>

                {/* STORE SETTINGS */}
                <div className="mt-8">
                    <h3 className="mb-4 text-lg font-semibold">
                        Store Settings
                    </h3>

                    <div className="space-y-4">
                        <SettingsCard
                            icon={<Store size={20} />}
                            title="Storefront Settings"
                            subtitle="Customize your online store"
                        />

                        <SettingsCard
                            icon={<Globe size={20} />}
                            title="Store Link"
                            subtitle="Share your designer URL"
                        />

                        <SettingsCard
                            icon={<CreditCard size={20} />}
                            title="Payment Settings"
                            subtitle="Bank account & payouts"
                        />
                    </div>
                </div>

                {/* ACCOUNT */}
                <div className="mt-8">
                    <h3 className="mb-4 text-lg font-semibold">
                        Account
                    </h3>

                    <div className="space-y-4">
                        <SettingsCard
                            icon={<Bell size={20} />}
                            title="Notifications"
                            subtitle="Manage alerts & updates"
                        />

                        <SettingsCard
                            icon={<Shield size={20} />}
                            title="Privacy & Security"
                            subtitle="Password and protection"
                        />

                        <SettingsCard
                            icon={<User size={20} />}
                            title="Personal Information"
                            subtitle="Edit account details"
                        />
                    </div>
                </div>

                {/* LOGOUT */}
                <button className="mt-10 flex w-full items-center justify-center gap-2 rounded-[20px] border border-red-200 bg-red-50 py-4 font-medium text-red-600">
                    <LogOut size={18} />
                    Logout
                </button>
            </section>

            {/* BOTTOM NAV */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white">
                <div className="mx-auto flex max-w-md items-center justify-between px-6 py-4">
                    <NavItem
                        href="/designer-dashboard"
                        icon={<Home size={20} />}
                        label="Home"
                    />

                    <NavItem
                        href="/designer-dashboard/orders"
                        icon={<Package size={20} />}
                        label="Orders"
                    />

                    <NavItem
                        href="/designer-dashboard/measurements"
                        icon={<Ruler size={20} />}
                        label="Measure"
                    />

                    <NavItem
                        href="/designer-dashboard/store"
                        icon={<Store size={20} />}
                        label="Store"
                    />

                    <NavItem
                        href="/designer-dashboard/invoice"
                        icon={<Receipt size={20} />}
                        label="Invoice"
                    />

                    <NavItem
                        href="/designer-dashboard/profile"
                        icon={<User size={20} />}
                        label="Profile"
                        active
                    />
                </div>
            </nav>
        </main>
    );
}

function SettingsCard({
    icon,
    title,
    subtitle,
}: {
    icon: React.ReactNode;
    title: string;
    subtitle: string;
}) {
    return (
        <button className="flex w-full items-center justify-between rounded-[24px] bg-white p-5 shadow-sm">
            <div className="flex items-center gap-4">
                <div className="rounded-xl bg-red-50 p-3 text-red-600">
                    {icon}
                </div>

                <div className="text-left">
                    <h4 className="font-medium">
                        {title}
                    </h4>

                    <p className="text-sm text-gray-500">
                        {subtitle}
                    </p>
                </div>
            </div>

            <ChevronRight
                size={18}
                className="text-gray-400"
            />
        </button>
    );
}

function NavItem({
    href,
    icon,
    label,
    active = false,
}: {
    href: string;
    icon: React.ReactNode;
    label: string;
    active?: boolean;
}) {
    return (
        <Link
            href={href}
            className={`flex flex-col items-center gap-1 ${active
                ? "text-red-600"
                : "text-gray-500"
                }`}
        >
            {icon}

            <span className="text-xs">
                {label}
            </span>
        </Link>
    );
}
