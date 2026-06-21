"use client";

import { useRouter } from "next/navigation";
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
    const router = useRouter();

    const handleProtectedNavigation = (
        path: string
    ) => {
        const storeSetup =
            sessionStorage.getItem(
                "storeSetup"
            );

        if (!storeSetup) {
            router.push(
                "/designer-dashboard/store-setup"
            );
            return;
        }

        router.push(path);
    };


    return (
        <main className="min-h-screen bg-[#F6F7F9] pb-24">
            {/* TOP NAVBAR */}
            <header className="sticky top-0 z-50 bg-white">
                <div className="flex items-center justify-between px-5 py-5">
                    <div>
                        <p className="text-sm text-gray-500">
                            Good morning 👋
                        </p>

                        <h1 className="mt-1 text-xl font-bold text-gray-900">
                            Veekee Atelier
                        </h1>
                    </div>

                    <button className="relative">
                        <Bell size={22} />

                        <span className="absolute -right-1 -top-1 h-2.5 w-2.5 rounded-full bg-red-500" />
                    </button>
                </div>
            </header>

            {/* DASHBOARD CONTENT */}
            <section className="px-5 py-6">
                <div className="rounded-xl bg-[#14532D] p-6 text-white shadow-lg">
                    <p className="text-sm text-white/70">
                        Total Revenue
                    </p>

                    <h2 className="mt-2 text-4xl font-bold">
                        ₦820,000
                    </h2>

                    <div className="mt-5 flex items-center justify-between">
                        <span className="rounded-full bg-white/20 px-3 py-1 text-xs">
                            +12.4%
                        </span>

                        <span className="text-sm">
                            This Month
                        </span>
                    </div>
                </div>
                {/* Greeting */}
                <div>
                    <h2 className="text-2xl font-bold leading-tight">
                        Welcome to your{" "}
                        <span className="text-[#14532D]">Designer Hub</span>
                    </h2>
                    <p className="mt-2 text-gray-600">
                        Manage orders, measurements, products, invoices and customers.
                    </p>
                </div>

                {/* STATS */}
                <div className="mt-6 grid grid-cols-2 gap-4">
                    {[
                        { title: "Orders", value: "12" },
                        { title: "Measurements", value: "7" },
                        { title: "Revenue", value: "₦820k" },
                        { title: "Invoices", value: "5" },
                    ].map((item) => (
                        <div
                            key={item.title}
                            className="rounded-xl bg-white p-5 shadow-sm"
                        >
                            <p className="text-sm text-gray-500">
                                {item.title}
                            </p>
                            <h3 className="mt-2 text-2xl font-bold">
                                {item.value}
                            </h3>
                        </div>
                    ))}
                </div>

                {/* QUICK ACTIONS */}
                {/* QUICK ACTIONS */}
                <div className="mt-10">
                    <h3 className="mb-4 text-xl font-semibold">
                        Quick Actions
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        {[
                            {
                                label: "Add Product",
                                route:
                                    "/designer-dashboard/add-product",
                                requiresStore: true,
                            },
                            {
                                label:
                                    "Send Measurement Link",
                                route:
                                    "/measurement/generate-link",
                                requiresStore: false,
                            },
                            {
                                label: "Generate Invoice",
                                route:
                                    "/designer-dashboard/invoice",
                                requiresStore: false,
                            },
                            {
                                label: "Share Store Link",
                                route:
                                    "/designer-dashboard/store",
                                requiresStore: true,
                            },
                        ].map((action) => (
                            <button
                                key={action.label}
                                onClick={() => {
                                    if (
                                        action.requiresStore
                                    ) {
                                        handleProtectedNavigation(
                                            action.route
                                        );
                                    } else {
                                        router.push(
                                            action.route
                                        );
                                    }
                                }}
                                className="rounded-[8px] border border-gray-200 bg-white p-5 text-left font-medium transition hover:border-[#14532D]"
                            >
                                {action.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* ORDERS PIPELINE */}
                <div className="mt-10">
                    <h3 className="mb-4 text-xl font-semibold">
                        Orders Pipeline
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex gap-4">
                            {[
                                { title: "New", count: 4 },
                                { title: "Measurement", count: 2 },
                                { title: "Production", count: 5 },
                                { title: "Delivery", count: 1 },
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
                                className="rounded-xl bg-white p-5 shadow-sm"

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
            className={`flex flex-col items-center gap-1 ${active ? "text-[#14532D]" : "text-gray-500"
                }`}
        >
            {icon}
            <span className="text-xs">{label}</span>
        </Link>
    );
}
