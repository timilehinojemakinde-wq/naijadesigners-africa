import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function OrderDetailsPage({
    params,
}: {
    params: { id: string };
}) {
    return (
        <main className="min-h-screen bg-[#fafafa] px-5 py-6 text-black">
            <Link
                href="/designer-dashboard/orders"
                className="inline-flex items-center gap-2 rounded-[12px] border border-gray-200 bg-white px-4 py-3 text-sm font-medium"
            >
                <ArrowLeft size={16} />
                Back to orders
            </Link>

            <section className="mt-8 rounded-[12px] border border-gray-200 bg-white p-5">
                <p className="text-sm text-gray-500">
                    Order
                </p>

                <h1 className="mt-1 text-2xl font-bold">
                    {params.id}
                </h1>

                <p className="mt-4 text-sm leading-6 text-gray-600">
                    Order details will be connected after the dashboard order flow is stabilized.
                </p>
            </section>
        </main>
    );
}