import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import CheckoutForm from "@/components/store/CheckoutForm";

type Props = {
    params: Promise<{ slug: string; id: string }>;
};

type MediaEntry = { type: "image" | "video"; url: string };

export default async function PublicProductPage({ params }: Props) {
    const { slug, id } = await params;
    const supabase = await createSupabaseServerClient();

    const { data: designer } = await supabase
        .from("designers")
        .select("id, brand_name, slug")
        .eq("slug", slug)
        .single();

    if (!designer) notFound();

    const { data: product, error } = await supabase
        .from("products")
        .select("id, name, description, category, product_type, media, hero_media, hero_media_type, price, currency, active")
        .eq("id", id)
        .eq("designer_id", designer.id)
        .eq("active", true)
        .single();

    if (error || !product) notFound();

    const mediaList: MediaEntry[] =
        product.media && product.media.length > 0
            ? product.media
            : product.hero_media
                ? [{ type: (product.hero_media_type ?? "image") as "image" | "video", url: product.hero_media }]
                : [];

    return (
        <main className="min-h-screen bg-gray-50 pb-10">
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white px-5 py-4">
                <div className="mx-auto flex max-w-md items-center gap-3">
                    <Link
                        href={`/store/${slug}`}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200"
                    >
                        <ArrowLeft size={16} />
                    </Link>
                    <div>
                        <p className="text-xs text-gray-400">{designer.brand_name}</p>
                        <h1 className="text-base font-bold text-gray-900">{product.name}</h1>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-md space-y-4 px-5 py-4">

                {mediaList.length > 0 && (
                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                        <div className="aspect-[3/4] w-full bg-gray-100">
                            {mediaList[0].type === "video" ? (
                                <video src={mediaList[0].url} controls className="h-full w-full object-cover" />
                            ) : (
                                <img src={mediaList[0].url} alt={product.name} className="h-full w-full object-cover" />
                            )}
                        </div>
                        {mediaList.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto p-3">
                                {mediaList.slice(1).map((m, i) => (
                                    <div key={i} className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl">
                                        {m.type === "video" ? (
                                            <video src={m.url} className="h-full w-full object-cover" />
                                        ) : (
                                            <img src={m.url} alt="" className="h-full w-full object-cover" />
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900">{product.name}</h2>
                    <p className="mt-1 text-xl font-bold text-gray-900">
                        {formatCurrency(Number(product.price), product.currency)}
                    </p>

                    <div className="mt-3 flex flex-wrap gap-2">
                        {product.category && (
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                {product.category}
                            </span>
                        )}
                        {product.product_type && (
                            <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                                {product.product_type === "ready-made"
                                    ? "Ready Made"
                                    : product.product_type === "custom"
                                        ? "Custom Measurement"
                                        : "Ready Made & Custom"}
                            </span>
                        )}
                    </div>

                    {product.description && (
                        <p className="mt-3 text-sm leading-relaxed text-gray-600">
                            {product.description}
                        </p>
                    )}
                </section>

                <CheckoutForm
                    productId={product.id}
                    productName={product.name}
                    price={Number(product.price)}
                    currency={product.currency}
                    slug={slug}
                />

                <p className="text-center text-xs text-gray-400">
                    Powered by{" "}
                    <Link href="/" className="font-semibold text-emerald-600">
                        FitHouseAfrica
                    </Link>
                </p>
            </div>
        </main>
    );
}
