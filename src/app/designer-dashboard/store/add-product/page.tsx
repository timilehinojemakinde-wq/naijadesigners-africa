"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

export default function AddProductPage() {
    const router = useRouter();

    // FORM STATE
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [currency, setCurrency] = useState("NGN");
    const [categoryId, setCategoryId] = useState("");
    const [gender, setGender] = useState("Unisex");
    const [productType, setProductType] = useState("both");

    // MEDIA
    const [heroFile, setHeroFile] = useState<File | null>(null);
    const [heroType, setHeroType] = useState<"image" | "video">("image");

    const [sub1, setSub1] = useState<File | null>(null);
    const [sub2, setSub2] = useState<File | null>(null);
    const [sub3, setSub3] = useState<File | null>(null);

    const [loading, setLoading] = useState(false);

    const slugify = (text: string) =>
        text.toLowerCase().trim().replace(/\s+/g, "-");

    const uploadFile = async (file: File) => {
        const fileName = `${Date.now()}-${file.name}`;

        const { error } = await supabase.storage
            .from("products")
            .upload(fileName, file);

        if (error) throw error;

        const { data } = supabase.storage
            .from("products")
            .getPublicUrl(fileName);

        return data.publicUrl;
    };

    const handleSubmit = async () => {
        try {
            setLoading(true);

            const {
                data: { session },
            } = await supabase.auth.getSession();

            if (!session?.user) {
                alert("Please login");
                return;
            }

            const user = session.user;

            // HERO UPLOAD
            let heroUrl = "";
            if (heroFile) {
                heroUrl = await uploadFile(heroFile);
            }

            // SUB IMAGES
            let sub1Url = sub1 ? await uploadFile(sub1) : "";
            let sub2Url = sub2 ? await uploadFile(sub2) : "";
            let sub3Url = sub3 ? await uploadFile(sub3) : "";

            const slug = slugify(name);

            const { error } = await supabase.from("products").insert({
                designer_id: user.id,
                name,
                slug,
                description,
                category_id: categoryId,
                gender,
                price: Number(price),
                made_to_measure: productType,
                active: true,
                hero_media: heroUrl,
                hero_media_type: heroType,
                sub_image_1: sub1Url,
                sub_image_2: sub2Url,
                sub_image_3: sub3Url,
                currency,
            });

            if (error) {
                console.error(error);
                alert(error.message);
                return;
            }

            alert("Product created successfully");

            router.push("/designer-dashboard/store");
        } catch (err: any) {
            console.error(err);
            alert(err.message || "Error creating product");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">

            {/* HERO MEDIA */}
            <div>
                <h2 className="font-bold mb-2">Hero Media (Image or Video)</h2>

                <select
                    value={heroType}
                    onChange={(e) => setHeroType(e.target.value as any)}
                >
                    <option value="image">Image</option>
                    <option value="video">Video</option>
                </select>

                <input
                    type="file"
                    accept={heroType === "image" ? "image/*" : "video/*"}
                    onChange={(e) => setHeroFile(e.target.files?.[0] || null)}
                />
            </div>

            {/* SUB IMAGES */}
            <div>
                <h2 className="font-bold">Supporting Images (optional)</h2>

                <input type="file" onChange={(e) => setSub1(e.target.files?.[0] || null)} />
                <input type="file" onChange={(e) => setSub2(e.target.files?.[0] || null)} />
                <input type="file" onChange={(e) => setSub3(e.target.files?.[0] || null)} />
            </div>

            {/* DETAILS */}
            <input
                placeholder="Product Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
            />

            <textarea
                placeholder="Description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
            />

            {/* CATEGORY */}
            <input
                placeholder="Category ID"
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
            />

            {/* GENDER */}
            <select value={gender} onChange={(e) => setGender(e.target.value)}>
                <option>Male</option>
                <option>Female</option>
                <option>Unisex</option>
            </select>

            {/* PRODUCT TYPE */}
            <select
                value={productType}
                onChange={(e) => setProductType(e.target.value)}
            >
                <option value="rtw">Ready to Wear</option>
                <option value="mtm">Custom Measurement</option>
                <option value="both">Both Options</option>
            </select>

            {/* PRICE */}
            <select value={currency} onChange={(e) => setCurrency(e.target.value)}>
                <option value="NGN">NGN</option>
                <option value="USD">USD</option>
                <option value="GBP">GBP</option>
                <option value="EUR">EUR</option>
            </select>

            <input
                type="number"
                placeholder="Price"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
            />

            {/* SUBMIT */}
            <button
                onClick={handleSubmit}
                disabled={loading}
                className="bg-black text-white px-4 py-2"
            >
                {loading ? "Saving..." : "Save Product"}
            </button>
        </div>
    );
}
