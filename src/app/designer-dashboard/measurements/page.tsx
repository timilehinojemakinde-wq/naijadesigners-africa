"use client";

import Link from "next/link";
import {
    Home,
    Package,
    Ruler,
    Store,
    Receipt,
    User,
    Plus,
    Copy,
    Send,
} from "lucide-react";

export default function MeasurementsPage() {
    const customers = [
        {
            name: "Sarah Johnson",
            status: "Completed",
            date: "2 hours ago",
        },
        {
            name: "David Adebayo",
            status: "Pending",
            date: "Yesterday",
        },
        {
            name: "Mariam Bello",
            status: "Completed",
            date: "3 days ago",
        },
    ];

    return (
        <main className="min-h-screen bg-[#fafafa] pb-24">
            {/* HEADER */}
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
                <div className="px-5 py-4">
                    <h1 className="text-2xl font-bold">
                        Measurement Book
                    </h1>

                    <p className="text-sm text-gray-500">
                        Manage customer measurements
                    </p>
                </div>
            </header>

            <section className="px-5 py-6">
                {/* TOP STATS */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-[28px] bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Measurements
                        </p>

                        <h2 className="mt-2 text-3xl font-bold">
                            24
                        </h2>
                    </div>

                    <div className="rounded-[28px] bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Pending
                        </p>

                        <h2 className="mt-2 text-3xl font-bold text-red-600">
                            5
                        </h2>
                    </div>
                </div>

                {/* MAIN ACTIONS */}
                <div className="mt-8">
                    <h3 className="mb-4 text-lg font-semibold">
                        Quick Actions
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <button className="rounded-[24px] bg-red-600 p-5 text-left text-white">
                            <Plus size={22} />

                            <p className="mt-4 font-medium">
                                Add Manual
                            </p>

                            <p className="text-sm text-red-100">
                                Enter customer measurement
                            </p>
                        </button>

                        <button className="rounded-[24px] bg-black p-5 text-left text-white">
                            <Send size={22} />

                            <p className="mt-4 font-medium">
                                Send Link
                            </p>

                            <p className="text-sm text-gray-300">
                                AI measurement scan
                            </p>
                        </button>
                    </div>
                </div>

                {/* AI LINK CARD */}
                <div className="mt-8 rounded-[30px] bg-white p-5 shadow-sm">
                    <h3 className="text-lg font-semibold">
                        Measurement Link
                    </h3>

                    <p className="mt-2 text-sm text-gray-500">
                        Share this link with customers
                        to scan body measurements.
                    </p>

                    <div className="mt-4 rounded-2xl bg-gray-100 p-4 text-sm text-gray-700">
                        fithouse.africa/m/houseoftife
                    </div>

                    <div className="mt-4 flex gap-3">
                        <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-200 py-3">
                            <Copy size={16} />
                            Copy
                        </button>

                        <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-white">
                            <Send size={16} />
                            Share
                        </button>
                    </div>
                </div>

                {/* CUSTOMER LIST */}
                <div className="mt-10">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold">
                            Recent Measurements
                        </h3>

                        <button className="text-sm text-red-600">
                            View All
                        </button>
                    </div>

                    <div className="space-y-4">
                        {customers.map((customer) => (
                            <div
                                key={customer.name}
                                className="rounded-[24px] bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold">
                                            {customer.name}
                                        </h4>

                                        <p className="text-sm text-gray-500">
                                            {customer.date}
                                        </p>
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1 text-sm ${customer.status === "Completed"
                                                ? "bg-green-100 text-green-700"
                                                : "bg-yellow-100 text-yellow-700"
                                            }`}
                                    >
                                        {customer.status}
                                    </span>
                                </div>

                                <button className="mt-4 rounded-xl border border-gray-200 px-5 py-3 text-sm">
                                    View Measurement
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
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
                        active
                    />

                    <NavItem
                        href="/designer-dashboard/store"
                        icon={<Store size={20} />}
                        label="Store"
                    />

                    <NavItem
                        href="/designer-dashboard/invoices"
                        icon={<Receipt size={20} />}
                        label="Invoice"
                    />

                    <NavItem
                        href="/designer-dashboard/profile"
                        icon={<User size={20} />}
                        label="Profile"
                    />
                </div>
            </nav>
        </main>
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
