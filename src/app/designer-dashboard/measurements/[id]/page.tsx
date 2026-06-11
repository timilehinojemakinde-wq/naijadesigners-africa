import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default function MeasurementDetailsPage({
    params,
}: {
    params: { id: string };
}) {
    return (
        <main className="min-h-screen bg-[#fafafa] px-5 py-6 text-black">
            <Link
                href="/designer-dashboard/measurements"
                className="inline-flex items-center gap-2 rounded-[12px] border border-gray-200 bg-white px-4 py-3 text-sm font-medium"
            >
                <ArrowLeft size={16} />
                Back to measurements
            </Link>

            <section className="mt-8 rounded-[12px] border border-gray-200 bg-white p-5">
                <p className="text-sm text-gray-500">
                    Measurement profile
                </p>

                <h1 className="mt-1 text-2xl font-bold">
                    {params.id}
                </h1>

                <p className="mt-4 text-sm leading-6 text-gray-600">
                    Editable manual measurements will be added here before AI measurement integration.
                </p>
            </section>
        </main>
    );
}
