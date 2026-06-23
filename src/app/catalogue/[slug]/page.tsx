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
        .select("id, brand_name, profile_image, business_location, bio, slug")
        .eq("slug", slug)
        .single();

    if (designerError || !designer) notFound();

    const { data: styles } = await supabase
        .from("styles")
        .select("id, title, category, images, notes")
        .eq("designer_id", designer.id)
        .eq("is_published", true)
        .order("created_at", { ascending: false });

    const categories = [...new Set((styles ?? []).map(s => s.category).filter(Boolean))];

    return (
        <main className="min-h-screen bg-gray-50 pb-20">
            {/* HEADER */}
            <header className="bg-white border-b border-gray-100 px-5 py-4">
                <div className="mx-auto max-w-md">
                    <p className="text-xs text-gray-400">Style Catalogue</p>
                    <h1 className="text-lg font-bold text-gray-900">
                        {designer.brand_name}
                    </h1>
                </div>
            </header>

            <div className="mx-auto max-w-md px-5 py-5 space-y-5">

                {/* DESIGNER PROFILE */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <div className="flex items-center gap-3">
                        <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-full bg-emerald-100">
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
                        <div>
                            <h2 className="font-bold text-gray-900">
                                {designer.brand_name}
                            </h2>
                            {designer.business_location && (
                                <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                                    <MapPin size={10} />
                                    {designer.business_location}
                                </p>
                            )}
                        </div>
                    </div>
                    {designer.bio && (
                        <p className="mt-3 text-sm leading-relaxed text-gray-500">
                            {designer.bio}
                        </p>
                    )}
                </section>

                {/* STYLES */}
                {!styles || styles.length === 0 ? (
                    <div className="rounded-2xl bg-white p-10 text-center shadow-sm">
                        <p className="font-medium text-gray-700">No styles published yet</p>
                        <p className="mt-1 text-sm text-gray-400">
                            Check back soon for new collections.
                        </p>
                    </div>
                ) : (
                    <>
                        <div className="flex items-center justify-between">
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                                {styles.length} Style{styles.length !== 1 ? "s" : ""}
                            </p>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            {styles.map((style) => (
                                <Link
                                    key={style.id}
                                    href={`/catalogue/${slug}/style/${style.id}`}
                                    className="overflow-hidden rounded-2xl bg-white shadow-sm"
                                >
                                    <div className="aspect-[3/4] w-full overflow-hidden bg-gray-100">
                                        {style.images?.[0] ? (
                                            <img
                                                src={style.images[0]}
                                                alt={style.title ?? "Style"}
                                                className="h-full w-full object-cover"
                                            />
                                        ) : (
                                            <div className="flex h-full w-full items-center justify-center text-gray-300 text-3xl">
                                                👗
                                            </div>
                                        )}
                                    </div>
                                    <div className="p-3">
                                        <p className="truncate text-sm font-semibold text-gray-900">
                                            {style.title ?? "Untitled"}
                                        </p>
                                        {style.category && (
                                            <p className="mt-0.5 text-xs text-gray-400">
                                                {style.category}
                                            </p>
                                        )}
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </>
                )}

                {/* POWERED BY */}
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