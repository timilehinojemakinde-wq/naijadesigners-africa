
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
    ExternalLink,
    Eye,
} from "lucide-react";

export default function StorePage() {
    const products = [
        {
            name: "Luxury Wedding Dress",
            category: "Wedding",
            price: "₦250,000",
        },
        {
            name: "Royal Agbada",
            category: "Native Wear",
            price: "₦180,000",
        },
        {
            name: "Luxury Senator",
            category: "Corporate",
            price: "₦120,000",
        },
    ];

    return (
        <main className="min-h-screen bg-[#fafafa] pb-24">
            {/* HEADER */}
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
                <div className="px-5 py-4">
                    <h1 className="text-2xl font-bold">
                        Storefront
                    </h1>

                    <p className="text-sm text-gray-500">
                        Manage products & store
                    </p>
                </div>
            </header>

            <section className="px-5 py-6">
                {/* STORE LINK */}
                <div className="rounded-[30px] bg-black p-5 text-white">
                    <p className="text-sm text-gray-300">
                        Your Store Link
                    </p>

                    <h3 className="mt-2 text-lg font-semibold">
                        fithouse.africa/store/houseoftife
                    </h3>

                    <div className="mt-5 flex gap-3">
                        <button className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-white py-3 text-black">
                            <ExternalLink size={16} />
                            Share Store
                        </button>

                        <button className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-gray-600 py-3">
                            <Eye size={16} />
                            Preview
                        </button>
                    </div>
                </div>

                {/* STORE ACTIONS */}
                <div className="mt-8">
                    <h3 className="mb-4 text-lg font-semibold">
                        Quick Actions
                    </h3>

                    <div className="grid grid-cols-2 gap-4">
                        <button className="rounded-[24px] bg-red-600 p-5 text-left text-white">
                            <Plus size={22} />

                            <p className="mt-4 font-medium">
                                Add Product
                            </p>

                            <p className="text-sm text-red-100">
                                Upload to storefront
                            </p>
                        </button>

                        <button className="rounded-[24px] bg-white p-5 text-left shadow-sm">
                            <Store size={22} />

                            <p className="mt-4 font-medium">
                                Edit Store
                            </p>

                            <p className="text-sm text-gray-500">
                                Customize storefront
                            </p>
                        </button>
                    </div>
                </div>

                {/* MARKETPLACE INFO */}
                <div className="mt-8 rounded-[28px] bg-red-50 p-5">
                    <h3 className="font-semibold text-red-700">
                        Marketplace Sync
                    </h3>

                    <p className="mt-2 text-sm text-gray-700">
                        Products uploaded to your
                        storefront automatically appear
                        on FitHouse marketplace based on
                        selected category, price,
                        location and style.
                    </p>
                </div>

                {/* PRODUCT LIST */}
                <div className="mt-10">
                    <div className="mb-4 flex items-center justify-between">
                        <h3 className="text-lg font-semibold">
                            Your Products
                        </h3>

                        <button className="text-sm text-red-600">
                            View All
                        </button>
                    </div>

                    <div className="space-y-4">
                        {products.map((product) => (
                            <div
                                key={product.name}
                                className="rounded-[24px] bg-white p-5 shadow-sm"
                            >
                                <div className="flex items-start justify-between">
                                    <div>
                                        <h4 className="font-semibold">
                                            {product.name}
                                        </h4>

                                        <p className="mt-1 text-sm text-gray-500">
                                            {product.category}
                                        </p>

                                        <p className="mt-2 font-semibold text-red-600">
                                            {product.price}
                                        </p>
                                    </div>

                                    <button className="rounded-xl border border-gray-200 px-4 py-2 text-sm">
                                        Edit
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
                        active
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
