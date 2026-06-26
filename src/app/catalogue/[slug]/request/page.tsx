"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Loader2, Check } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Style = {
    id: string;
    title: string | null;
    images: string[] | null;
    category: string | null;
};

type Designer = {
    id: string;
    brand_name: string | null;
};

function RequestForm() {
    const router = useRouter();
    const params = useParams();
    const searchParams = useSearchParams();
    const slug = params.slug as string;
    const styleId = searchParams.get("styleId");

    const [style, setStyle] = useState<Style | null>(null);
    const [designer, setDesigner] = useState<Designer | null>(null);
    const [loading, setLoading] = useState(true);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    // Form fields
    const [fullName, setFullName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [notes, setNotes] = useState("");

    useEffect(() => {
        const load = async () => {
            const { data: designerData } = await supabase
                .from("designers")
                .select("id, brand_name")
                .eq("slug", slug)
                .single();

            if (!designerData) {
                router.push("/");
                return;
            }

            setDesigner(designerData);

            if (styleId) {
                const { data: styleData } = await supabase
                    .from("styles")
                    .select("id, title, images, category")
                    .eq("id", styleId)
                    .eq("designer_id", designerData.id)
                    .eq("is_published", true)
                    .single();

                setStyle(styleData);
            }

            setLoading(false);
        };

        load();
    }, [slug, styleId, router]);

    const handleSubmit = async () => {
        setError("");

        if (!fullName.trim()) { setError("Please enter your name."); return; }
        if (!phone.trim()) { setError("Please enter your phone number."); return; }
        if (!designer) return;

        setSubmitting(true);

        try {
            // Find or create client
            const { data: existingClient } = await supabase
                .from("clients")
                .select("id")
                .eq("designer_id", designer.id)
                .eq("phone", phone.trim())
                .maybeSingle();

            let clientId = existingClient?.id;

            if (!clientId) {
                const { data: newClient, error: clientError } = await supabase
                    .from("clients")
                    .insert({
                        designer_id: designer.id,
                        full_name: fullName.trim(),
                        phone: phone.trim(),
                        email: email.trim() || null,
                    })
                    .select("id")
                    .single();

                if (clientError) throw clientError;
                clientId = newClient.id;
            }

            // Generate job number
            const jobNumber = `FH-${Date.now().toString().slice(-6)}`;

            // Build title
            const jobTitle = style?.title
                ? `${style.title} — ${fullName.trim()}`
                : `Style Request — ${fullName.trim()}`;

            // Build notes combining style info and customer notes
            const fullNotes = [
                style ? `Style: ${style.title ?? "Selected from catalogue"}` : null,
                notes.trim() ? `Customer notes: ${notes.trim()}` : null,
            ].filter(Boolean).join("\n\n");

            // Create job
            const { data: job, error: jobError } = await supabase
                .from("jobs")
                .insert({
                    designer_id: designer.id,
                    client_id: clientId,
                    job_number: jobNumber,
                    title: jobTitle,
                    style_images: style?.images ?? [],
                    style_notes: fullNotes || null,
                    status: "inquiry",
                })
                .select("id")
                .single();

            if (jobError) throw jobError;

            // Create initial timeline entry
            await supabase.from("job_updates").insert({
                job_id: job.id,
                status: "inquiry",
                note: `Request received from catalogue — ${fullName.trim()}`,
                notify_client: false,
            });

            setSubmitted(true);
        } catch (err: any) {
            setError("Something went wrong: " + err.message);
            setSubmitting(false);
        }
    };

    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-white">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-emerald-600" />
            </main>
        );
    }

    if (submitted) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-5">
                <div className="w-full max-w-md text-center">
                    <div className="mx-auto mb-5 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600">
                        <Check size={32} className="text-white" strokeWidth={3} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Request Sent! 🎉
                    </h1>
                    <p className="mt-3 text-sm leading-relaxed text-gray-500">
                        Your style request has been sent to{" "}
                        <span className="font-semibold text-gray-700">
                            {designer?.brand_name}
                        </span>
                        . They will reach out to you shortly on{" "}
                        <span className="font-semibold text-gray-700">{phone}</span>.
                    </p>

                    <div className="mt-6 rounded-2xl bg-white p-5 shadow-sm text-left">
                        <p className="text-xs font-semibold uppercase tracking-widest text-gray-400 mb-3">
                            What happens next
                        </p>
                        <div className="space-y-3">
                            {[
                                "The designer reviews your request",
                                "They contact you to discuss details and pricing",
                                "You'll receive an AI measurement link",
                                "Once measurements are done, production begins",
                            ].map((step, i) => (
                                <div key={i} className="flex items-start gap-3">
                                    <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-100 text-[10px] font-bold text-emerald-700">
                                        {i + 1}
                                    </div>
                                    <p className="text-sm text-gray-600">{step}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Link
                        href={`/catalogue/${slug}`}
                        className="mt-5 flex h-12 w-full items-center justify-center rounded-xl border border-gray-200 bg-white text-sm font-semibold text-gray-700"
                    >
                        Browse More Styles
                    </Link>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 pb-24">
            {/* HEADER */}
            <header className="bg-white border-b border-gray-100 px-5 py-4">
                <div className="mx-auto flex max-w-md items-center gap-3">
                    <Link
                        href={styleId
                            ? `/catalogue/${slug}/style/${styleId}`
                            : `/catalogue/${slug}`
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200"
                    >
                        <ArrowLeft size={16} />
                    </Link>
                    <div>
                        <p className="text-xs text-gray-400">
                            {designer?.brand_name}
                        </p>
                        <h1 className="text-base font-bold text-gray-900">
                            Request This Style
                        </h1>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-md space-y-4 px-5 py-5">

                {/* SELECTED STYLE PREVIEW */}
                {style && (
                    <section className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm">
                        <div className="h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                            {style.images?.[0] ? (
                                <img
                                    src={style.images[0]}
                                    alt={style.title ?? "Style"}
                                    className="h-full w-full object-cover"
                                />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center text-2xl">
                                    👗
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-widest text-gray-400">
                                Selected Style
                            </p>
                            <p className="mt-0.5 text-sm font-bold text-gray-900">
                                {style.title ?? "Untitled Style"}
                            </p>
                            {style.category && (
                                <p className="text-xs text-gray-400">{style.category}</p>
                            )}
                        </div>
                    </section>
                )}

                {/* YOUR DETAILS */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-sm font-bold text-gray-900">
                        Your Details
                    </h2>
                    <div className="space-y-3">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={fullName}
                                onChange={(e) => setFullName(e.target.value)}
                                placeholder="e.g. Sarah Johnson"
                                className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm outline-none focus:border-gray-900"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                WhatsApp / Phone <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="e.g. 08012345678"
                                type="tel"
                                className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm outline-none focus:border-gray-900"
                            />
                            <p className="mt-1 text-xs text-gray-400">
                                The designer will contact you on this number
                            </p>
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                Email{" "}
                                <span className="font-normal text-gray-400">— optional</span>
                            </label>
                            <input
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="e.g. sarah@email.com"
                                type="email"
                                className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm outline-none focus:border-gray-900"
                            />
                        </div>
                    </div>
                </section>

                {/* CUSTOMISATION NOTES */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <h2 className="mb-1 text-sm font-bold text-gray-900">
                        Customisation Notes
                        <span className="ml-1 font-normal text-gray-400 text-xs">
                            — optional
                        </span>
                    </h2>
                    <p className="mb-3 text-xs text-gray-400">
                        Any specific changes or instructions for this style?
                    </p>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        placeholder="e.g. Make the sleeve longer, change fabric to lace, delivery needed before July 1..."
                        rows={4}
                        className="w-full resize-none rounded-xl border border-gray-200 px-3.5 py-3 text-sm outline-none focus:border-gray-900"
                    />
                </section>

                {error && (
                    <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleSubmit}
                    disabled={submitting}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-semibold text-white disabled:opacity-60"
                >
                    {submitting ? (
                        <><Loader2 size={16} className="animate-spin" /> Sending Request...</>
                    ) : (
                        "Send Style Request →"
                    )}
                </button>

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

export default function RequestPage() {
    return (
        <Suspense fallback={
            <main className="flex min-h-screen items-center justify-center bg-white">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-emerald-600" />
            </main>
        }>
            <RequestForm />
        </Suspense>
    );
}