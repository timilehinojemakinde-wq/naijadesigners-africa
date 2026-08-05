"use client";

import { useEffect, useState, useRef, Suspense } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
    ArrowLeft,
    Loader2,
    Check,
    Mic,
    Square,
    Play,
    Pause,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";
import { capitalizeWords } from "@/lib/textFormat";

type Style = {
    id: string;
    title: string | null;
    images: string[] | null;
    video_url: string | null;
    category: string | null;
};

type Designer = {
    id: string;
    brand_name: string | null;
};

const TITLES = ["Mr", "Mrs", "Miss", "Ms", "Dr", "Chief", "Engr", "Alhaji", "Alhaja"];

const WAVEFORM_BARS = 40;

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
    const [title, setTitle] = useState("");
    const [firstName, setFirstName] = useState("");
    const [lastName, setLastName] = useState("");
    const [phone, setPhone] = useState("");

    const [isRecording, setIsRecording] = useState(false);
    const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
    const [audioUrl, setAudioUrl] = useState("");
    const [audioPlaying, setAudioPlaying] = useState(false);
    const [waveform, setWaveform] = useState<number[]>(Array(WAVEFORM_BARS).fill(4));
    const [frozenWaveform, setFrozenWaveform] = useState<number[]>([]);
    const [recordingSeconds, setRecordingSeconds] = useState(0);

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const audioContextRef = useRef<AudioContext | null>(null);
    const animationFrameRef = useRef<number | null>(null);
    const recordingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

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
                    .select("id, title, images, video_url, category")
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

    const formatTime = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;

    const startRecording = async () => {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        streamRef.current = stream;

        const recorder = new MediaRecorder(stream);
        const chunks: BlobPart[] = [];

        recorder.ondataavailable = (e) => chunks.push(e.data);
        recorder.onstop = () => {
            const blob = new Blob(chunks, { type: "audio/webm" });
            setAudioBlob(blob);
            setAudioUrl(URL.createObjectURL(blob));
        };

        recorder.start();
        mediaRecorderRef.current = recorder;
        setIsRecording(true);
        setRecordingSeconds(0);
        setWaveform(Array(WAVEFORM_BARS).fill(4));

        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        const audioContext = new AudioContextClass();
        const source = audioContext.createMediaStreamSource(stream);
        const analyser = audioContext.createAnalyser();
        analyser.fftSize = 256;
        source.connect(analyser);
        audioContextRef.current = audioContext;

        const dataArray = new Uint8Array(analyser.frequencyBinCount);
        const tick = () => {
            analyser.getByteFrequencyData(dataArray);
            const avg = dataArray.reduce((s, v) => s + v, 0) / dataArray.length;
            const barHeight = Math.max(4, Math.min(32, (avg / 255) * 55));
            setWaveform((prev) => [...prev.slice(1), barHeight]);
            animationFrameRef.current = requestAnimationFrame(tick);
        };
        tick();

        recordingTimerRef.current = setInterval(() => {
            setRecordingSeconds((s) => s + 1);
        }, 1000);
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setIsRecording(false);
        setFrozenWaveform(waveform);

        if (animationFrameRef.current) cancelAnimationFrame(animationFrameRef.current);
        if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
        audioContextRef.current?.close();
        streamRef.current?.getTracks().forEach((t) => t.stop());
    };

    const playRecording = () => {
        if (!audioUrl) return;
        const audio = new Audio(audioUrl);
        audioRef.current = audio;
        audio.onended = () => setAudioPlaying(false);
        audio.play();
        setAudioPlaying(true);
    };

    const handleSubmit = async () => {
        setError("");

        if (!firstName.trim()) { setError("Please enter your first name."); return; }
        if (!lastName.trim()) { setError("Please enter your last name."); return; }
        if (!phone.trim()) { setError("Please enter your WhatsApp number."); return; }
        if (!designer) return;

        setSubmitting(true);

        try {
            const fullName = `${firstName.trim()} ${lastName.trim()}`;

            const formData = new FormData();
            formData.append("designerId", designer.id);
            formData.append("styleId", style?.id ?? "");
            formData.append("styleTitle", style?.title ?? "");
            formData.append("styleImages", JSON.stringify(style?.images ?? []));
            formData.append("styleVideoUrl", style?.video_url ?? "");
            formData.append("title", title);
            formData.append("fullName", fullName);
            formData.append("phone", phone);

            if (audioBlob) {
                formData.append("voiceNote", audioBlob, "voice-note.webm");
            }

            const response = await fetch("/api/request-style", {
                method: "POST",
                body: formData,
            });

            const result = await response.json();

            if (!result.success) {
                throw new Error(result.error ?? "Failed to send request");
            }

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
                            ) : style.video_url ? (
                                <video
                                    src={style.video_url}
                                    className="h-full w-full object-cover"
                                    muted
                                    loop
                                    playsInline
                                    autoPlay
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
                                Title <span className="font-normal text-gray-400">— optional</span>
                            </label>
                            <select
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-900 outline-none focus:border-gray-900"
                            >
                                <option value="">Select title</option>
                                {TITLES.map((t) => (
                                    <option key={t} value={t}>{t}</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                    First Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={firstName}
                                    onChange={(e) => setFirstName(capitalizeWords(e.target.value))}
                                    placeholder="e.g. Sarah"
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-900"
                                />
                            </div>
                            <div>
                                <label className="mb-1 block text-xs font-medium text-gray-600">
                                    Last Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    value={lastName}
                                    onChange={(e) => setLastName(capitalizeWords(e.target.value))}
                                    placeholder="e.g. Johnson"
                                    className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-900"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="mb-1 block text-xs font-medium text-gray-600">
                                WhatsApp Number <span className="text-red-500">*</span>
                            </label>
                            <input
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="e.g. 08012345678"
                                type="tel"
                                className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3.5 text-sm text-gray-900 placeholder:text-gray-400 outline-none focus:border-gray-900"
                            />
                            <p className="mt-1 text-xs text-gray-400">
                                The designer will contact you on this number
                            </p>
                        </div>
                    </div>
                </section>

                {/* VOICE NOTE */}
                <section className="rounded-2xl bg-white p-5 shadow-sm">
                    <h2 className="mb-1 text-sm font-bold text-gray-900">
                        Voice Note <span className="font-normal text-gray-400">— optional</span>
                    </h2>
                    <p className="mb-4 text-xs text-gray-400">
                        Record any customisation instructions for the designer.
                    </p>

                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-4">

                        {isRecording ? (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3">
                                    <span className="flex h-2.5 w-2.5 flex-shrink-0 rounded-full bg-red-500 animate-pulse" />
                                    <span className="text-xs font-semibold text-red-600">
                                        Recording • {formatTime(recordingSeconds)}
                                    </span>
                                </div>
                                <div className="flex h-12 items-end justify-center gap-[3px] rounded-xl bg-white px-3 py-2">
                                    {waveform.map((h, i) => (
                                        <div
                                            key={i}
                                            className="w-1 flex-shrink-0 rounded-full bg-emerald-500 transition-all duration-75"
                                            style={{ height: `${h}px` }}
                                        />
                                    ))}
                                </div>
                                <button
                                    onClick={stopRecording}
                                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-600 py-3 text-sm font-semibold text-white"
                                >
                                    <Square size={16} />
                                    Stop Recording
                                </button>
                            </div>
                        ) : !audioBlob ? (
                            <button
                                onClick={startRecording}
                                className="flex w-full items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-sm font-semibold text-white"
                            >
                                <Mic size={16} />
                                Record Voice Note
                            </button>
                        ) : (
                            <div className="space-y-3">
                                <div className="flex items-center gap-3 rounded-xl bg-white p-3">
                                    <button
                                        onClick={playRecording}
                                        className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-emerald-600 text-white"
                                    >
                                        {audioPlaying ? <Pause size={16} /> : <Play size={16} />}
                                    </button>
                                    <div className="flex h-8 flex-1 items-end gap-[3px] overflow-hidden">
                                        {frozenWaveform.map((h, i) => (
                                            <div
                                                key={i}
                                                className="w-1 flex-shrink-0 rounded-full bg-emerald-300"
                                                style={{ height: `${h}px` }}
                                            />
                                        ))}
                                    </div>
                                    <span className="flex-shrink-0 text-xs text-gray-400">
                                        {formatTime(recordingSeconds)}
                                    </span>
                                </div>

                                <button
                                    onClick={() => {
                                        setAudioBlob(null);
                                        setAudioUrl("");
                                        setFrozenWaveform([]);
                                    }}
                                    className="w-full rounded-xl border border-gray-200 py-2 text-xs font-semibold text-gray-600"
                                >
                                    Record Again
                                </button>
                            </div>
                        )}
                    </div>
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
