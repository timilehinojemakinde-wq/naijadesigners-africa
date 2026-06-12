"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function PublishPage() {
    const router = useRouter();

    useEffect(() => {
        const publishProduct = async () => {
            const data = sessionStorage.getItem("newProduct");

            if (!data) {
                router.push("/designer-dashboard/add-product");
                return;
            }

            const product = JSON.parse(data);

            // MOCK API CALL (Supabase later)
            console.log("Publishing:", product);

            await new Promise((res) =>
                setTimeout(res, 1500)
            );

            router.push(
                "/designer-dashboard/add-product/success"
            );
        };

        publishProduct();
    }, [router]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#fafafa]">
            <div className="text-center">
                <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />

                <h2 className="text-lg font-semibold">
                    Publishing product...
                </h2>

                <p className="mt-2 text-sm text-gray-500">
                    Please wait while we add your product to store
                </p>
            </div>
        </main>
    );
}
