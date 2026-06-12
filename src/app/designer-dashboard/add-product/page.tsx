"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Plus, X } from "lucide-react";

type MediaFile = {
    file: File;
    preview: string;
    type: "image" | "video";
};

export default function AddProductPage() {
    const router = useRouter();

    const [media, setMedia] = useState<MediaFile[]>([]);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [category, setCategory] = useState("");
    const [productType, setProductType] =
        useState("both");

    const [currency, setCurrency] =
        useState("NGN");

    const [price, setPrice] =
        useState("");

    // UPLOAD MEDIA
    const handleMediaUpload = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        const files = Array.from(
            e.target.files || []
        );
        if (!files.length) return;

        const remainingSlots =
            4 - media.length;

        const selectedFiles =
            files.slice(0, remainingSlots);

        const mappedFiles: MediaFile[] = selectedFiles.map(
            (file) => ({
                file,
                preview:
                    URL.createObjectURL(file),
                type: file.type.startsWith(
                    "video"
                )
                    ? "video"
                    : "image",
            })
        );

        setMedia((prev) => [...prev, ...mappedFiles]);
    };

    // REMOVE MEDIA
    const removeMedia = (
        index: number
    ) => {
        setMedia((prev) =>
            prev.filter(
                (_, i) => i !== index
            )
        );
    };

    // HERO = FIRST MEDIA
    const heroMedia = media[0];
    const supportingMedia =
        media.slice(1);

    const handleContinue = () => {
        if (!media.length) {
            alert(
                "Please upload at least one product image or video."
            );
            return;
        }

        if (!name.trim()) {
            alert(
                "Please enter product name."
            );
            return;
        }

        const productData = {
            media,
            name,
            description,
            category,
            productType,
            currency,
            price,
        };

        sessionStorage.setItem(
            "newProduct",
            JSON.stringify(productData)
        );

        router.push(
            "/designer-dashboard/add-product/preview"
        );
    };

    return (
        <main className="min-h-screen bg-[#fafafa] pb-24">
            {/* HEADER */}
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white">
                <div className="flex items-center gap-4 px-5 py-4">
                    <button
                        onClick={() =>
                            router.push(
                                "/designer-dashboard"
                            )
                        }
                        className="rounded-[12px] border border-gray-200 p-2"
                    >
                        <ArrowLeft size={18} />
                    </button>

                    <div>
                        <h1 className="text-xl font-bold">
                            Add Product
                        </h1>

                        <p className="text-sm text-gray-500">
                            Upload media and
                            product details
                        </p>
                    </div>
                </div>
            </header>

            <section className="mx-auto max-w-md px-5 py-6">
                {/* MEDIA */}
                <div className="rounded-[12px] bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold">
                        Product Media
                    </h2>

                    <p className="mt-1 text-sm text-gray-500">
                        Upload up to 4
                        photos or videos.
                        First upload becomes
                        your main display
                        media.
                    </p>

                    {/* HERO PREVIEW */}
                    {heroMedia ? (
                        <div className="mt-5 overflow-hidden rounded-[12px] border border-gray-200 bg-gray-50">
                            {heroMedia.type ===
                                "video" ? (
                                <video
                                    src={
                                        heroMedia.preview
                                    }
                                    controls
                                    className="h-[320px] w-full object-contain"
                                />
                            ) : (
                                <img
                                    src={
                                        heroMedia.preview
                                    }
                                    alt="Hero"
                                    className="h-[320px] w-full object-contain"
                                />
                            )}
                        </div>
                    ) : (
                        <label className="mt-5 flex h-[260px] cursor-pointer flex-col items-center justify-center rounded-[12px] border-2 border-dashed border-gray-300 bg-gray-50 transition hover:border-red-400">
                            <Plus
                                size={32}
                            />

                            <p className="mt-3 text-sm text-gray-600">
                                Tap to upload
                                product media
                            </p>

                            <input
                                hidden
                                multiple
                                type="file"
                                accept="image/*,video/*"
                                onChange={
                                    handleMediaUpload
                                }
                            />
                        </label>
                    )}

                    {/* SUPPORTING MEDIA */}
                    {media.length >
                        0 && (
                            <div className="mt-4 flex gap-3 overflow-x-auto pb-2">
                                {media.map(
                                    (
                                        item,
                                        index
                                    ) => (
                                        <div
                                            key={
                                                index
                                            }
                                            className="relative flex-shrink-0"
                                        >
                                            {item.type ===
                                                "video" ? (
                                                <video
                                                    src={
                                                        item.preview
                                                    }
                                                    className={`h-[90px] w-[90px] rounded-[12px] border object-cover ${index ===
                                                            0
                                                            ? "border-red-600"
                                                            : "border-gray-200"
                                                        }`}
                                                />
                                            ) : (
                                                <img
                                                    src={
                                                        item.preview
                                                    }
                                                    alt=""
                                                    className={`h-[90px] w-[90px] rounded-[12px] border object-cover ${index ===
                                                            0
                                                            ? "border-red-600"
                                                            : "border-gray-200"
                                                        }`}
                                                />
                                            )}

                                            {/* REMOVE */}
                                            <button
                                                onClick={() =>
                                                    removeMedia(
                                                        index
                                                    )
                                                }
                                                className="absolute right-1 top-1 rounded-full bg-black/70 p-1 text-white"
                                            >
                                                <X
                                                    size={
                                                        14
                                                    }
                                                />
                                            </button>

                                            {/* HERO LABEL */}
                                            {index ===
                                                0 && (
                                                    <span className="absolute bottom-1 left-1 rounded bg-red-600 px-2 py-1 text-[10px] text-white">
                                                        Hero
                                                    </span>
                                                )}
                                        </div>
                                    )
                                )}

                                {/* ADD MORE */}
                                {media.length <
                                    4 && (
                                        <label className="flex h-[90px] w-[90px] cursor-pointer items-center justify-center rounded-[12px] border-2 border-dashed border-gray-300 bg-gray-50">
                                            <Plus
                                                size={
                                                    22
                                                }
                                            />

                                            <input
                                                hidden
                                                multiple
                                                type="file"
                                                accept="image/*,video/*"
                                                onChange={
                                                    handleMediaUpload
                                                }
                                            />
                                        </label>
                                    )}
                            </div>
                        )}
                </div>

                {/* PRODUCT DETAILS */}
                <div className="mt-6 rounded-[12px] bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold">
                        Product Details
                    </h2>

                    <input
                        placeholder="Product Name"
                        value={name}
                        onChange={(e) =>
                            setName(
                                e.target
                                    .value
                            )
                        }
                        className="mt-4 h-14 w-full rounded-[12px] border border-gray-200 px-4 outline-none focus:border-red-500"
                    />

                    <textarea
                        placeholder="Example: Luxury handmade senator outfit crafted with premium fabric for weddings, owambe and special occasions."
                        value={
                            description
                        }
                        onChange={(e) =>
                            setDescription(
                                e.target
                                    .value
                            )
                        }
                        className="mt-4 min-h-[140px] w-full rounded-[12px] border border-gray-200 p-4 outline-none focus:border-red-500"
                    />

                    <select
                        value={category}
                        onChange={(e) =>
                            setCategory(
                                e.target
                                    .value
                            )
                        }
                        className="mt-4 h-14 w-full rounded-[12px] border border-gray-200 px-4"
                    >
                        <option value="">
                            Select Category
                        </option>
                        <option>
                            Agbada
                        </option>
                        <option>
                            Senator
                        </option>
                        <option>
                            Kaftan
                        </option>
                        <option>
                            Wedding Dress
                        </option>
                        <option>
                            Aso Ebi
                        </option>
                        <option>
                            Native Wear
                        </option>
                        <option>
                            Suit
                        </option>
                    </select>

                    <select
                        value={
                            productType
                        }
                        onChange={(e) =>
                            setProductType(
                                e.target
                                    .value
                            )
                        }
                        className="mt-4 h-14 w-full rounded-[12px] border border-gray-200 px-4"
                    >
                        <option value="ready-made">
                            Ready Made
                        </option>

                        <option value="custom">
                            Custom
                            Measurement
                        </option>

                        <option value="both">
                            Both
                        </option>
                    </select>
                </div>

                {/* PRICING */}
                <div className="mt-6 rounded-[12px] bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-semibold">
                        Pricing
                    </h2>

                    <div className="mt-4 flex gap-3">
                        <select
                            value={
                                currency
                            }
                            onChange={(e) =>
                                setCurrency(
                                    e.target
                                        .value
                                )
                            }
                            className="h-14 rounded-[12px] border border-gray-200 px-4"
                        >
                            <option>
                                NGN
                            </option>
                            <option>
                                USD
                            </option>
                            <option>
                                GBP
                            </option>
                        </select>

                        <input
                            type="number"
                            placeholder="Price"
                            value={price}
                            onChange={(e) =>
                                setPrice(
                                    e.target
                                        .value
                                )
                            }
                            className="h-14 flex-1 rounded-[12px] border border-gray-200 px-4"
                        />
                    </div>
                </div>

                {/* CTA */}
                <button
                    onClick={
                        handleContinue
                    }
                    className="mt-8 h-14 w-full rounded-[12px] bg-red-600 font-medium text-white"
                >
                    Continue to Preview
                </button>
            </section>
        </main>
    );
}
