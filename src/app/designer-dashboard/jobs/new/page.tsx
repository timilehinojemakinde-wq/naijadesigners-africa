"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, Plus, X, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { uploadMediaFile } from "@/lib/uploadMedia";

export default function CreateJobPage() {
    const router = useRouter();

    // Client fields
    const [clientName, setClientName] = useState("");
    const [clientPhone, setClientPhone] = useState("");
    const [clientEmail, setClientEmail] = useState("");

    // Job fields
    const [title, setTitle] = useState("");
    const [styleNotes, setStyleNotes] = useState("");
    const [deliveryDate, setDeliveryDate] = useState("");

    // Style images
    const [images, setImages] = useState<{ file: File; preview: string }[]>([]);
    const [uploading, setUploading] = useState(false);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState("");

    const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const files = Array.from(e.target.files ?? []);
        const remaining = 6 - images.length;
        const selected = files.slice(0, remaining);

        const newImages = selected.map((file) => ({
            file,
            preview: URL.createObjectURL(file),
        }));

        setImages((prev) => [...prev, ...newImages]);
        e.target.value = "";
    };

    const removeImage = (index: number) => {
        setImages((prev) => {
            const item = prev[index];
            if (item) URL.revokeObjectURL(item.preview);
            return prev.filter((_, i) => i !== index);
        });
    };

    const generateJobNumber = (designerId: string) => {
        const timestamp = Date.now().toString().slice(-6);
        return `FH-${timestamp}`;
    };

    const handleCreate = async () => {
        setError("");

        if (!clientName.trim()) { setError("Please enter the customer name."); return; }
        if (!clientPhone.trim()) { setError("Please enter the customer phone number."); return; }
        if (!title.trim()) { setError("Please enter a job title e.g. Wedding Dress."); return; }

        setSaving(true);

        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) { router.push("/auth"); return; }

            // Upload style images
            setUploading(true);
            const imageUrls: string[] = [];

            for (const img of images) {
                try {
                    const url = await uploadMediaFile(img.file, user.id);
                    imageUrls.push(url);
                } catch (err) {
                    console.warn("Image upload failed, continuing:", err);
                }
            }
            setUploading(false);

            // Find or create client
            const { data: existingClient } = await supabase
                .from("clients")
                .select("id")
                .eq("designer_id", user.id)
                .eq("phone", clientPhone.trim())
                .maybeSingle();

            let clientId = existingClient?.id;

            if (!clientId) {
                const { data: newClient, error: clientError } = await supabase
                    .from("clients")
                    .insert({
                        designer_id: user.id,
                        full_name: clientName.trim(),
                        phone: clientPhone.trim(),
                        email: clientEmail.trim() || null,
                    })
                    .select("id")
                    .single();

                if (clientError) throw clientError;
                clientId = newClient.id;
            }

            // Create the job
            const jobNumber = generateJobNumber(user.id);

            const { data: job, error: jobError } = await supabase
                .from("jobs")
                .insert({
                    designer_id: user.id,
                    client_id: clientId,
                    job_number: jobNumber,
                    title: title.trim(),
                    style_images: imageUrls,
                    style_notes: styleNotes.trim() || null,
                    status: "inquiry",
                    expected_delivery: deliveryDate || null,
                })
                .select("id")
                .single();

            if (jobError) throw jobError;

            // Create initial timeline entry
            await supabase.from("job_updates").insert({
                job_id: job.id,
                status: "inquiry",
                note: "Job created",
                notify_client: false,
            });

            router.push(`/designer-dashboard/jobs/${job.id}`);
        } catch (err: any) {
            setError("Failed to create job: " + err.message);
            setSaving(false);
        }
    };

    return (
        <main className="min-h-screen bg-gray-50 pb-24">
            {/* HEADER */}
            <header className="sticky top-0 z-50 border-b border-gray-100 bg-white px-5 py-4">
                <div className="flex items-center gap-3">
                    <Link
                        href="/designer-dashboard/jobs"
                        className="flex h-9 w-9 items-center justify-center rounded-xl border border-gray-200"
                    >
                        <ArrowLeft size={16} />
                    </Link>
                    <div>
                        <h1 className="text-base font-bold text-gray-900">New Job</h1>
                        <p className="text-xs text-gray-400">Create a client job</p>
                    </div>
                </div>
            </header>

            <div className="mx-auto max-w-md space-y-4 px-5 py-5">

                {/* CLIENT INFO */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-sm font-bold text-gray-900">
                        Customer
                    </h2>
                    <div className="space-y-3">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                Full Name <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={clientName}
                                onChange={(e) => setClientName(e.target.value)}
                                placeholder="e.g. Sarah Johnson"
                                className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm outline-none focus:border-gray-900"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                Phone / WhatsApp <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={clientPhone}
                                onChange={(e) => setClientPhone(e.target.value)}
                                placeholder="e.g. 08012345678"
                                type="tel"
                                className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm outline-none focus:border-gray-900"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                Email{" "}
                                <span className="font-normal text-gray-400">— optional</span>
                            </label>
                            <input
                                value={clientEmail}
                                onChange={(e) => setClientEmail(e.target.value)}
                                placeholder="e.g. sarah@email.com"
                                type="email"
                                className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm outline-none focus:border-gray-900"
                            />
                        </div>
                    </div>
                </section>

                {/* JOB DETAILS */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-sm font-bold text-gray-900">
                        Job Details
                    </h2>
                    <div className="space-y-3">
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                Job Title <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="e.g. Wedding Dress, Senator Wear"
                                className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm outline-none focus:border-gray-900"
                            />
                        </div>
                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                Expected Delivery
                                <span className="ml-1 font-normal text-gray-400">— optional</span>
                            </label>
                            <input
                                type="date"
                                value={deliveryDate}
                                onChange={(e) => setDeliveryDate(e.target.value)}
                                className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm outline-none focus:border-gray-900"
                            />
                        </div>
                    </div>
                </section>

                {/* STYLE IMAGES */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <h2 className="mb-1 text-sm font-bold text-gray-900">
                        Style Reference
                    </h2>
                    <p className="mb-4 text-xs text-gray-400">
                        Upload the style image the customer wants. Up to 6 images.
                    </p>

                    <div className="flex flex-wrap gap-2">
                        {images.map((img, i) => (
                            <div key={i} className="relative h-20 w-20 flex-shrink-0">
                                <img
                                    src={img.preview}
                                    alt=""
                                    className="h-full w-full rounded-xl object-cover"
                                />
                                <button
                                    onClick={() => removeImage(i)}
                                    className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full bg-gray-900 text-white"
                                >
                                    <X size={10} />
                                </button>
                            </div>
                        ))}

                        {images.length < 6 && (
                            <label className="flex h-20 w-20 cursor-pointer flex-col items-center justify-center rounded-xl border-2 border-dashed border-gray-200 hover:border-gray-400">
                                <Plus size={20} className="text-gray-400" />
                                <span className="mt-1 text-[10px] text-gray-400">Add</span>
                                <input
                                    type="file"
                                    accept="image/*"
                                    multiple
                                    hidden
                                    onChange={handleImageSelect}
                                />
                            </label>
                        )}
                    </div>
                </section>

                {/* CUSTOMER NOTES */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <h2 className="mb-1 text-sm font-bold text-gray-900">
                        Customer Instructions
                    </h2>
                    <p className="mb-3 text-xs text-gray-400">
                        What did the customer say? Notes, changes, preferences.
                    </p>
                    <textarea
                        value={styleNotes}
                        onChange={(e) => setStyleNotes(e.target.value)}
                        placeholder="e.g. Make the sleeve longer, use gold stones, delivery before July 1..."
                        rows={4}
                        className="w-full rounded-xl border border-gray-200 px-3.5 py-3 text-sm outline-none focus:border-gray-900 resize-none"
                    />
                </section>

                {error && (
                    <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                <button
                    onClick={handleCreate}
                    disabled={saving}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-semibold text-white disabled:opacity-60"
                >
                    {saving ? (
                        <>
                            <Loader2 size={16} className="animate-spin" />
                            {uploading ? "Uploading images..." : "Creating job..."}
                        </>
                    ) : (
                        "Create Job"
                    )}
                </button>
            </div>
        </main>
    );
}