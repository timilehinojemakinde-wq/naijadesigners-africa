import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";

type Props = {
    params: Promise<{ slug: string }>;
};

export default async function PublicStorePage({ params }: Props) {
    const supabase = await createSupabaseServerClient();
    const { slug } = await params;

    const { data: designer, error: designerError } = await supabase
        .from("designers")
        .select("id, brand_name, profile_image, banner_image_url, business_location, bio, slug")
        .eq("slug", slug)
        .single();

    if (designerError || !designer) notFound();

    const { data: products } = await supabase
        .from("products")
        .select("id, name, price, currency, hero_media, hero_media_type, category")
        .eq("designer_id", designer.id)
        .eq("active", true)
        .order("created_at", { ascending: false });

    return (
        <main className="min-h-screen bg-white pb-20">
            {/* BANNER HEADER */}
            <header className="relative h-56 w-full overflow-hidden bg-gray-900">
                {designer.banner_image_url ? (
                    <img
                        src={designer.banner_image_url}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-gray-800 via-gray-900 to-black" />
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/10" />

                <div className="absolute bottom-4 left-5 right-5 flex items-end gap-3">
                    <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-full border-2 border-white bg-emerald-100">
                        {designer.profile_image ? (
                            <img
                                src={designer.profile_image}
                                alt={designer.brand_name ?? ""}
                                className="h-full w-full object-cover"
                            />
                        ) : (
                            <div className="flex h-full w-full items-center justify-center text-xl font-bold text-emerald-700">
                                {designer.brand_name?.[0]?.toUpperCase()}
                            </div>
                        )}
                    </div>
                    <div className="pb-1">
                        <h1 className="text-lg font-bold text-white drop-shadow">
                            {designer.brand_name}
                        </h1>
                        {designer.business_location && (
                            <p className="mt-0.5 flex items-center gap-1 text-xs text-white/80">
                                <MapPin size={10} />
                                {designer.business_location}
                            </p>
                        )}
                    </div>
                </div>
            </header>

            <div className="px-5 pt-4">
                {designer.bio && (
                    <p className="text-sm leading-relaxed text-gray-600">
                        {designer.bio}
                    </p>
                )}
                <p className="mt-2 text-xs text-gray-400">
                    Shop the collection below — secure checkout, delivered by {designer.brand_name}.
                </p>
            </div>

            {/* PRODUCTS — E-COMMERCE GRID */}
            <div className="px-5 pt-5">
                {!products || products.length === 0 ? (
                    <div className="rounded-2xl bg-gray-50 p-10 text-center">
                        <p className="font-medium text-gray-700">No products yet</p>
                        <p className="mt-1 text-sm text-gray-400">
                            Check back soon for new arrivals.
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
                            {products.length} Item{products.length !== 1 ? "s" : ""}
                        </p>

                        <div className="grid grid-cols-2 gap-3">
                            {products.map((product) => (
                                <Link
                                    key={product.id}
                                    href={`/store/${slug}/product/${product.id}`}
                                    className="overflow-hidden rounded-2xl bg-white shadow-sm"
                                >
                                    <div className="aspect-[3/4] w-full overflow-hidden bg-gray-100">
                                        {product.hero_media ? (
                                            product.hero_media_type === "video" ? (
                                                <video
                                                    src={product.hero_media}
                                                    className="h-full w-full object-cover"
                                                />
                                            ) : (
                                                <img
                                                    src={product.hero_media}
                                                    alt={product.name}
                                                    className="h-full w-full object-cover"
                                                />
                                            )
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-gray-300 text-3xl">
                                                👗
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <p className="truncate text-sm font-semibold text-gray-900">
                                            {product.name}
                                        </p>
                                        <p className="mt-1 text-sm font-bold text-gray-900">
                                            {formatCurrency(Number(product.price), product.currency)}
                                        </p>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>

            <p className="mt-8 text-center text-xs text-gray-400">
                Powered by{" "}
                <Link href="/" className="font-semibold text-emerald-600">
                    FitHouseAfrica
                </Link>
            </p>
        </main>
    );
}
