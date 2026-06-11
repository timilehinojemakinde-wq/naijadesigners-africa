"use client";

import Link from "next/link";
import {
    Home,
    Package,
    Ruler,
    Store,
    Receipt,
    User,
    Bell,
} from "lucide-react";

export default function DesignerDashboard() {
    return (
        <main className="min-h-screen bg-[#fafafa] pb-24">
            {/* TOP NAVBAR */}
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md">
                <div className="flex items-center justify-between px-5 py-4">
                    <div>
                        <h1 className="text-xl font-bold">
                            FitHouse
                            <span className="text-red-600">
                                Africa
                            </span>
                        </h1>

                        <p className="text-sm text-gray-500">
                            Welcome back 👋
                        </p>
                    </div>

                    <button className="relative rounded-xl border border-gray-200 bg-white p-3">
                        <Bell size={20} />

                        <span className="absolute right-2 top-2 h-2 w-2 rounded-full bg-red-600" />
                    </button>
                </div>
            </header>

            {/* DASHBOARD CONTENT */}
            <section className="px-5 py-6">
                {/* Greeting */}
                <div>
                    <h2 className="text-2xl font-bold leading-tight">
                        Welcome to your
                        <span className="text-red-600">
                            {" "}Designer Hub
                        </span>
                    </h2>

                    <p className="mt-2 text-gray-600">
                        Manage orders, measurements,
                        products, invoices and customers.
                    </p>
                </div>

                {/* STATS */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                    {[
                        {
                            title: "Orders",
                            value: "12",
                        },
                        {
                            title: "Measurements",
                            value: "7",
                        },
                        {
                            title: "Revenue",
                            value: "₦820k",
                        },
                        {
                            title: "Invoices",
                            value: "5",
                        },
                    ].map((item) => (
                        <div
                            key={item.title}
                            className="rounded-[8px] bg-white p-5 shadow-sm"
                        >
                            <p className="text-sm text-gray-500">
                                {item.title}
                            </p>

                            <h3 className="mt-2 text-3xl font-bold">
                                {item.value}
                            </h3>
                        </div>
                    ))}
                </div>

                {/* QUICK ACTIONS */}
                <div className="mt-10">
                    <h3 className="mb-4 text-xl font-semibold">
                        Quick Actions
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        {[
                            "Add Product",
                            "Send Measurement Link",
                            "Generate Invoice",
                            "Share Store Link",
                        ].map((action) => (
                            <button
                                key={action}
                                className="rounded-[8px] border border-gray-200 bg-white p-5 text-left font-medium transition hover:border-red-400"
                            >
                                {action}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ORDERS PIPELINE */}
                <div className="mt-10">
                    <h3 className="mb-4 text-xl font-semibold">
                        Orders Pipeline
                    </h3>

                    <div className="overflow-x-auto">
                        <div className="flex gap-4">
                            {[
                                {
                                    title: "New",
                                    count: 4,
                                },
                                {
                                    title: "Measurement",
                                    count: 2,
                                },
                                {
                                    title: "Production",
                                    count: 5,
                                },
                                {
                                    title: "Delivery",
                                    count: 1,
                                },
                            ].map((item) => (
                                <div
                                    key={item.title}
                                    className="min-w-[150px] rounded-[8px] bg-white p-5 shadow-sm"
                                >
                                    <p className="text-gray-500">
                                        {item.title}
                                    </p>

                                    <h4 className="mt-2 text-3xl font-bold">
                                        {item.count}
                                    </h4>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RECENT ORDERS */}
                <div className="mt-10">
                    <h3 className="mb-4 text-xl font-semibold">
                        Recent Orders
                    </h3>

                    <div className="space-y-4">
                        {[1, 2].map((item) => (
                            <div
                                key={item}
                                className="rounded-[8px] bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-center justify-between">
                                    <div>
                                        <h4 className="font-semibold">
                                            Wedding Dress
                                        </h4>

                                        <p className="text-sm text-gray-500">
                                            Sarah A.
                                        </p>
                                    </div>

                                    <span className="rounded-full bg-yellow-100 px-3 py-1 text-sm text-yellow-700">
                                        Production
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* BOTTOM NAVIGATION */}
            <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-200 bg-white">
                <div className="mx-auto flex max-w-md items-center justify-between px-6 py-4">
                    <NavItem
                        href="/designer-dashboard"
                        icon={<Home size={20} />}
                        label="Home"
                        active
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
