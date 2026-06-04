"use client";

import Link from "next/link";
import {
    Home,
    Package,
    Ruler,
    Store,
    Receipt,
    User,
    Search,
} from "lucide-react";

export default function OrdersPage() {
    const orders = [
        {
            id: "#FH-2031",
            customer: "Sarah Johnson",
            item: "Wedding Dress",
            status: "Production",
            amount: "₦250,000",
        },
        {
            id: "#FH-2032",
            customer: "David A.",
            item: "Native Agbada",
            status: "Measurement",
            amount: "₦120,000",
        },
        {
            id: "#FH-2033",
            customer: "Mariam Bello",
            item: "Luxury Gown",
            status: "Delivery",
            amount: "₦180,000",
        },
    ];

    return (
        <main className="min-h-screen bg-[#fafafa] pb-24">
            {/* TOPBAR */}
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
                <div className="px-5 py-4">
                    <h1 className="text-2xl font-bold">
                        Orders
                    </h1>

                    <p className="text-sm text-gray-500">
                        Manage all customer orders
                    </p>

                    {/* Search */}
                    <div className="relative mt-4">
                        <Search
                            size={18}
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
                        />

                        <input
                            type="text"
                            placeholder="Search order or customer"
                            className="h-14 w-full rounded-2xl border border-gray-200 bg-white pl-12 pr-4 outline-none focus:border-red-500"
                        />
                    </div>
                </div>
            </header>

            {/* ORDER STATUS FILTERS */}
            <section className="px-5 py-5">
                <div className="flex gap-3 overflow-x-auto pb-2">
                    {[
                        "All",
                        "New",
                        "Measurement",
                        "Production",
                        "Delivery",
                        "Completed",
                    ].map((filter, index) => (
                        <button
                            key={filter}
                            className={`whitespace-nowrap rounded-xl px-5 py-3 text-sm font-medium ${index === 0
                                    ? "bg-red-600 text-white"
                                    : "border border-gray-200 bg-white text-gray-700"
                                }`}
                        >
                            {filter}
                        </button>
                    ))}
                </div>
            </section>

            {/* ORDERS LIST */}
            <section className="space-y-4 px-5">
                {orders.map((order) => (
                    <div
                        key={order.id}
                        className="rounded-[28px] bg-white p-5 shadow-sm"
                    >
                        <div className="flex items-start justify-between">
                            <div>
                                <p className="text-sm text-gray-500">
                                    {order.id}
                                </p>

                                <h3 className="mt-1 text-lg font-semibold">
                                    {order.item}
                                </h3>

                                <p className="text-sm text-gray-600">
                                    {order.customer}
                                </p>

                                <p className="mt-2 font-semibold text-red-600">
                                    {order.amount}
                                </p>
                            </div>

                            <span
                                className={`rounded-full px-3 py-1 text-sm ${order.status === "Production"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : order.status === "Measurement"
                                            ? "bg-blue-100 text-blue-700"
                                            : "bg-green-100 text-green-700"
                                    }`}
                            >
                                {order.status}
                            </span>
                        </div>

                        {/* ACTION BUTTONS */}
                        <div className="mt-5 flex gap-3">
                            <button className="flex-1 rounded-xl bg-red-600 py-3 text-sm font-medium text-white">
                                View Details
                            </button>

                            <button className="rounded-xl border border-gray-200 px-5 py-3 text-sm">
                                Update
                            </button>
                        </div>
                    </div>
                ))}
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
                        active
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
