import { supabase } from "@/lib/supabaseClient";
import { notFound } from "next/navigation";
import Link from "next/link";

type Props = {
    params: Promise<{ slug: string; styleId: string }>;
};

export default async function PublicStylePage({ params }: Props) {
    const { slug, styleId } = await params;

    const { data: designer } = await supabase
        .from("designers")
        .select("id, brand_name, profile_image, slug")
        .eq("slug", slug)
        .single();

    if (!designer) notFound();

    const { data: style, error } = await supabase
        .from("styles")
        .select("*")
        .eq("id", styleId)
        .eq("designer_id", designer.id)
        .eq("is_published", true)
        .single();

    if (error || !style) notFound();

    const images = style.images ?? [];

    return (
        <main className="min-h-screen bg-gray-50 pb-28">
            {/* HEADER */}
            <header className="bg-white border-b border-gray-100 px-5 py-4">
                <div className="mx-auto flex max-w-md items-center gap-3">
                    <Link
                        href={`/catalogue/${slug}`}
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200 bg-white text-sm"
                    >
                        ←
                    </Link>
                    <div>
                        <p className="text-xs text-gray-400">{designer.brand_name}</p>
                        <h1 className="text-base font-bold text-gray-900">
                            {style.title ?? "Style"}
                        </h1>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-md space-y-4 px-5 py-4">

                {/* IMAGES */}
                {images.length > 0 && (
                    <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
                        <div className="aspect-[3/4] w-full overflow-hidden">
                            <img
                                src={images[0]}
                                alt={style.title ?? "Style"}
                                className="h-full w-full object-cover"
                            />
                        </div>
                        {images.length > 1 && (
                            <div className="flex gap-2 overflow-x-auto p-3">
                                {images.slice(1).map((img: string, i: number) => (
                                    <div
                                        key={i}
                                        className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl"
                                    >
                                        <img
                                            src={img}
                                            alt=""
                                            className="h-full w-full object-cover"
                                        />
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* DETAILS */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <h2 className="text-lg font-bold text-gray-900">
                        {style.title ?? "Untitled Style"}
                    </h2>
                    {style.category && (
                        <span className="mt-2 inline-block rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                            {style.category}
                        </span>
                    )}
                    {style.notes && (
                        <p className="mt-3 text-sm leading-relaxed text-gray-600">
                            {style.notes}
                        </p>
                    )}
                </section>

                {/* POWERED BY */}
                <p className="text-center text-xs text-gray-400">
                    Powered by{" "}
                    <Link href="/" className="font-semibold text-emerald-600">
                        FitHouseAfrica
                    </Link>
                </p>
            </div>

            {/* STICKY CTA */}
            <div className="fixed bottom-0 left-0 right-0 border-t border-gray-100 bg-white px-5 py-4">
                <div className="mx-auto max-w-md">
                    <Link
                        href={`/catalogue/${slug}/request?styleId=${styleId}`}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-semibold text-white"
                    >
                        I Want This Style →
                    </Link>
                    <p className="mt-2 text-center text-xs text-gray-400">
                        Send your request directly to {designer.brand_name}
                    </p>
                </div>
            </div>
        </main>
    );
}