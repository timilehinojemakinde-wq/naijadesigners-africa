"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { useProductDraft } from "../layout";

const CATEGORY_MAP: Record<string, string> = {
    "Aso Ebi": "7edf00f7-a6db-4c36-8735-fe0a98e9e7c9",
    "Wedding": "78a5f5d2-1d8c-4ab2-b20b-bddc4b6c58f2",
    "Native Wear": "a18cc346-343c-4954-9e9f-4e79ca4b48e3",
    "Luxury": "a0442df3-2951-4fa8-be8e-acfeff1c0a30",
    "Corporate": "0e4c59e2-05bb-4e54-a736-61ea218e2372",
    "Casual": "f8349bdd-7723-450e-824d-26ea49b9393b",
    "Streetwear": "afdfe9a7-457c-409b-8cbb-d448357fe7e2",
    "Ready to Wear": "ba8bf702-30fc-4bef-aae7-1281b2cba0f1",
    "Agbada": "52d95af1-1984-4573-9d3f-340320cc1e32",
    "Bridal": "edc3d1c6-801a-4b6f-bcc3-9ddf3efa6076",
    "Senator": "f86f5717-1ae5-4954-bba5-8ca0ba73a858",
    "Kids Wear": "3fb35afa-a880-4939-848d-df35e9700e71",
    "Women's Wear": "1590fd08-1276-488e-ab5d-da331b15701b",
    "Men's Wear": "615a452f-34b8-4019-ba16-c264f3223223",
    "Unisex": "441232a5-20a4-4a83-95ce-925d52fdef51",
};

export default function PublishPage() {
    const router = useRouter();
    const { draft, setDraft } = useProductDraft();
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const hasRun = useRef(false);

    useEffect(() => {
        if (hasRun.current) return;
        hasRun.current = true;

        const publishProduct = async () => {
            if (!draft) {
                setErrorMsg("No draft found. Go back and fill the form again.");
                return;
            }

            try {
                const { data: { user }, error: authError } = await supabase.auth.getUser();

                if (authError || !user) {
                    setErrorMsg("Not logged in: " + JSON.stringify(authError));
                    return;
                }

                const missing = draft.media.find((m) => !m.url);
                if (missing) {
                    setErrorMsg("Some media hasn't finished uploading. Please go back and wait.");
                    return;
                }

                const uploadedUrls = draft.media.map((m) => ({ url: m.url!, type: m.type }));
                const categoryId = CATEGORY_MAP[draft.category] ?? null;
                const slug =
                    draft.name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") +
                    "-" + Date.now();

                const { error: insertError } = await supabase
                    .from("products")
                    .insert({
                        designer_id: user.id,
                        name: draft.name,
                        slug,
                        description: draft.description,
                        currency: draft.currency,
                        price: parseFloat(draft.price),
                        category_id: categoryId,
                        made_to_measure: draft.productType === "custom" || draft.productType === "both",
                        active: true,
                        hero_media: uploadedUrls[0]?.url ?? null,
                        hero_media_type: uploadedUrls[0]?.type ?? "image",
                        image_url: uploadedUrls[0]?.url ?? null,
                        sub_image_1: uploadedUrls[1]?.url ?? null,
                        sub_image_2: uploadedUrls[2]?.url ?? null,
                        sub_image_3: uploadedUrls[3]?.url ?? null,
                    });

                if (insertError) {
                    setErrorMsg("Database insert failed: " + insertError.message);
                    return;
                }

                setDraft(null);
                router.push("/designer-dashboard/add-product/success");
            } catch (err: any) {
                setErrorMsg("Unexpected error: " + (err?.message ?? JSON.stringify(err)));
            }
        };

        publishProduct();
    }, [draft, router, setDraft]);

    return (
        <main className="flex min-h-screen items-center justify-center bg-[#fafafa] px-5">
            <div className="text-center max-w-md">
                {!errorMsg ? (
                    <>
                        <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-gray-200 border-t-red-600" />
                        <h2 className="text-lg font-semibold">Publishing product...</h2>
                        <p className="mt-2 text-sm text-gray-500">Saving your product...</p>
                    </>
                ) : (
                    <>
                        <h2 className="text-lg font-semibold text-red-600">Something went wrong</h2>
                        <p className="mt-2 text-sm text-gray-700 break-words">{errorMsg}</p>
                        <button
                            onClick={() => router.push("/designer-dashboard/add-product/preview")}
                            className="mt-4 h-12 w-full rounded-[12px] bg-gray-900 text-white"
                        >
                            Go Back to Preview
                        </button>
                    </>
                )}
            </div>
        </main>
    );
}