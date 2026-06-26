"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { Check, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Job = {
    id: string;
    title: string | null;
    designer_id: string;
    client_id: string | null;
};

type Designer = {
    brand_name: string | null;
};

type MeasurementForm = {
    height: string;
    bust: string;
    waist: string;
    hips: string;
    shoulder_width: string;
    sleeve_length: string;
    inseam: string;
    neck: string;
    chest: string;
    thigh: string;
};

const STEPS = [
    {
        title: "Upper Body",
        fields: [
            { key: "height", label: "Height", hint: "Stand straight against a wall" },
            { key: "bust", label: "Bust / Chest", hint: "Around the fullest part of your chest" },
            { key: "chest", label: "Chest (under bust)", hint: "Just below the bust line" },
            { key: "shoulder_width", label: "Shoulder Width", hint: "From shoulder tip to shoulder tip" },
            { key: "neck", label: "Neck", hint: "Around the base of your neck" },
        ],
    },
    {
        title: "Mid Body",
        fields: [
            { key: "waist", label: "Waist", hint: "Around the narrowest part of your waist" },
            { key: "hips", label: "Hips", hint: "Around the fullest part of your hips" },
        ],
    },
    {
        title: "Lower Body",
        fields: [
            { key: "sleeve_length", label: "Sleeve Length", hint: "From shoulder to wrist" },
            { key: "inseam", label: "Inseam", hint: "From crotch to ankle" },
            { key: "thigh", label: "Thigh", hint: "Around the fullest part of your thigh" },
        ],
    },
];

