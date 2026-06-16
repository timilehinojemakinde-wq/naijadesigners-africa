"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { CheckCircle } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

export default function SuccessPage() {
    const router = useRouter();
    const [storePath, setStorePath] = useState<string | null>(null);

    useEffect(() => {
        const getUser = async () => {
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                setStorePath(`/store/${user.id}`);
            }
        };
        getUser();
    }, []);

    const handleViewStore = () => {
        if (storePath) router.push(storePath);
    };

    const handleAddAnother = () => {
        router.push("/designer-dashboard/add-product");
    };

    const handleShare = () => {
        const fullUrl = storePath
            ? `${window.location.origin}${storePath}`
            : window.location.origin;

        if (navigator.share) {
            navigator.share({
                title: "My Store on FitHouse Africa",
                text: "Check out my fashion store",
                url: fullUrl,
            });
        } else {
            navigator.clipboard.writeText(fullUrl);
            alert("Store link copied to clipboard!");
        }
    };

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#fafafa] px-5">
            <div className="w-full max-w-md rounded-[12px] bg-white p-6 text-center shadow-sm">
                <div className="flex justify-center">
                    <CheckCircle size={60} className="text-green-600" />
                </div>

                <h1 className="mt-4 text-2xl font-bold">
                    Product Published!
                </h1>

                <p className="mt-2 text-gray-600">
                    Your product is now live on your store.
                </p>

                <div className="mt-6 space-y-3">
                    <button
                        onClick={handleViewStore}
                        disabled={!storePath}
                        className="h-12 w-full rounded-[12px] bg-red-600 text-white disabled:opacity-50"
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