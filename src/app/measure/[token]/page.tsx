"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import {
    Check, ArrowRight, ArrowLeft,
    Loader2, AlertTriangle, Edit3
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import CameraCapture from "@/components/measurement/CameraCapture";
import { extractMeasurements, type MeasurementResult } from "@/lib/measurementEngine";
import * as poseDetection from "@tensorflow-models/pose-detection";
import * as tf from "@tensorflow/tfjs";
import "@tensorflow/tfjs-backend-webgl";

type Job = {
    id: string;
    title: string | null;
    designer_id: string;
    client_id: string | null;
};

type Designer = {
    brand_name: string | null;
};

// Steps
const STEPS = [
    "intro",
    "height",
    "front_photo",
    "side_photo",
    "processing",
    "review",
    "success",
] as const;

type Step = typeof STEPS[number];

const MEASUREMENT_LABELS: Record<string, string> = {
    height: "Height",
    bust: "Bust",
    waist: "Waist",
    hips: "Hips",
    shoulder_width: "Shoulder Width",
    sleeve_length: "Sleeve Length",
    inseam: "Inseam",
    neck: "Neck",
    chest: "Chest",
    thigh: "Thigh",
};

function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () => reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
    });
}

function MeasureContent() {
    const params = useParams();
    const token = params.token as string;

    const [job, setJob] = useState<Job | null>(null);
    const [designer, setDesigner] = useState<Designer | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const [step, setStep] = useState<Step>("intro");
    const [height, setHeight] = useState("");
    const [frontImage, setFrontImage] = useState<HTMLImageElement | null>(null);
    const [sideImage, setSideImage] = useState<HTMLImageElement | null>(null);
    const [frontCaptured, setFrontCaptured] = useState(false);
    const [sideCaptured, setSideCaptured] = useState(false);

    const [processing, setProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState("");
    const [result, setResult] = useState<MeasurementResult | null>(null);
    const [editableResult, setEditableResult] = useState<Record<string, string>>({});

    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const detectorRef = useRef<any>(null);

    useEffect(() => {
        const load = async () => {
            const { data: jobData } = await supabase
                .from("jobs")
                .select("id, title, designer_id, client_id")
                .eq("measurement_token", token)
                .single();

            if (!jobData) {
                setNotFound(true);
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

    const loadDetector = async () => {
        if (detectorRef.current) return detectorRef.current;

        setProcessingStep("Loading TensorFlow...");
        await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core@4.10.0/dist/tf-core.min.js");
        await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl@4.10.0/dist/tf-backend-webgl.min.js");

        setProcessingStep("Loading pose detection...");
        await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3/dist/pose-detection.min.js");

        setProcessingStep("Initialising...");

        const tf = (window as any).tf;
        const poseDetection = (window as any).poseDetection;

        if (!tf) throw new Error("TensorFlow failed to load. Check your internet connection.");
        if (!poseDetection) throw new Error("Pose detection failed to load. Check your internet connection.");

        await tf.ready();
        await tf.setBackend("webgl");

        setProcessingStep("Downloading AI model weights (~10MB)...");

        const detector = await poseDetection.createDetector(
            poseDetection.SupportedModels.BlazePose,
            {
                runtime: "tfjs",
                modelType: "lite",
                enableSmoothing: false,
                enableSegmentation: false,
            }
        );

        if (!detector) throw new Error("Failed to create pose detector.");

        detectorRef.current = detector;
        return detector;
    };

    const runPoseDetection = async (img: HTMLImageElement) => {
        const detector = await loadDetector();

        setProcessingStep("Detecting body pose...");

        const poses = await detector.estimatePoses(img, {
            flipHorizontal: false,
        });

        console.log("Poses detected:", poses?.length, poses?.[0]?.keypoints?.length);

        if (!poses || poses.length === 0) {
            throw new Error("No person detected in the photo. Make sure your full body is visible and try again.");
        }

        if (!poses[0].keypoints || poses[0].keypoints.length === 0) {
            throw new Error("Body detected but could not read pose landmarks. Please retake the photo in better lighting.");
        }

        return poses[0].keypoints;
    };

    const runProcessing = async () => {
        if (!frontImage || !sideImage || !height) return;

        setStep("processing");
        setProcessing(true);
        setError("");

        try {
            setProcessingStep("Analysing front photo...");
            const frontKeypoints = await runPoseDetection(frontImage);

            setProcessingStep("Analysing side photo...");
            const sideKeypoints = await runPoseDetection(sideImage);

            setProcessingStep("Calculating measurements...");
            await new Promise(r => setTimeout(r, 800));

            const measurements = extractMeasurements(
                frontKeypoints,
                sideKeypoints,
                parseFloat(height),
                frontImage.width,
                frontImage.height
            );

            setResult(measurements);

            // Pre-fill editable fields
            const editable: Record<string, string> = {};
            Object.keys(MEASUREMENT_LABELS).forEach(key => {
                const val = measurements[key as keyof MeasurementResult];
                if (typeof val === "number") {
                    editable[key] = val.toString();
                }
            });
            setEditableResult(editable);

            setStep("review");
        } catch (err: any) {
            setError(err.message ?? "Failed to process photos. Please retake.");
            setStep("front_photo");
            setFrontCaptured(false);
            setSideCaptured(false);
        }

        setProcessing(false);
    };

    const handleSubmit = async () => {
        if (!job || !result) return;
        setSubmitting(true);

        try {
            const payload = {
                designer_id: job.designer_id,
                client_id: job.client_id,
                job_id: job.id,
                scan_method: "mediapipe_full",
                confidence_score: result.confidence_score,
                requires_review: result.requires_review,
                raw_landmarks: result.raw_landmarks,
                height: parseFloat(editableResult.height) || result.height,
                bust: parseFloat(editableResult.bust) || result.bust,
                waist: parseFloat(editableResult.waist) || result.waist,
                hips: parseFloat(editableResult.hips) || result.hips,
                shoulder_width: parseFloat(editableResult.shoulder_width) || result.shoulder_width,
                sleeve_length: parseFloat(editableResult.sleeve_length) || result.sleeve_length,
                inseam: parseFloat(editableResult.inseam) || result.inseam,
                neck: parseFloat(editableResult.neck) || result.neck,
                chest: parseFloat(editableResult.chest) || result.chest,
                thigh: parseFloat(editableResult.thigh) || result.thigh,
            };

            const { error: insertError } = await supabase
                .from("measurements")
                .insert(payload);

            if (insertError) throw insertError;

            // Update job status
            await supabase
                .from("jobs")
                .update({ status: "measurement_done" })
                .eq("id", job.id);

            // Add timeline entry
            await supabase.from("job_updates").insert({
                job_id: job.id,
                status: "measurement_done",
                note: `AI measurements submitted (confidence: ${Math.round(result.confidence_score * 100)}%)`,
                notify_client: false,
            });

            setSubmitted(true);
            setStep("success");
        } catch (err: any) {
            setError("Failed to submit: " + err.message);
            setSubmitting(false);
        }
    };

    // ── LOADING ───────────────────────────────────────────
    if (loading) {
        return (
            <main className="flex min-h-screen items-center justify-center bg-white">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-emerald-600" />
            </main>
        );
    }

    if (notFound) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-5 text-center">
                <h1 className="text-xl font-bold text-gray-900">Link not found</h1>
                <p className="mt-2 text-sm text-gray-500">
                    This measurement link is invalid or has expired.
                </p>
            </main>
        );
    }

    // ── SUCCESS ───────────────────────────────────────────
    if (step === "success") {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-5">
                <div className="w-full max-w-md text-center">
                    <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600">
                        <Check size={36} className="text-white" strokeWidth={3} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">
                        Measurements Sent! 🎉
                    </h1>
                    <p className="mt-3 text-sm leading-relaxed text-gray-500">
                        Your measurements have been sent to{" "}
                        <span className="font-semibold text-gray-700">
                            {designer?.brand_name}
                        </span>
                        . They will now start working on your outfit.
                    </p>

                    {result && (
                        <div className="mt-6 rounded-2xl bg-white p-5 text-left shadow-sm">
                            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-gray-400">
                                Your Measurements (cm)
                            </p>
                            <div className="grid grid-cols-2 gap-2">
                                {Object.entries(MEASUREMENT_LABELS).map(([key, label]) => {
                                    const val = editableResult[key];
                                    if (!val) return null;
                                    return (
                                        <div key={key} className="rounded-xl bg-gray-50 px-3 py-2">
                                            <p className="text-[10px] text-gray-400">{label}</p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {parseFloat(val).toFixed(1)} cm
                                            </p>
                                        </div>
                                    );
                                })}
                            </div>

                            <div className="mt-3 flex items-center gap-2 rounded-xl bg-emerald-50 px-3 py-2">
                                <Check size={12} className="text-emerald-600" />
                                <p className="text-xs text-emerald-700">
                                    AI confidence: {Math.round((result.confidence_score ?? 0) * 100)}%
                                </p>
                            </div>
                        </div>
                    )}

                    <p className="mt-6 text-xs text-gray-400">
                        Powered by{" "}
                        <Link href="/" className="font-semibold text-emerald-600">
                            FitHouseAfrica
                        </Link>
                    </p>
                </div>
            </main>
        );
    }

    // ── NAV ───────────────────────────────────────────────
    return (
        <main className="min-h-screen bg-gray-50 pb-24">
            {/* HEADER */}
            <header className="bg-white border-b border-gray-100 px-5 py-4">
                <div className="mx-auto max-w-md">
                    <p className="text-xs text-gray-400">
                        {designer?.brand_name} — Measurements
                    </p>
                    <h1 className="text-base font-bold text-gray-900">
                        {job?.title ?? "Your Order"}
                    </h1>
                </div>
            </header>

            <div className="mx-auto max-w-md px-5 py-5 space-y-4">

                {/* ── INTRO ──────────────────────────────── */}
                {step === "intro" && (
                    <>
                        <div className="rounded-2xl bg-white p-6 shadow-sm text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-100">
                                <span className="text-3xl">📏</span>
                            </div>
                            <h2 className="text-xl font-bold text-gray-900">
                                AI Body Scan
                            </h2>
                            <p className="mt-2 text-sm leading-relaxed text-gray-500">
                                We'll take two quick photos to measure your body accurately.
                                This takes about 60 seconds and ensures your outfit fits perfectly.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white p-5 shadow-sm">
                            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                                What you'll need
                            </p>
                            <div className="space-y-3">
                                {[
                                    { emoji: "👕", text: "Wear tight-fitting clothes or underwear" },
                                    { emoji: "📱", text: "Someone to hold the phone for you" },
                                    { emoji: "📏", text: "Know your height in centimetres" },
                                    { emoji: "💡", text: "Good lighting and a clear background" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="text-xl">{item.emoji}</span>
                                        <p className="text-sm text-gray-700">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setStep("height")}
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-semibold text-white"
                        >
                            Get Started <ArrowRight size={16} />
                        </button>
                    </>
                )}

                {/* ── HEIGHT ─────────────────────────────── */}
                {step === "height" && (
                    <>
                        {/* PROGRESS */}
                        <div className="flex gap-1.5">
                            <div className="h-1 flex-1 rounded-full bg-emerald-600" />
                            <div className="h-1 flex-1 rounded-full bg-gray-200" />
                            <div className="h-1 flex-1 rounded-full bg-gray-200" />
                        </div>

                        <div className="rounded-2xl bg-white p-5 shadow-sm">
                            <h2 className="mb-1 text-lg font-bold text-gray-900">
                                What is your height?
                            </h2>
                            <p className="mb-5 text-sm text-gray-400">
                                This is used to calculate your exact measurements from the photos.
                            </p>

                            <div className="flex items-center overflow-hidden rounded-xl border border-gray-200 focus-within:border-emerald-500">
                                <input
                                    type="number"
                                    value={height}
                                    onChange={(e) => setHeight(e.target.value)}
                                    placeholder="e.g. 165"
                                    className="h-14 flex-1 px-4 text-2xl font-bold outline-none"
                                />
                                <span className="border-l border-gray-200 bg-gray-50 px-4 py-4 text-sm font-medium text-gray-500">
                                    cm
                                </span>
                            </div>

                            <div className="mt-3 flex gap-2">
                                {[155, 160, 165, 170, 175, 180].map((h) => (
                                    <button
                                        key={h}
                                        onClick={() => setHeight(h.toString())}
                                        className={`flex-1 rounded-lg border py-2 text-xs font-medium transition ${height === h.toString()
                                            ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                                            : "border-gray-200 text-gray-600"
                                            }`}
                                    >
                                        {h}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => {
                                if (!height || parseFloat(height) < 100 || parseFloat(height) > 220) {
                                    setError("Please enter a valid height between 100 and 220 cm.");
                                    return;
                                }
                                setError("");
                                setStep("front_photo");
                            }}
                            disabled={!height}
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-semibold text-white disabled:opacity-50"
                        >
                            Continue <ArrowRight size={16} />
                        </button>

                        {error && (
                            <p className="text-center text-sm text-red-600">{error}</p>
                        )}
                    </>
                )}

                {/* ── FRONT PHOTO ────────────────────────── */}
                {step === "front_photo" && (
                    <>
                        <div className="flex gap-1.5">
                            <div className="h-1 flex-1 rounded-full bg-emerald-600" />
                            <div className="h-1 flex-1 rounded-full bg-emerald-600" />
                            <div className="h-1 flex-1 rounded-full bg-gray-200" />
                        </div>

                        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                            <p className="text-xs font-semibold text-emerald-700 mb-1">
                                📸 Front Photo Tips
                            </p>
                            <ul className="space-y-1 text-xs text-emerald-600">
                                <li>• Stand straight with feet together</li>
                                <li>• Arms slightly away from your sides</li>
                                <li>• Full body must be visible head to toe</li>
                                <li>• Stand 2–3 metres from the camera</li>
                            </ul>
                        </div>

                        <CameraCapture
                            label="Front Photo"
                            hint="Stand facing the camera, full body visible"
                            guideType="front"
                            onCapture={(_, img) => {
                                setFrontImage(img);
                                setFrontCaptured(true);
                            }}
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep("height")}
                                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 text-sm font-semibold text-gray-700"
                            >
                                <ArrowLeft size={16} /> Back
                            </button>
                            <button
                                onClick={() => setStep("side_photo")}
                                disabled={!frontCaptured}
                                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-semibold text-white disabled:opacity-50"
                            >
                                Continue <ArrowRight size={16} />
                            </button>
                        </div>
                    </>
                )}

                {/* ── SIDE PHOTO ─────────────────────────── */}
                {step === "side_photo" && (
                    <>
                        <div className="flex gap-1.5">
                            <div className="h-1 flex-1 rounded-full bg-emerald-600" />
                            <div className="h-1 flex-1 rounded-full bg-emerald-600" />
                            <div className="h-1 flex-1 rounded-full bg-emerald-600" />
                        </div>

                        <div className="rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                            <p className="text-xs font-semibold text-emerald-700 mb-1">
                                📸 Side Photo Tips
                            </p>
                            <ul className="space-y-1 text-xs text-emerald-600">
                                <li>• Turn 90° to your right (left side faces camera)</li>
                                <li>• Stand straight, arms forward</li>
                                <li>• Full body must be visible head to toe</li>
                                <li>• Same distance from camera as front photo</li>
                            </ul>
                        </div>

                        <CameraCapture
                            label="Side Photo"
                            hint="Turn sideways, arms forward, full body visible"
                            guideType="side"
                            onCapture={(_, img) => {
                                setSideImage(img);
                                setSideCaptured(true);
                            }}
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep("front_photo")}
                                className="flex h-12 items-center justify-center gap-2 rounded-xl border border-gray-200 px-5 text-sm font-semibold text-gray-700"
                            >
                                <ArrowLeft size={16} /> Back
                            </button>
                            <button
                                onClick={runProcessing}
                                disabled={!sideCaptured}
                                className="flex h-12 flex-1 items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white disabled:opacity-50"
                            >
                                Analyse Photos <ArrowRight size={16} />
                            </button>
                        </div>
                    </>
                )}

                {/* ── PROCESSING ─────────────────────────── */}
                {step === "processing" && (
                    <div className="flex flex-col items-center justify-center py-20 text-center">
                        <div className="mb-6 relative">
                            <div className="h-24 w-24 animate-spin rounded-full border-4 border-gray-100 border-t-emerald-600" />
                            <div className="absolute inset-0 flex items-center justify-center text-3xl">
                                📏
                            </div>
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Analysing your photos
                        </h2>
                        <p className="mt-2 text-sm text-gray-400">
                            {processingStep || "Processing..."}
                        </p>
                        <p className="mt-1 text-xs text-gray-300">
                            This takes about 10–15 seconds
                        </p>

                        {error && (
                            <div className="mt-6 w-full rounded-2xl bg-red-50 p-4 text-left">
                                <p className="text-sm font-semibold text-red-700">
                                    Something went wrong
                                </p>
                                <p className="mt-1 text-xs text-red-600">{error}</p>
                                <button
                                    onClick={() => {
                                        setError("");
                                        setStep("front_photo");
                                        setFrontCaptured(false);
                                        setSideCaptured(false);
                                    }}
                                    className="mt-3 text-xs font-semibold text-red-600 underline"
                                >
                                    Retake photos
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* ── REVIEW ─────────────────────────────── */}
                {step === "review" && result && (
                    <>
                        {/* CONFIDENCE */}
                        <div className={`rounded-2xl border p-4 ${result.requires_review
                            ? "border-amber-100 bg-amber-50"
                            : "border-emerald-100 bg-emerald-50"
                            }`}>
                            <div className="flex items-center gap-2">
                                {result.requires_review ? (
                                    <AlertTriangle size={16} className="text-amber-600" />
                                ) : (
                                    <Check size={16} className="text-emerald-600" />
                                )}
                                <p className={`text-sm font-semibold ${result.requires_review
                                    ? "text-amber-800"
                                    : "text-emerald-800"
                                    }`}>
                                    {result.requires_review
                                        ? "Please review your measurements"
                                        : "Measurements look good!"}
                                </p>
                            </div>
                            <p className={`mt-1 text-xs ${result.requires_review
                                ? "text-amber-600"
                                : "text-emerald-600"
                                }`}>
                                AI confidence: {Math.round(result.confidence_score * 100)}%
                                {result.requires_review
                                    ? " — Please check and correct any values below"
                                    : " — You can still edit any value before submitting"
                                }
                            </p>
                        </div>

                        {/* EDITABLE MEASUREMENTS */}
                        <div className="rounded-2xl bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-sm font-bold text-gray-900">
                                    Your Measurements
                                </h2>
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <Edit3 size={11} />
                                    Tap to edit
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-3">
                                {Object.entries(MEASUREMENT_LABELS).map(([key, label]) => (
                                    <div key={key}>
                                        <label className="mb-1 block text-[10px] font-medium text-gray-400">
                                            {label}
                                        </label>
                                        <div className="flex items-center overflow-hidden rounded-xl border border-gray-200 focus-within:border-emerald-500">
                                            <input
                                                type="number"
                                                value={editableResult[key] ?? ""}
                                                onChange={(e) =>
                                                    setEditableResult(prev => ({
                                                        ...prev,
                                                        [key]: e.target.value,
                                                    }))
                                                }
                                                className="h-10 w-full px-2.5 text-sm font-semibold outline-none"
                                            />
                                            <span className="flex-shrink-0 pr-2 text-[10px] text-gray-400">
                                                cm
                                            </span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {error && (
                            <div className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                                {error}
                            </div>
                        )}

                        <button
                            onClick={handleSubmit}
                            disabled={submitting}
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white disabled:opacity-60"
                        >
                            {submitting ? (
                                <><Loader2 size={16} className="animate-spin" /> Submitting...</>
                            ) : (
                                <><Check size={16} /> Submit Measurements</>
                            )}
                        </button>

                        <button
                            onClick={() => {
                                setStep("front_photo");
                                setFrontCaptured(false);
                                setSideCaptured(false);
                                setResult(null);
                            }}
                            className="flex h-10 w-full items-center justify-center text-xs text-gray-400 underline"
                        >
                            Retake photos
                        </button>
                    </>
                )}
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