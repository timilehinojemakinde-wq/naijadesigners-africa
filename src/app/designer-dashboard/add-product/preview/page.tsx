"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

type MediaItem = {
    preview: string;
    type: "image" | "video";
};

export default function PreviewPage() {
    const router = useRouter();

    const [product, setProduct] = useState<any>(null);

    useEffect(() => {
        const data = sessionStorage.getItem("newProduct");

        if (!data) {
            router.push("/designer-dashboard/add-product");
            return;
        }

        setProduct(JSON.parse(data));
    }, [router]);

    const handlePublish = async () => {
        // MOCK PUBLISH (backend later)
        console.log("Publishing product:", product);

        router.push(
            "/designer-dashboard/add-product/publish"
        );
    };

    if (!product) return null;

    const media: MediaItem[] = product.media || [];

    const hero = media[0];
    const gallery = media.slice(1);

    return (
        <main className="min-h-screen bg-[#fafafa] pb-24">
            {/* HEADER */}
            <header className="sticky top-0 border-b bg-white">
                <div className="flex items-center gap-3 px-5 py-4">
                    <button
                        onClick={() => router.back()}
                        className="rounded-[12px] border p-2"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <h1 className="text-lg font-bold">
                        Preview Product
                    </h1>
                </div>
            </header>

            <section className="mx-auto max-w-md px-5 py-6">
                {/* HERO MEDIA */}
                <div className="rounded-[12px] bg-white p-4 shadow-sm">
                    {hero?.type === "video" ? (
                        <video
                            src={hero.preview}
                            controls
                            className="h-[320px] w-full rounded-[12px] object-contain"
                        />
                    ) : (
                        <img
                            src={hero?.preview}
                            className="h-[320px] w-full rounded-[12px] object-contain"
                        />
                    )}
                </div>

                {/* GALLERY */}
                {gallery.length > 0 && (
                    <div className="mt-4 flex gap-3 overflow-x-auto">
                        {gallery.map((item, i) => (
                            <div
                                key={i}
                                className="h-[80px] w-[80px] flex-shrink-0 rounded-[12px] border bg-white"
                            >
                                {item.type === "video" ? (
                                    <video
                                        src={item.preview}
                                        className="h-full w-full rounded-[12px] object-cover"
                                    />
                                ) : (
                                    <img
                                        src={item.preview}
                                        className="h-full w-full rounded-[12px] object-cover"
                                    />
                                )}
                            </div>
                        ))}
                    </div>
                )}

                {/* DETAILS */}
                <div className="mt-6 rounded-[12px] bg-white p-5 shadow-sm">
                    <h2 className="text-xl font-bold">
                        {product.name}
                    </h2>

                    <p className="mt-2 text-gray-600">
                        {product.description}
                    </p>

                    <div className="mt-4 flex justify-between text-sm">
                        <span>
                            {product.category}
                        </span>

                        <span>
                            {product.productType}
                        </span>
                    </div>

                    <div className="mt-4 text-xl font-bold text-red-600">
                        {product.currency}{" "}
                        {product.price}
                    </div>
                </div>

                {/* CTA */}
                <button
                    onClick={handlePublish}
                    className="mt-6 h-14 w-full rounded-[12px] bg-red-600 font-medium text-white"
                >
                    Publish to Store
                </button>
            </section>
        </main>
    );
}
