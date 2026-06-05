"use client";

import Link from "next/link";
import {
    ArrowLeft,
    Package,
    Calendar,
    User,
    MessageSquare,
    Circle,
    CheckCircle2,
} from "lucide-react";

export default function OrderTimelinePage() {
    const orderStages = [
        {
            title: "Measurements Submitted",
            status: "done",
            note: "Your measurements have been received.",
        },
        {
            title: "Designer Review",
            status: "done",
            note: "Designer reviewed your request.",
        },
        {
            title: "Order Confirmed",
            status: "done",
            note: "Your order has been accepted.",
        },
        {
            title: "Fabric Sourcing",
            status: "active",
            note: "Designer is sourcing materials.",
        },
        {
            title: "In Production",
            status: "pending",
            note: "Tailoring process begins.",
        },
        {
            title: "Ready For Shipping",
            status: "pending",
            note: "Order packed for shipment.",
        },
        {
            title: "Shipped",
            status: "pending",
            note: "Order is on the way.",
        },
        {
            title: "Delivered",
            status: "pending",
            note: "Order completed.",
        },
    ];

    return (
        <main className="min-h-screen bg-[#fafafa] pb-10">
            {/* HEADER */}
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-4 px-5 py-4">
                    <Link
                        href="/track-order"
                        className="rounded-xl border border-gray-200 p-2"
                    >
                        <ArrowLeft size={18} />
                    </Link>

                    <div>
                        <h1 className="text-lg font-bold">
                            Order Tracking
                        </h1>

                        <p className="text-sm text-gray-500">
                            Follow your order progress
                        </p>
                    </div>
                </div>
            </header>

            <section className="px-5 py-8">
                {/* HERO */}
                <div>
                    <div className="inline-flex rounded-full bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
                        Live Tracking
                    </div>

                    <h1 className="mt-6 text-[38px] font-bold leading-[1]">
                        Your Order
                        <span className="text-red-600">
                            {" "}Status
                        </span>
                    </h1>

                    <p className="mt-4 text-lg text-gray-600">
                        Stay updated as your
                        designer progresses with
                        your order.
                    </p>
                </div>

                {/* ORDER CARD */}
                <div className="mt-8 rounded-[32px] bg-white p-5 shadow-sm">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-500">
                                Order ID
                            </p>

                            <h3 className="font-semibold">
                                FH-2034
                            </h3>
                        </div>

                        <div className="rounded-full bg-orange-100 px-4 py-2 text-sm font-medium text-orange-700">
                            In Progress
                        </div>
                    </div>

                    <div className="mt-5 space-y-4">
                        <InfoRow
                            icon={<User size={18} />}
                            label="Designer"
                            value="Ashabi Luxury"
                        />

                        <InfoRow
                            icon={<Calendar size={18} />}
                            label="Expected Delivery"
                            value="12 June 2026"
                        />

                        <InfoRow
                            icon={<Package size={18} />}
                            label="Current Stage"
                            value="Fabric Sourcing"
                        />
                    </div>
                </div>

                {/* TIMELINE */}
                <div className="mt-8 rounded-[32px] bg-white p-5 shadow-sm">
                    <h3 className="font-semibold">
                        Order Timeline
                    </h3>

                    <div className="mt-6 space-y-6">
                        {orderStages.map((stage, index) => (
                            <TimelineItem
                                key={index}
                                title={stage.title}
                                note={stage.note}
                                status={stage.status}
                                isLast={index === orderStages.length - 1}
                            />
                        ))}
                    </div>
                </div>

                {/* DESIGNER NOTE */}
                <div className="mt-8 rounded-[30px] bg-red-50 p-5">
                    <div className="flex items-start gap-3">
                        <div className="rounded-xl bg-red-100 p-3 text-red-600">
                            <MessageSquare size={20} />
                        </div>

                        <div>
                            <h3 className="font-semibold text-red-700">
                                Designer Update
                            </h3>

                            <p className="mt-2 text-sm leading-6 text-gray-700">
                                We are currently sourcing
                                premium fabric for your outfit.
                                Production starts shortly.
                            </p>
                        </div>
                    </div>
                </div>

                {/* CTA */}
                <div className="mt-8">
                    <button className="flex h-14 w-full items-center justify-center rounded-xl bg-red-600 text-base font-semibold text-white">
                        Contact Designer
                    </button>

                    <p className="mt-3 text-center text-sm text-gray-500">
                        You’ll receive notifications when
                        your order status changes.
                    </p>
                </div>
            </section>
        </main>
    );
}

function InfoRow({
    icon,
    label,
    value,
}: {
    icon: React.ReactNode;
    label: string;
    value: string;
}) {
    return (
        <div className="flex items-center gap-3">
            <div className="rounded-xl bg-gray-100 p-2 text-gray-600">
                {icon}
            </div>

            <div>
                <p className="text-sm text-gray-500">
                    {label}
                </p>

                <p className="font-medium">
                    {value}
                </p>
            </div>
        </div>
    );
}

function TimelineItem({
    title,
    note,
    status,
    isLast,
}: {
    title: string;
    note: string;
    status: string;
    isLast: boolean;
}) {
    return (
        <div className="relative flex gap-4">
            {/* LINE + ICON */}
            <div className="flex flex-col items-center">
                <div
                    className={`z-10 flex h-8 w-8 items-center justify-center rounded-full ${status === "done"
                            ? "bg-green-100 text-green-600"
                            : status === "active"
                                ? "bg-red-100 text-red-600"
                                : "bg-gray-100 text-gray-400"
                        }`}
                >
                    {status === "done" ? (
                        <CheckCircle2 size={18} />
                    ) : (
                        <Circle size={16} />
                    )}
                </div>

                {!isLast && (
                    <div className="h-16 w-[2px] bg-gray-200" />
                )}
            </div>

            {/* CONTENT */}
            <div className="pb-4">
                <h4
                    className={`font-semibold ${status === "active"
                            ? "text-red-600"
                            : ""
                        }`}
                >
                    {title}
                </h4>

                <p className="mt-1 text-sm text-gray-500">
                    {note}
                </p>

                {status === "active" && (
                    <div className="mt-2 inline-flex rounded-full bg-red-50 px-3 py-1 text-xs font-medium text-red-600">
                        Current Stage
                    </div>
                )}
            </div>
        </div>
    );
}
