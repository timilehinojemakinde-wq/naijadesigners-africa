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
    Send,
} from "lucide-react";

export default function InvoicesPage() {
    const invoices = [
        {
            id: "INV-2031",
            customer: "Sarah Johnson",
            amount: "₦250,000",
            status: "Pending",
        },
        {
            id: "INV-2032",
            customer: "David Adebayo",
            amount: "₦120,000",
            status: "Paid",
        },
        {
            id: "INV-2033",
            customer: "Mariam Bello",
            amount: "₦180,000",
            status: "Pending",
        },
    ];

    return (
        <main className="min-h-screen bg-[#fafafa] pb-24">
            {/* HEADER */}
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
                <div className="px-5 py-4">
                    <h1 className="text-2xl font-bold">
                        Invoices
                    </h1>

                    <p className="text-sm text-gray-500">
                        Manage customer payments
                    </p>
                </div>
            </header>

            <section className="px-5 py-6">
                {/* STATS */}
                <div className="grid grid-cols-2 gap-4">
                    <div className="rounded-[28px] bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Paid
                        </p>

                        <h2 className="mt-2 text-3xl font-bold text-green-600">
                            ₦1.2M
                        </h2>
                    </div>

                    <div className="rounded-[28px] bg-white p-5 shadow-sm">
                        <p className="text-sm text-gray-500">
                            Outstanding
                        </p>

                        <h2 className="mt-2 text-3xl font-bold text-emerald-600">
                            ₦480k
                        </h2>
                    </div>
                </div>

                {/* QUICK ACTIONS */}
                <div className="mt-8">
                    <h3 className="mb-4 text-lg font-semibold">
                        Quick Actions
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <button className="rounded-[24px] bg-emerald-600 p-5 text-left text-white">
                            <Plus size={22} />

                            <p className="mt-4 font-medium">
                                Create Invoice
                            </p>

                            <p className="text-sm text-emerald-100">
                                Generate for customer
                            </p>
                        </button>

                        <button className="rounded-[24px] bg-black p-5 text-left text-white">
                            <Send size={22} />

                            <p className="mt-4 font-medium">
                                Send Reminder
                            </p>

                            <p className="text-sm text-gray-300">
                                Follow up payment
                            </p>
                        </button>
                    </div>
                </div>

                {/* INVOICE LIST */}
                <div className="mt-10">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold">
                            Recent Invoices
                        </h3>

                        <button className="text-sm text-emerald-600">
                            View All
                        </button>
                    </div>

                    <div className="space-y-4">
                        {invoices.map((invoice) => (
                            <div
                                key={invoice.id}
                                className="rounded-[24px] bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <p className="text-sm text-gray-500">
                                            {invoice.id}
                                        </p>

                                        <h4 className="mt-1 font-semibold">
                                            {invoice.customer}
                                        </h4>

                                        <p className="mt-2 font-semibold text-emerald-600">
                                            {invoice.amount}
                                        </p>
                                    </div>

                                    <span
                                        className={`rounded-full px-3 py-1 text-sm ${invoice.status === "Paid"
                                            ? "bg-green-100 text-green-700"
                                            : "bg-yellow-100 text-yellow-700"
                                            }`}
                                    >
                                        {invoice.status}
                                    </span>
                                </div>

                                <div className="mt-5 flex gap-3">
                                    <button className="flex-1 rounded-xl bg-emerald-600 py-3 text-sm text-white">
                                        View Invoice
                                    </button>

                                    <button className="rounded-xl border border-gray-200 px-5 py-3 text-sm">
                                        Send
                                    </button>
                                </div>
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
                        active
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
                ? "text-emerald-600"
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