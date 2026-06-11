
import { supabase } from "@/lib/supabaseClient";

export default async function StorePage({
    params,
}: {
    params: { brandSlug: string };
}) {
    const { data: products, error } = await supabase
        .from("products")
        .select("*")
        .eq("active", true)
        .eq("brand_slug", params.brandSlug);

    if (error) {
        return <div>Failed to load store</div>;
    }

    return (
        <div className="p-4">
            {/* HEADER */}
            <h1 className="text-2xl font-bold mb-4">
                {params.brandSlug} Store
            </h1>

            {/* GRID */}
            <div className="columns-2 md:columns-3 gap-3 space-y-3">
                {products?.map((product) => (
                    <div
                        key={product.id}
                        className="break-inside-avoid rounded-xl overflow-hidden bg-white shadow"
                    >
                        {/* HERO MEDIA */}
                        {product.hero_media_type === "video" ? (
                            <video
                                src={product.hero_media}
                                className="w-full object-cover"
                                muted
                                autoPlay
                                loop
                            />
                        ) : (
                            <img
                                src={product.hero_media}
                                className="w-full object-contain"
                            />
                        )}

                        {/* INFO */}
                        <div className="p-3">
                            <h2 className="font-medium">{product.name}</h2>
                            <p className="text-sm text-gray-500">
                                ₦{product.price}
                            </p>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