function MeasureContent() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [job, setJob] = useState<Job | null>(null);
    const [designer, setDesigner] = useState<Designer | null>(null);
    const [loading, setLoading] = useState(true);
    const [step, setStep] = useState(0);
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const [form, setForm] = useState<MeasurementForm>({
        height: "",
        bust: "",
        waist: "",
        hips: "",
        shoulder_width: "",
        sleeve_length: "",
        inseam: "",
        neck: "",
        chest: "",
        thigh: "",
    });

    useEffect(() => {
        const load = async () => {
            const { data: jobData } = await supabase
                .from("jobs")
                .select("id, title, designer_id, client_id")
                .eq("tracking_token", token)
                .single();

            if (!jobData) {
                setLoading(false);
                return;
            }

            setJob(jobData);

            const { data: designerData } = await supabase
                .from("designers")
                .select("brand_name")
                .eq("id", jobData.designer_id)
                .single();

            setDesigner(designerData);
            setLoading(false);
        };

        load();
    }, [token]);

    const updateField = (key: string, value: string) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const currentStep = STEPS[step];

    const handleNext = () => {
        // Validate at least height and bust on step 1
        if (step === 0) {
            if (!form.height) { setError("Please enter your height."); return; }
            if (!form.bust) { setError("Please enter your bust/chest measurement."); return; }
        }
        setError("");
        setStep((prev) => prev + 1);
    };

    const handleSubmit = async () => {
        if (!job) return;
        setError("");
        setSubmitting(true);

        try {
            const payload = {
                designer_id: job.designer_id,
                client_id: job.client_id,
                job_id: job.id,
                taken_by: "manual",
                height: form.height ? parseFloat(form.height) : null,
                bust: form.bust ? parseFloat(form.bust) : null,
                waist: form.waist ? parseFloat(form.waist) : null,
                hips: form.hips ? parseFloat(form.hips) : null,
                shoulder_width: form.shoulder_width ? parseFloat(form.shoulder_width) : null,
                sleeve_length: form.sleeve_length ? parseFloat(form.sleeve_length) : null,
                inseam: form.inseam ? parseFloat(form.inseam) : null,
                neck: form.neck ? parseFloat(form.neck) : null,
                chest: form.chest ? parseFloat(form.chest) : null,
                thigh: form.thigh ? parseFloat(form.thigh) : null,
            };

            const { error: insertError } = await supabase
                .from("measurements")
                .insert(payload);

            if (insertError) throw insertError;

            // Update job status to measurement_done
            await supabase
                .from("jobs")
                .update({ status: "measurement_done" })
                .eq("id", job.id);

            // Add timeline entry
            await supabase.from("job_updates").insert({
                job_id: job.id,
                status: "measurement_done",
                note: "Measurements submitted by customer",
                notify_client: false,
            });

            setSubmitted(true);
        } catch (err: any) {
            setError("Failed to submit: " + err.message);
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

    if (!job) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-5 text-center">
                <h1 className="text-xl font-bold text-gray-900">Link not found</h1>
                <p className="mt-2 text-sm text-gray-500">
                    This measurement link is invalid or has expired.
                </p>
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
                        Measurements Submitted!
                    </h1>
                    <p className="mt-3 text-sm leading-relaxed text-gray-500">
                        Your measurements have been sent to{" "}
                        <span className="font-semibold text-gray-700">
                            {designer?.brand_name}
                        </span>
                        . They will be in touch with you shortly.
                    </p>
                    <div className="mt-8 rounded-2xl bg-white p-5 text-left shadow-sm">
                        <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
                            Your Measurements (cm)
                        </p>
                        <div className="grid grid-cols-2 gap-2">
                            {Object.entries(form).map(([key, value]) => {
                                if (!value) return null;
                                const label = key.replace(/_/g, " ")
                                    .split(" ")
                                    .map(w => w.charAt(0).toUpperCase() + w.slice(1))
                                    .join(" ");
                                return (
                                    <div key={key} className="rounded-xl bg-gray-50 px-3 py-2">
                                        <p className="text-[10px] text-gray-400">{label}</p>
                                        <p className="text-sm font-semibold text-gray-900">
                                            {value} cm
                                        </p>
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                    <p className="mt-6 text-center text-xs text-gray-400">
                        Powered by{" "}
                        <Link href="/" className="font-semibold text-emerald-600">
                            FitHouseAfrica
                        </Link>
                    </p>
                </div>
            </main>
        );
    }

    return (
        <main className="min-h-screen bg-gray-50 pb-24">
            {/* HEADER */}
            <header className="bg-white border-b border-gray-100 px-5 py-4">
                <div className="mx-auto max-w-md">
                    <p className="text-xs text-gray-400">
                        Measurements for
                    </p>
                    <h1 className="text-base font-bold text-gray-900">
                        {job.title ?? "Your Order"}
                    </h1>
                    <p className="text-xs text-gray-400">
                        {designer?.brand_name}
                    </p>
                </div>
            </header>

            <div className="mx-auto max-w-md px-5 py-5">

                {/* PROGRESS */}
                <div className="mb-6">
                    <div className="mb-2 flex items-center justify-between">
                        <p className="text-xs font-semibold text-gray-500">
                            Step {step + 1} of {STEPS.length}
                        </p>
                        <p className="text-xs text-gray-400">
                            {currentStep.title}
                        </p>
                    </div>
                    <div className="flex gap-1.5">
                        {STEPS.map((_, i) => (
                            <div
                                key={i}
                                className={`h-1 flex-1 rounded-full transition-all ${i <= step ? "bg-emerald-600" : "bg-gray-200"
                                    }`}
                            />
                        ))}
                    </div>
                </div>

                {/* INSTRUCTIONS */}
                <div className="mb-5 rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                    <p className="text-xs font-semibold text-emerald-700 mb-1">
                        📏 How to measure
                    </p>
                    <p className="text-xs leading-relaxed text-emerald-600">
                        Use a measuring tape. All measurements should be in centimetres (cm).
                        Stand straight and breathe normally while measuring.
                    </p>
                </div>

                {/* FIELDS */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <h2 className="mb-4 text-sm font-bold text-gray-900">
                        {currentStep.title}
                    </h2>
                    <div className="space-y-4">
                        {currentStep.fields.map((field) => (
                            <div key={field.key}>
                                <label className="mb-1 block text-sm font-medium text-gray-700">
                                    {field.label}
                                </label>
                                <div className="flex items-center overflow-hidden rounded-xl border border-gray-200 focus-within:border-emerald-500">
                                    <input
                                        type="number"
                                        value={form[field.key as keyof MeasurementForm]}
                                        onChange={(e) => updateField(field.key, e.target.value)}
                                        placeholder="0"
                                        className="h-12 flex-1 px-3.5 text-sm outline-none"
                                    />
                                    <span className="flex-shrink-0 border-l border-gray-200 bg-gray-50 px-3 py-3.5 text-xs text-gray-400">
                                        cm
                                    </span>
                                </div>
                                <p className="mt-1 text-xs text-gray-400">{field.hint}</p>
                            </div>
                        ))}
                    </div>
                </section>

                {error && (
                    <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                        {error}
                    </div>
                )}

                {/* NAVIGATION */}
                <div className="mt-5 flex gap-3">
                    {step > 0 && (
                        <button
                            onClick={() => { setStep(s => s - 1); setError(""); }}
                            className="flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 text-sm font-semibold text-gray-700"
                        >
                            <ArrowLeft size={16} /> Back
                        </button>
                    )}

                    {step < STEPS.length - 1 ? (
                        <button
                            onClick={handleNext}
                            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-semibold text-white"
                        >
                            Continue <ArrowRight size={16} />
                        </button>
                    ) : (
                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white disabled:opacity-60"
                        >
                            {submitting ? (
                                <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                            ) : (
                                <><Check size={16} /> Submit Measurements</>
                            )}
                        </button>
                    )}
                </div>

                <p className="mt-6 text-center text-xs text-gray-400">
                    Powered by{" "}
                    <Link href="/" className="font-semibold text-emerald-600">
                        FitHouseAfrica
                    </Link>
                </p>
            </div>
        </main>
    );
}

export default function MeasurePage() {
    return (
        <Suspense fallback={
            <main className="flex min-h-screen items-center justify-center bg-white">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-emerald-600" />
            </main>
        }>
            <MeasureContent />
        </Suspense>
    );
}