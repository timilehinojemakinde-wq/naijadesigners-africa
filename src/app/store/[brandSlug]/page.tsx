import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { MapPin } from "lucide-react";

type Props = {
    params: Promise<{ brandSlug: string }>;
};

export default async function PublicStorePage({ params }: Props) {
    const { brandSlug } = await params;

    // Fetch designer by slug
    const { data: designer, error: designerError } = await supabase
        .from("designers")
        .select("id, brand_name, slug, bio, profile_image, cover_image, business_location, location, intagram_handle")
        .eq("slug", brandSlug)
        .single();

    if (designerError || !designer) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-[#fafafa] px-5">
                <div className="text-center">
                    <h1 className="text-2xl font-bold">Store not found</h1>
                    <p className="mt-2 text-gray-500">
                        This store doesn't exist or may have moved.
                    </p>
                </div>
            </main>
        );
    }

    // Fetch active products
    const { data: products } = await supabase
        .from("products")
        .select("id, name, price, currency, hero_media, hero_media_type, slug, description")
        .eq("designer_id", designer.id)
        .eq("active", true)
        .order("created_at", { ascending: false });

    const displayLocation = designer.business_location ?? designer.location ?? "";

    return (
        <main className="min-h-screen bg-[#fafafa] pb-20">
            {/* COVER */}
            {designer.cover_image && (
                <div className="h-40 w-full overflow-hidden bg-gray-100">
                    <img src={designer.cover_image} alt="Cover" className="h-full w-full object-cover" />
                </div>
            )}

            {/* BRAND HEADER */}
            <section className={`px-5 ${designer.cover_image ? "-mt-8" : "pt-8"}`}>
                <div className="rounded-[20px] bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-4">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border-2 border-white bg-gray-100 shadow">
                            {designer.profile_image ? (
                                <img src={designer.profile_image} alt={designer.brand_name} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-emerald-100 text-xl font-bold text-emerald-600">
                                    {designer.brand_name?.[0]?.toUpperCase() ?? "?"}
                                </div>
                            )}
                        </div>
                        <div>
                            <h1 className="text-xl font-bold">{designer.brand_name}</h1>
                            {displayLocation && (
                                <p className="mt-0.5 flex items-center gap-1 text-sm text-gray-500">
                                    <MapPin size={12} />
                                    {displayLocation}
                                </p>
                            )}
                        </div>
                    </div>

                    {designer.bio && (
                        <p className="mt-4 text-sm leading-relaxed text-gray-600">{designer.bio}</p>
                    )}

                    <button className="mt-5 w-full rounded-[12px] bg-emerald-600 py-3 text-sm font-medium text-white">
                        Contact Designer
                    </button>
                </div>
            </section>

            {/* PRODUCTS */}
            <section className="mt-6 px-5">
                <div className="mb-4 flex items-center justify-between">
                    <h2 className="font-semibold">
                        Products{" "}
                        <span className="text-sm font-normal text-gray-400">
                            ({products?.length ?? 0})
                        </span>
                    </h2>
                </div>

                {!products || products.length === 0 ? (
                    <div className="rounded-[16px] border border-dashed border-gray-300 bg-white p-8 text-center">
                        <p className="font-medium text-gray-700">No products yet</p>
                        <p className="mt-1 text-sm text-gray-500">
                            This designer hasn't uploaded any products yet.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-4">
                        {products.map((product) => (
                            <Link
                                key={product.id}
                                href={`/store/${brandSlug}/${product.slug}`}
                                className="overflow-hidden rounded-[16px] bg-white shadow-sm"
                            >
                                <div className="h-[160px] w-full overflow-hidden bg-gray-100">
                                    {product.hero_media ? (
                                        product.hero_media_type === "video" ? (
                                            <video src={product.hero_media} className="h-full w-full object-cover" />
                                        ) : (
                                            <img src={product.hero_media} alt={product.name} className="h-full w-full object-cover" />
                                        )
                                    ) : (
                                        <div className="flex h-full w-full items-center justify-center text-4xl">👗</div>
                                    )}
                                </div>
                                <div className="p-3">
                                    <h3 className="truncate text-sm font-semibold">{product.name}</h3>
                                    <p className="mt-1 text-sm font-bold text-emerald-600">
                                        {product.currency} {Number(product.price).toLocaleString()}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </section>
        </main>
    );
}