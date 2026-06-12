"use client";

import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";

export default function SuccessPage() {
    const router = useRouter();

    const handleViewStore = () => {
        router.push("/store");
    };

    const handleAddAnother = () => {
        router.push(
            "/designer-dashboard/add-product"
        );
    };

    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: "My Store on FitHouse Africa",
                text: "Check out my fashion store",
                url: window.location.origin,
            });
        } else {
            alert("Copy store link manually");
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#fafafa] px-5">
            <div className="w-full max-w-md rounded-[12px] bg-white p-6 text-center shadow-sm">
                {/* ICON */}
                <div className="flex justify-center">
                    <CheckCircle
                        size={60}
                        className="text-green-600"
                    />
                </div>

                {/* TEXT */}
                <h1 className="mt-4 text-2xl font-bold">
                    Product Published!
                </h1>

                <p className="mt-2 text-gray-600">
                    Your product is now live on your store.
                </p>

                {/* CTA BUTTONS */}
                <div className="mt-6 space-y-3">
                    <button
                        onClick={handleViewStore}
                        className="h-12 w-full rounded-[12px] bg-red-600 text-white"
                    >
                        View Store
                    </button>

                    <button
                        onClick={handleAddAnother}
                        className="h-12 w-full rounded-[12px] border border-gray-300"
                    >
                        Add Another Product
                    </button>

                    <button
                        onClick={handleShare}
                        className="h-12 w-full rounded-[12px] bg-black text-white"
                    >
                        Share Store Link
                    </button>
                </div>
            </div>
        </main>
    );
}
