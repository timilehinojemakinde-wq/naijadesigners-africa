import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { notFound } from "next/navigation";
import Link from "next/link";
import { MapPin } from "lucide-react";

type Props = {
    params: Promise<{ slug: string }>;
};

export default async function PublicCataloguePage({ params }: Props) {
    const supabase = await createSupabaseServerClient();
    const { slug } = await params;

    const { data: designer, error: designerError } = await supabase
        .from("designers")
        .select("id, brand_name, profile_image, banner_image, business_location, bio, slug")
        .eq("slug", slug)
        .single();

    if (designerError || !designer) notFound();

    const { data: styles } = await supabase
        .from("styles")
        .select("id, title, category, images, notes")
        .eq("designer_id", designer.id)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

    return (
        <main className="min-h-screen bg-white pb-20">
            {/* BANNER HEADER */}
            <header className="relative h-56 w-full overflow-hidden bg-gray-900">
                {designer.banner_image ? (
                    <img
                        src={designer.banner_image}
                        alt=""
                        className="absolute inset-0 h-full w-full object-cover"
                    />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-emerald-700 via-emerald-800 to-gray-900" />
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
                    Browse the collection below and tap any style you love —
                    we'll send your pick straight to {designer.brand_name}.
                </p>
            </div>

            {/* STYLES — MASONRY */}
            <div className="px-5 pt-5">
                {!styles || styles.length === 0 ? (
                    <div className="rounded-2xl bg-gray-50 p-10 text-center">
                        <p className="font-medium text-gray-700">No styles published yet</p>
                        <p className="mt-1 text-sm text-gray-400">
                            Check back soon for new collections.
                        </p>
                    </div>
                ) : (
                    <>
                        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
                            {styles.length} Style{styles.length !== 1 ? "s" : ""}
                        </p>

                        <div className="columns-2 gap-3 [&>*]:mb-4">
                            {styles.map((style) => (
                                <Link
                                    key={style.id}
                                    href={`/catalogue/${slug}/style/${style.id}`}
                                    className="block break-inside-avoid"
                                >
                                    <div className="overflow-hidden rounded-2xl bg-gray-100">
                                        {style.images?.[0] ? (
                                            <img
                                                src={style.images[0]}
                                                alt={style.title ?? "Style"}
                                                className="w-full h-auto object-cover"
                                            />
                                        ) : (
                                            <div className="flex aspect-[3/4] w-full items-center justify-center text-gray-300 text-3xl">
                                                👗
                                            </div>
                                        )}
                                    </div>
                                    <p className="mt-2 truncate text-sm font-semibold text-gray-900">
                                        {style.title ?? "Untitled"}
                                    </p>
                                    {style.category && (
                                        <p className="text-xs text-gray-400">
                                            {style.category}
                                        </p>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </>
                )}
            </div>

            {/* POWERED BY */}
            <p className="mt-8 text-center text-xs text-gray-400">
                Powered by{" "}
                <Link href="/" className="font-semibold text-emerald-600">
                    FitHouseAfrica
                </Link>
            </p>
        </main>
    );
}
