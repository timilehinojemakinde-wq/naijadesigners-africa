import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Check, Clock, Package } from "lucide-react";

type Props = {
    params: Promise<{ token: string }>;
};

const PIPELINE = [
    { value: "inquiry", label: "Order Received", desc: "Your order has been received by the designer" },
    { value: "measurement_pending", label: "Measurement Pending", desc: "Waiting for your measurements" },
    { value: "measurement_done", label: "Measured", desc: "Your measurements have been recorded" },
    { value: "awaiting_deposit", label: "Awaiting Deposit", desc: "Waiting for deposit payment" },
    { value: "deposit_paid", label: "Deposit Confirmed", desc: "Deposit received, work is starting" },
    { value: "cutting", label: "Cutting", desc: "Your fabric is being cut to shape" },
    { value: "sewing", label: "Sewing", desc: "Your outfit is being sewn together" },
    { value: "finishing", label: "Finishing", desc: "Final touches and detailing in progress" },
    { value: "quality_check", label: "Quality Check", desc: "Your outfit is being inspected" },
    { value: "ready", label: "Ready for Delivery", desc: "Your outfit is ready!" },
    { value: "delivered", label: "Delivered", desc: "Your outfit has been delivered" },
];

export default async function TrackingPage({ params }: Props) {
    const { token } = await params;

    // Fetch job by tracking token
    const { data: job, error } = await supabase
        .from("jobs")
        .select("id, title, status, expected_delivery, created_at, client_id, job_number, designer_id")
        .eq("tracking_token", token)
        .single();

    if (error || !job) {
        notFound();
    }

    // Fetch designer info
    const { data: designer } = await supabase
        .from("designers")
        .select("brand_name, profile_image, business_location, slug")
        .eq("id", job.designer_id)
        .single();

    // Fetch job updates timeline
    const { data: updates } = await supabase
        .from("job_updates")
        .select("id, status, note, created_at")
        .eq("job_id", job.id)
        .order("created_at", { ascending: false });

    const currentIndex = PIPELINE.findIndex(p => p.value === job.status);
    const currentStage = PIPELINE[currentIndex];
    const isDelivered = job.status === "delivered";
    const progressPercent = Math.round(((currentIndex + 1) / PIPELINE.length) * 100);

    return (
        <main className="min-h-screen bg-gray-50">

            {/* HEADER */}
            <header className="bg-white border-b border-gray-100 px-5 py-4">
                <div className="mx-auto flex max-w-md items-center justify-between">
                    <div>
                        <p className="text-xs text-gray-400">Order Tracking</p>
                        <h1 className="text-base font-bold text-gray-900">
                            {designer?.brand_name ?? "FitHouseAfrica"}
                        </h1>
                    </div>
                    <div className="flex h-10 w-10 items-center justify-center overflow-hidden rounded-full bg-emerald-100">
                        {designer?.profile_image ? (
                            <img
                                src={designer.profile_image}
                                alt={designer.brand_name ?? ""}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <span className="text-sm font-bold text-emerald-700">
                                {designer?.brand_name?.[0]?.toUpperCase() ?? "F"}
                            </span>
                        )}
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-md space-y-4 px-5 py-5">

                {/* ORDER CARD */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex items-start justify-between gap-3">
                        <div>
                            <p className="text-[10px] font-semibold uppercase tracking-widest text-gray-400">
                                {job.job_number ?? "ORDER"}
                            </p>
                            <h2 className="mt-0.5 text-lg font-bold text-gray-900">
                                {job.title ?? "Your Order"}
                            </h2>
                        </div>
                        {isDelivered ? (
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600">
                                <Check size={18} className="text-white" strokeWidth={3} />
                            </div>
                        ) : (
                            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-gray-100">
                                <Package size={18} className="text-gray-500" />
                            </div>
                        )}
                    </div>

                    {/* PROGRESS BAR */}
                    <div className="mt-5">
                        <div className="mb-2 flex items-center justify-between">
                            <p className="text-xs font-semibold text-gray-900">
                                {currentStage?.label ?? "In Progress"}
                            </p>
                            <p className="text-xs text-gray-400">{progressPercent}%</p>
                        </div>
                        <div className="h-2 w-full overflow-hidden rounded-full bg-gray-100">
                            <div
                                className="h-full rounded-full bg-emerald-600 transition-all"
                                style={{ width: `${progressPercent}%` }}
                            />
                        </div>
                        {currentStage?.desc && (
                            <p className="mt-2 text-xs text-gray-500">{currentStage.desc}</p>
                        )}
                    </div>

                    {/* DELIVERY DATE */}
                    {job.expected_delivery && !isDelivered && (
                        <div className="mt-4 flex items-center gap-2 rounded-xl bg-gray-50 px-3.5 py-2.5">
                            <Clock size={14} className="text-gray-400" />
                            <p className="text-xs text-gray-600">
                                Expected delivery:{" "}
                                <span className="font-semibold text-gray-900">
                                    {new Date(job.expected_delivery).toLocaleDateString("en-NG", {
                                        weekday: "long",
                                        day: "numeric",
                                        month: "long",
                                    })}
                                </span>
                            </p>
                        </div>
                    )}
                </section>

                {/* PRODUCTION PIPELINE */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <h3 className="mb-4 text-sm font-bold text-gray-900">
                        Production Progress
                    </h3>

                    <div className="space-y-3">
                        {PIPELINE.map((stage, i) => {
                            const isDone = i < currentIndex;
                            const isCurrent = i === currentIndex;
                            const isPending = i > currentIndex;

                            return (
                                <div key={stage.value} className="flex items-start gap-3">
                                    {/* indicator */}
                                    <div className="flex flex-col items-center">
                                        <div className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-full ${isDone
                                                ? "bg-emerald-600"
                                                : isCurrent
                                                    ? "border-2 border-gray-900 bg-white"
                                                    : "border border-gray-200 bg-gray-50"
                                            }`}>
                                            {isDone && <Check size={11} className="text-white" strokeWidth={3} />}
                                            {isCurrent && <div className="h-2.5 w-2.5 rounded-full bg-gray-900 animate-pulse" />}
                                        </div>
                                        {i < PIPELINE.length - 1 && (
                                            <div className={`mt-1 w-px flex-1 min-h-[12px] ${isDone ? "bg-emerald-200" : "bg-gray-100"
                                                }`} />
                                        )}
                                    </div>

                                    {/* label */}
                                    <div className="pb-2">
                                        <p className={`text-sm font-medium ${isCurrent
                                                ? "text-gray-900"
                                                : isDone
                                                    ? "text-gray-400"
                                                    : "text-gray-300"
                                            }`}>
                                            {stage.label}
                                        </p>
                                        {isCurrent && (
                                            <p className="mt-0.5 text-xs text-emerald-600 font-medium">
                                                Currently here
                                            </p>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </section>

                {/* TIMELINE */}
                {updates && updates.length > 0 && (
                    <section className="rounded-2xl bg-white p-5 shadow-sm">
                        <h3 className="mb-4 text-sm font-bold text-gray-900">
                            Order History
                        </h3>

                        <div className="space-y-4">
                            {updates.map((update, i) => (
                                <div key={update.id} className="flex gap-3">
                                    <div className="flex flex-col items-center">
                                        <div className="h-2 w-2 flex-shrink-0 rounded-full bg-emerald-500 mt-1" />
                                        {i < updates.length - 1 && (
                                            <div className="mt-1 w-px flex-1 bg-gray-100 min-h-[20px]" />
                                        )}
                                    </div>
                                    <div className="pb-2">
                                        <p className="text-xs font-semibold text-gray-900">
                                            {update.note ??
                                                PIPELINE.find(p => p.value === update.status)?.label}
                                        </p>
                                        <p className="mt-0.5 text-[10px] text-gray-400">
                                            {new Date(update.created_at).toLocaleDateString("en-NG", {
                                                day: "numeric",
                                                month: "short",
                                                year: "numeric",
                                                hour: "2-digit",
                                                minute: "2-digit",
                                            })}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </section>
                )}

                {/* DESIGNER CARD */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <h3 className="mb-3 text-sm font-bold text-gray-900">Made by</h3>
                    <div className="flex items-center gap-3">
                        <div className="h-12 w-12 flex-shrink-0 overflow-hidden rounded-full bg-emerald-100">
                            {designer?.profile_image ? (
                                <img
                                    src={designer.profile_image}
                                    alt={designer.brand_name ?? ""}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-lg font-bold text-emerald-700">
                                    {designer?.brand_name?.[0]?.toUpperCase() ?? "F"}
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="font-semibold text-gray-900">
                                {designer?.brand_name ?? "FitHouseAfrica Designer"}
                            </p>
                            {designer?.business_location && (
                                <p className="text-xs text-gray-400">{designer.business_location}</p>
                            )}
                        </div>
                    </div>

                    {designer?.slug && (
                        <Link
                            href={`/store/${designer.slug}`}
                            className="mt-3 flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 py-2.5 text-xs font-semibold text-gray-700 hover:bg-gray-50"
                        >
                            View Store
                        </Link>
                    )}
                </section>

                {/* POWERED BY */}
                <p className="pb-4 text-center text-xs text-gray-400">
                    Powered by{" "}
                    <Link href="/" className="font-semibold text-emerald-600">
                        FitHouseAfrica
                    </Link>
                </p>
            </div>
        </main>
    );
}