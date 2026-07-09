"use client";

import { useEffect, useState, useRef, Suspense, useCallback } from "react";
import { useParams } from "next/navigation";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
    Check, ArrowRight, ArrowLeft,
    Loader2, AlertTriangle, Edit3,
    RotateCcw, Camera, Upload,
} from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

// ── TYPES ─────────────────────────────────────────────────
type Job = {
    id: string;
    title: string | null;
    designer_id: string;
    client_id: string | null;
};

type Designer = {
    brand_name: string | null;
};

type RawMeasurement = {
    label: string;
    value: string;
    unit: string;
};

type AnalysisResult = {
    measurements: RawMeasurement[];
    advisorNote: string;
    confidence: number;
    style: string;
};

const STEPS = [
    "intro",
    "setup",
    "front_photo",
    "side_photo",
    "processing",
    "review",
    "success",
] as const;

type Step = typeof STEPS[number];

const GARMENT_STYLES = [
    { value: "senator", label: "Senator / Kaftan", emoji: "👘" },
    { value: "suit", label: "Formal Suit", emoji: "👔" },
    { value: "gown", label: "Gown / Dress", emoji: "👗" },
    { value: "skirt_blouse", label: "Skirt & Blouse", emoji: "👚" },
];

const GENDER_OPTIONS = [
    { value: "male", label: "Male" },
    { value: "female", label: "Female" },
];

// ── HELPERS ───────────────────────────────────────────────
function loadScript(src: string): Promise<void> {
    return new Promise((resolve, reject) => {
        if (document.querySelector(`script[src="${src}"]`)) {
            resolve();
            return;
        }
        const script = document.createElement("script");
        script.src = src;
        script.onload = () => resolve();
        script.onerror = () =>
            reject(new Error(`Failed to load ${src}`));
        document.head.appendChild(script);
    });
}

function imageToBase64(img: HTMLImageElement): string {
    const canvas = document.createElement("canvas");
    canvas.width = img.naturalWidth || img.width;
    canvas.height = img.naturalHeight || img.height;
    canvas.getContext("2d")?.drawImage(img, 0, 0);
    return canvas.toDataURL("image/jpeg", 0.85);
}

// ── OVERLAY CANVAS ────────────────────────────────────────
function drawOverlay(
    canvas: HTMLCanvasElement,
    video: HTMLVideoElement,
    isAligned: boolean,
    poseStatus: "searching" | "aligning" | "ready"
) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = video.videoWidth || canvas.offsetWidth;
    canvas.height = video.videoHeight || canvas.offsetHeight;
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const W = canvas.width;
    const H = canvas.height;

    // Color scheme
    const color = poseStatus === "ready"
        ? "#10b981"    // emerald — aligned
        : poseStatus === "aligning"
            ? "#f59e0b"    // amber — close
            : "#ffffff";   // white — searching

    const alpha = poseStatus === "ready" ? 0.9 : 0.5;

    // ── BODY FRAME ──────────────────────────────────────
    const frameW = W * 0.42;
    const frameH = H * 0.88;
    const frameX = (W - frameW) / 2;
    const frameY = (H - frameH) / 2;

    // Dimmed sides outside frame
    ctx.fillStyle = "rgba(0,0,0,0.35)";
    ctx.fillRect(0, 0, frameX, H);
    ctx.fillRect(frameX + frameW, 0, W - (frameX + frameW), H);
    ctx.fillRect(frameX, 0, frameW, frameY);
    ctx.fillRect(frameX, frameY + frameH, frameW, H - (frameY + frameH));

    // Frame border — dashed
    ctx.strokeStyle = `${color}`;
    ctx.globalAlpha = alpha;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([12, 8]);
    ctx.strokeRect(frameX, frameY, frameW, frameH);
    ctx.setLineDash([]);

    // Corner accents
    const corner = 24;
    ctx.lineWidth = 3.5;
    ctx.strokeStyle = color;

    // TL
    ctx.beginPath(); ctx.moveTo(frameX, frameY + corner);
    ctx.lineTo(frameX, frameY); ctx.lineTo(frameX + corner, frameY);
    ctx.stroke();
    // TR
    ctx.beginPath(); ctx.moveTo(frameX + frameW - corner, frameY);
    ctx.lineTo(frameX + frameW, frameY); ctx.lineTo(frameX + frameW, frameY + corner);
    ctx.stroke();
    // BL
    ctx.beginPath(); ctx.moveTo(frameX, frameY + frameH - corner);
    ctx.lineTo(frameX, frameY + frameH); ctx.lineTo(frameX + corner, frameY + frameH);
    ctx.stroke();
    // BR
    ctx.beginPath(); ctx.moveTo(frameX + frameW - corner, frameY + frameH);
    ctx.lineTo(frameX + frameW, frameY + frameH); ctx.lineTo(frameX + frameW, frameY + frameH - corner);
    ctx.stroke();

    // ── HEAD CIRCLE ──────────────────────────────────────
    const headRadius = frameW * 0.18;
    const headCX = W / 2;
    const headCY = frameY + headRadius + (frameH * 0.04);

    // Head circle border
    ctx.beginPath();
    ctx.arc(headCX, headCY, headRadius, 0, Math.PI * 2);
    ctx.strokeStyle = color;
    ctx.lineWidth = 2.5;
    ctx.setLineDash([8, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    // Head label
    ctx.globalAlpha = 0.7;
    ctx.fillStyle = color;
    ctx.font = `bold ${Math.max(10, W * 0.022)}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText("HEAD", headCX, headCY - headRadius - 8);

    // ── WAIST LINE ───────────────────────────────────────
    const waistY = frameY + frameH * 0.48;
    ctx.globalAlpha = 0.5;
    ctx.strokeStyle = color;
    ctx.lineWidth = 1.5;
    ctx.setLineDash([6, 5]);
    ctx.beginPath();
    ctx.moveTo(frameX - 10, waistY);
    ctx.lineTo(frameX + frameW + 10, waistY);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.fillStyle = color;
    ctx.font = `bold ${Math.max(9, W * 0.019)}px system-ui`;
    ctx.textAlign = "left";
    ctx.fillText("WAIST", frameX + frameW + 14, waistY + 4);

    // ── STATUS INSTRUCTION ───────────────────────────────
    ctx.globalAlpha = 1;
    const instrY = frameY + frameH + 28;

    const instructions: Record<typeof poseStatus, string> = {
        searching: "Step back · Full body must fit in frame",
        aligning: "Almost there · Align head with circle",
        ready: "✓ Perfect — stay still",
    };

    ctx.fillStyle = color;
    ctx.font = `600 ${Math.max(11, W * 0.026)}px system-ui`;
    ctx.textAlign = "center";
    ctx.fillText(instructions[poseStatus], W / 2, instrY);

    ctx.globalAlpha = 1;
}

// ── CAMERA CAPTURE COMPONENT ──────────────────────────────
function CameraCapture({
    label,
    guideType,
    onCapture,
}: {
    label: string;
    guideType: "front" | "side";
    onCapture: (dataUrl: string, img: HTMLImageElement) => void;
}) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const overlayRef = useRef<HTMLCanvasElement>(null);
    const captureRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);
    const detectorRef = useRef<any>(null);
    const rafRef = useRef<number>(0);

    const [mode, setMode] = useState<"idle" | "camera" | "captured">("idle");
    const [poseStatus, setPoseStatus] = useState<"searching" | "aligning" | "ready">("searching");
    const [capturedUrl, setCapturedUrl] = useState<string | null>(null);
    const [countdown, setCountdown] = useState<number | null>(null);
    const [error, setError] = useState("");
    const [loadingModel, setLoadingModel] = useState(false);
    const countdownRef = useRef<NodeJS.Timeout | null>(null);

    // Load MoveNet for pose alignment (lightweight, 3MB)
    const loadPoseDetector = async () => {
        try {
            await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-core@4.10.0/dist/tf-core.min.js");
            await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-converter@4.10.0/dist/tf-converter.min.js");
            await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow/tfjs-backend-webgl@4.10.0/dist/tf-backend-webgl.min.js");
            await loadScript("https://cdn.jsdelivr.net/npm/@tensorflow-models/pose-detection@2.1.3/dist/pose-detection.min.js");
            const tf = (window as any).tf;
            const poseDetection = (window as any).poseDetection;
            if (!tf || !poseDetection) return;

            await tf.ready();

            const detector = await poseDetection.createDetector(
                "MoveNet",
                {
                    modelType: "SinglePose.Lightning",
                }
            );
            detectorRef.current = detector;
        } catch (err) {
            console.warn("Pose detector failed to load — manual capture only", err);
        }
    };

    const startCamera = async () => {
        setError("");
        setLoadingModel(true);

        if (!navigator.mediaDevices?.getUserMedia) {
            setError("Camera not supported. Please use Upload Photo instead.");
            setLoadingModel(false);
            return;
        }

        if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
            setError("Camera requires HTTPS. Please use Upload Photo instead.");
            setLoadingModel(false);
            return;
        }

        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: {
                    facingMode: { ideal: "environment" },
                    width: { ideal: 1280 },
                    height: { ideal: 720 },
                },
            });

            streamRef.current = stream;
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
                await videoRef.current.play();
            }

            setMode("camera");
            setPoseStatus("searching");

            // Load pose detector in background
            await loadPoseDetector();
            setLoadingModel(false);
            startDetectionLoop();
        } catch (err: any) {
            setLoadingModel(false);
            if (err.name === "NotAllowedError") {
                setError("Camera permission denied. Please use Upload Photo instead.");
            } else if (err.name === "NotFoundError") {
                setError("No camera found. Please use Upload Photo instead.");
            } else if (err.name === "NotReadableError") {
                setError("Camera in use by another app. Please close it and try again.");
            } else {
                // Fallback — simpler constraints
                try {
                    const fallback = await navigator.mediaDevices.getUserMedia({ video: true });
                    streamRef.current = fallback;
                    if (videoRef.current) {
                        videoRef.current.srcObject = fallback;
                        await videoRef.current.play();
                    }
                    setMode("camera");
                    startDetectionLoop();
                } catch {
                    setError("Could not access camera. Please use Upload Photo instead.");
                }
            }
        }
    };

    const stopCamera = useCallback(() => {
        cancelAnimationFrame(rafRef.current);
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
        if (videoRef.current) videoRef.current.srcObject = null;
    }, []);

    useEffect(() => () => stopCamera(), [stopCamera]);

    const checkAlignment = useCallback(async () => {
        const video = videoRef.current;
        const overlay = overlayRef.current;
        if (!video || !overlay || video.readyState < 2) return "searching";

        let status: "searching" | "aligning" | "ready" = "searching";

        if (detectorRef.current) {
            try {
                const poses = await detectorRef.current.estimatePoses(video);
                if (poses.length > 0) {
                    const kps = poses[0].keypoints;
                    const get = (name: string) =>
                        kps.find((k: any) => k.name === name);

                    const nose = get("nose");
                    const leftAnkle = get("left_ankle");
                    const rightAnkle = get("right_ankle");
                    const leftShoulder = get("left_shoulder");
                    const rightShoulder = get("right_shoulder");

                    const W = video.videoWidth;
                    const H = video.videoHeight;
                    const frameX = W * 0.29;
                    const frameW = W * 0.42;
                    const frameY = H * 0.06;
                    const frameH = H * 0.88;

                    const headCY = frameY + frameW * 0.18 + frameH * 0.04;
                    const isVisible = (kp: any) => kp && (kp.score ?? 0) > 0.4;

                    const noseInCircle = nose && isVisible(nose) &&
                        Math.abs(nose.x - W / 2) < frameW * 0.22 &&
                        Math.abs(nose.y - headCY) < frameW * 0.22;

                    const anklesInFrame = isVisible(leftAnkle) || isVisible(rightAnkle);
                    const shouldersVisible = isVisible(leftShoulder) && isVisible(rightShoulder);

                    if (noseInCircle && shouldersVisible && anklesInFrame) {
                        status = "ready";
                    } else if (shouldersVisible) {
                        status = "aligning";
                    }
                }
            } catch (e) {
                // Detector error — ignore
            }
        }

        drawOverlay(overlay, video, status === "ready", status);
        return status;
    }, []);

    const startDetectionLoop = useCallback(() => {
        let lastCheck = 0;

        const loop = async () => {
            const now = Date.now();
            if (now - lastCheck > 150) {
                const status = await checkAlignment();
                setPoseStatus(status);
                lastCheck = now;
            }
            rafRef.current = requestAnimationFrame(loop);
        };

        rafRef.current = requestAnimationFrame(loop);
    }, [checkAlignment]);

    // Auto-capture countdown when ready
    useEffect(() => {
        if (poseStatus === "ready" && mode === "camera" && !countdownRef.current) {
            setCountdown(3);
            let count = 3;
            countdownRef.current = setInterval(() => {
                count -= 1;
                setCountdown(count);
                if (count <= 0) {
                    clearInterval(countdownRef.current!);
                    countdownRef.current = null;
                    capturePhoto();
                }
            }, 1000);
        } else if (poseStatus !== "ready" && countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
            setCountdown(null);
        }
    }, [poseStatus, mode]);

    const capturePhoto = useCallback(() => {
        const video = videoRef.current;
        const canvas = captureRef.current;
        if (!video || !canvas) return;

        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        // Draw video frame
        ctx.drawImage(video, 0, 0);

        // Draw overlay onto captured image so Gemini sees the frame
        if (overlayRef.current) {
            ctx.drawImage(overlayRef.current, 0, 0);
        }

        const dataUrl = canvas.toDataURL("image/jpeg", 0.9);
        const img = new Image();
        img.onload = () => {
            stopCamera();
            setCapturedUrl(dataUrl);
            setMode("captured");
            onCapture(dataUrl, img);
        };
        img.src = dataUrl;
    }, [onCapture, stopCamera]);

    const handleManualCapture = () => {
        if (countdownRef.current) {
            clearInterval(countdownRef.current);
            countdownRef.current = null;
            setCountdown(null);
        }
        capturePhoto();
    };

    const retake = () => {
        setCapturedUrl(null);
        setMode("idle");
        setPoseStatus("searching");
        startCamera();
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (ev) => {
            const dataUrl = ev.target?.result as string;
            const img = new Image();
            img.onload = () => {
                setCapturedUrl(dataUrl);
                setMode("captured");
                onCapture(dataUrl, img);
            };
            img.src = dataUrl;
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    return (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            {/* LABEL */}
            <div className="border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-bold text-gray-900">{label}</p>
            </div>

            {/* IDLE */}
            {mode === "idle" && (
                <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
                    <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                        <Camera size={28} className="text-gray-400" />
                    </div>
                    <p className="mb-4 text-sm text-gray-500">
                        Take a photo or upload from gallery
                    </p>
                    <div className="flex w-full gap-2">
                        <button
                            onClick={startCamera}
                            disabled={loadingModel}
                            className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-xs font-semibold text-white disabled:opacity-50"
                        >
                            {loadingModel
                                ? <><Loader2 size={13} className="animate-spin" /> Loading...</>
                                : <><Camera size={13} /> Open Camera</>
                            }
                        </button>
                        <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-xs font-semibold text-gray-700">
                            <Upload size={13} /> Upload Photo
                            <input type="file" accept="image/*" hidden onChange={handleFileUpload} />
                        </label>
                    </div>
                    {error && <p className="mt-3 text-xs text-red-600">{error}</p>}
                </div>
            )}

            {/* CAMERA */}
            {mode === "camera" && (
                <div className="relative bg-black">
                    {/* Video */}
                    <video
                        ref={videoRef}
                        className="h-[380px] w-full object-cover"
                        autoPlay
                        playsInline
                        muted
                    />

                    {/* Overlay canvas — shows frame, head circle, waist line */}
                    <canvas
                        ref={overlayRef}
                        className="absolute inset-0 h-full w-full"
                        style={{ pointerEvents: "none" }}
                    />

                    {/* Hidden capture canvas */}
                    <canvas ref={captureRef} className="hidden" />

                    {/* Pose status badge */}
                    <div className="absolute left-0 right-0 top-3 flex justify-center">
                        <div className={`rounded-full px-3 py-1 text-[11px] font-bold backdrop-blur-sm ${poseStatus === "ready"
                            ? "bg-emerald-500/90 text-white"
                            : poseStatus === "aligning"
                                ? "bg-amber-400/90 text-white"
                                : "bg-black/60 text-white"
                            }`}>
                            {poseStatus === "ready"
                                ? "✓ Hold Still"
                                : poseStatus === "aligning"
                                    ? "Getting close..."
                                    : guideType === "front"
                                        ? "Face camera · Fit body in frame"
                                        : "Turn sideways · Fit body in frame"
                            }
                        </div>
                    </div>

                    {/* Countdown */}
                    {countdown !== null && countdown > 0 && (
                        <div className="absolute inset-0 flex items-center justify-center">
                            <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-500/80 text-4xl font-black text-white">
                                {countdown}
                            </div>
                        </div>
                    )}

                    {/* Manual capture button */}
                    <div className="absolute bottom-5 left-0 right-0 flex items-center justify-center gap-4">
                        <button
                            onClick={handleManualCapture}
                            className={`flex h-16 w-16 items-center justify-center rounded-full border-4 transition-all ${poseStatus === "ready"
                                ? "border-emerald-400 bg-white scale-110 shadow-lg"
                                : "border-white/50 bg-white/20"
                                }`}
                        >
                            <div className={`h-10 w-10 rounded-full ${poseStatus === "ready" ? "bg-emerald-500" : "bg-white/60"
                                }`} />
                        </button>
                    </div>

                    {/* Side guide text */}
                    {guideType === "side" && (
                        <div className="absolute right-3 top-1/2 -translate-y-1/2 text-right">
                            <p className="text-[10px] font-bold text-white/70 leading-tight">
                                Turn<br />90°
                            </p>
                        </div>
                    )}
                </div>
            )}

            {/* CAPTURED */}
            {mode === "captured" && capturedUrl && (
                <div className="relative">
                    <img
                        src={capturedUrl}
                        alt="Captured"
                        className="h-[280px] w-full object-cover"
                    />
                    <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                        <div className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 shadow-lg">
                            <Check size={24} className="text-white" strokeWidth={3} />
                        </div>
                    </div>
                    <button
                        onClick={retake}
                        className="absolute bottom-3 right-3 flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-2 text-xs font-medium text-white"
                    >
                        <RotateCcw size={11} /> Retake
                    </button>
                </div>
            )}
        </div>
    );
}

// ── MAIN MEASURE PAGE ─────────────────────────────────────
function MeasureContent() {
    const params = useParams();
    const router = useRouter();
    const token = params.token as string;

    const [job, setJob] = useState<Job | null>(null);
    const [designer, setDesigner] = useState<Designer | null>(null);
    const [loading, setLoading] = useState(true);
    const [notFound, setNotFound] = useState(false);

    const [step, setStep] = useState<Step>("intro");
    const [garmentStyle, setGarmentStyle] = useState("senator");
    const [gender, setGender] = useState("male");
    const [frontImage, setFrontImage] = useState<HTMLImageElement | null>(null);
    const [sideImage, setSideImage] = useState<HTMLImageElement | null>(null);
    const [frontCaptured, setFrontCaptured] = useState(false);
    const [sideCaptured, setSideCaptured] = useState(false);

    const [processing, setProcessing] = useState(false);
    const [processingStep, setProcessingStep] = useState("");
    const [result, setResult] = useState<AnalysisResult | null>(null);
    const [editableResult, setEditableResult] = useState<Record<string, string>>({});

    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    useEffect(() => {
        const load = async () => {
            const { data: jobData } = await supabase
                .from("jobs")
                .select("id, title, designer_id, client_id")
                .eq("measurement_token", token)
                .single();

            if (!jobData) { setNotFound(true); setLoading(false); return; }
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

    const runProcessing = async () => {
        if (!frontImage || !sideImage) return;

        setStep("processing");
        setProcessing(true);
        setError("");

        try {
            setProcessingStep("Sending photos to AI...");

            const frontBase64 = imageToBase64(frontImage);
            const sideBase64 = imageToBase64(sideImage);

            const response = await fetch("/api/measurements/analyze", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    frontImage: frontBase64,
                    sideImage: sideBase64,
                    style: garmentStyle,
                    gender,
                }),
            });

            setProcessingStep("Extracting measurements...");

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error ?? "Analysis failed");
            }

            const data: AnalysisResult = await response.json();
            setResult(data);

            const editable: Record<string, string> = {};
            data.measurements.forEach((m) => { editable[m.label] = m.value; });
            setEditableResult(editable);

            setStep("review");
        } catch (err: any) {
            setError(err.message ?? "Analysis failed. Please retake photos.");
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
            // Map measurement labels to standard DB fields
            const findVal = (keywords: string[]) => {
                const entry = Object.entries(editableResult).find(([label]) =>
                    keywords.some(kw => label.toLowerCase().includes(kw))
                );
                return entry ? parseFloat(entry[1]) || null : null;
            };

            const payload = {
                designer_id: job.designer_id,
                client_id: job.client_id,
                job_id: job.id,
                scan_method: "gemini_vision",
                confidence_score: result.confidence,
                requires_review: result.confidence < 0.75,
                raw_landmarks: {
                    measurements: result.measurements,
                    advisorNote: result.advisorNote,
                    style: result.style,
                    gender,
                },
                height: findVal(["height"]),
                bust: findVal(["bust"]),
                waist: findVal(["waist", "trouser waist", "skirt waist"]),
                hips: findVal(["hip"]),
                shoulder_width: findVal(["shoulder"]),
                sleeve_length: findVal(["sleeve", "hand length"]),
                inseam: findVal(["inseam", "sokoto", "trouser length"]),
                neck: findVal(["neck"]),
                chest: findVal(["chest"]),
                thigh: findVal(["thigh", "lap round"]),
            };

            const { error: insertError } = await supabase
                .from("measurements")
                .insert(payload);

            if (insertError) throw insertError;

            await supabase
                .from("jobs")
                .update({ status: "measurement_done" })
                .eq("id", job.id);

            await supabase.from("job_updates").insert({
                job_id: job.id,
                status: "measurement_done",
                note: `AI measurements submitted via Gemini Vision (confidence: ${Math.round(result.confidence * 100)}%)`,
                notify_client: false,
            });

            setSubmitted(true);
            setStep("success");
        } catch (err: any) {
            setError("Failed to submit: " + err.message);
            setSubmitting(false);
        }
    };

    // ── LOADING ──────────────────────────────────────────
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

    // ── SUCCESS ──────────────────────────────────────────
    if (step === "success" && result) {
        return (
            <main className="flex min-h-screen flex-col items-center justify-center bg-gray-50 px-5">
                <div className="w-full max-w-md">
                    <div className="mb-5 flex justify-center">
                        <div className="flex h-20 w-20 items-center justify-center rounded-full bg-emerald-600">
                            <Check size={36} className="text-white" strokeWidth={3} />
                        </div>
                    </div>
                    <h1 className="mb-2 text-center text-2xl font-bold text-gray-900">
                        Measurements Sent! 🎉
                    </h1>
                    <p className="mb-6 text-center text-sm text-gray-500">
                        Your measurements have been sent to{" "}
                        <span className="font-semibold text-gray-700">
                            {designer?.brand_name}
                        </span>
                        .
                    </p>

                    {/* Advisor note */}
                    {result.advisorNote && (
                        <div className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-100 p-4">
                            <p className="text-xs font-semibold uppercase tracking-widest text-emerald-600 mb-1">
                                Tailor's Note
                            </p>
                            <p className="text-sm italic text-emerald-800">
                                {result.advisorNote}
                            </p>
                        </div>
                    )}

                    {/* All measurements */}
                    <div className="rounded-2xl bg-white p-5 shadow-sm">
                        <div className="mb-3 flex items-center justify-between">
                            <p className="text-xs font-bold uppercase tracking-widest text-gray-400">
                                {result.style} Measurements (cm)
                            </p>
                            <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${result.confidence >= 0.8
                                ? "bg-emerald-100 text-emerald-700"
                                : "bg-amber-100 text-amber-700"
                                }`}>
                                {Math.round(result.confidence * 100)}% confidence
                            </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2">
                            {result.measurements.map((m, i) => (
                                <div key={i} className="rounded-xl bg-gray-50 px-3 py-2">
                                    <p className="text-[10px] text-gray-400 truncate">{m.label}</p>
                                    <p className="text-sm font-semibold text-gray-900">
                                        {parseFloat(m.value).toFixed(1)} cm
                                    </p>
                                </div>
                            ))}
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
                        {designer?.brand_name} — Body Scan
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
                                We take two guided photos and our AI extracts your precise measurements. Takes about 60 seconds.
                            </p>
                        </div>

                        <div className="rounded-2xl bg-white p-5 shadow-sm">
                            <p className="mb-3 text-xs font-bold uppercase tracking-widest text-gray-400">
                                What you need
                            </p>
                            <div className="space-y-3">
                                {[
                                    { emoji: "👕", text: "Wear tight-fitting clothes or form-fitting underwear" },
                                    { emoji: "📱", text: "Someone to hold the camera for you, 2–3 metres away" },
                                    { emoji: "💡", text: "Good lighting and a plain background" },
                                    { emoji: "📐", text: "Stand inside the on-screen frame guides" },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center gap-3">
                                        <span className="text-xl">{item.emoji}</span>
                                        <p className="text-sm text-gray-700">{item.text}</p>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setStep("setup")}
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-semibold text-white"
                        >
                            Get Started <ArrowRight size={16} />
                        </button>
                    </>
                )}

                {/* ── SETUP ──────────────────────────────── */}
                {step === "setup" && (
                    <>
                        <div className="flex gap-1.5">
                            <div className="h-1 flex-1 rounded-full bg-emerald-600" />
                            <div className="h-1 flex-1 rounded-full bg-gray-200" />
                            <div className="h-1 flex-1 rounded-full bg-gray-200" />
                        </div>

                        <div className="rounded-2xl bg-white p-5 shadow-sm">
                            <h2 className="mb-4 text-sm font-bold text-gray-900">
                                What are you getting made?
                            </h2>
                            <div className="grid grid-cols-2 gap-2">
                                {GARMENT_STYLES.map((s) => (
                                    <button
                                        key={s.value}
                                        onClick={() => setGarmentStyle(s.value)}
                                        className={`flex flex-col items-start rounded-xl border p-3.5 text-left transition ${garmentStyle === s.value
                                            ? "border-emerald-600 bg-emerald-50"
                                            : "border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        <span className="mb-1 text-xl">{s.emoji}</span>
                                        <span className={`text-xs font-semibold ${garmentStyle === s.value ? "text-emerald-700" : "text-gray-800"
                                            }`}>
                                            {s.label}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>

                        <div className="rounded-2xl bg-white p-5 shadow-sm">
                            <h2 className="mb-3 text-sm font-bold text-gray-900">Gender</h2>
                            <div className="flex gap-2">
                                {GENDER_OPTIONS.map((g) => (
                                    <button
                                        key={g.value}
                                        onClick={() => setGender(g.value)}
                                        className={`flex-1 rounded-xl border py-3 text-sm font-semibold transition ${gender === g.value
                                            ? "border-emerald-600 bg-emerald-50 text-emerald-700"
                                            : "border-gray-200 text-gray-700"
                                            }`}
                                    >
                                        {g.label}
                                    </button>
                                ))}
                            </div>
                        </div>

                        <button
                            onClick={() => setStep("front_photo")}
                            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-semibold text-white"
                        >
                            Continue <ArrowRight size={16} />
                        </button>
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
                                📸 Front Photo Guide
                            </p>
                            <ul className="space-y-1 text-xs text-emerald-600">
                                <li>• Fit your HEAD inside the circle at the top</li>
                                <li>• Your FEET must touch the bottom of the frame</li>
                                <li>• Stand straight, arms slightly away from body</li>
                                <li>• The frame turns GREEN when you're aligned</li>
                            </ul>
                        </div>

                        <CameraCapture
                            label="Front View"
                            guideType="front"
                            onCapture={(_, img) => {
                                setFrontImage(img);
                                setFrontCaptured(true);
                            }}
                        />

                        <div className="flex gap-3">
                            <button
                                onClick={() => setStep("setup")}
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
                                📸 Side Photo Guide
                            </p>
                            <ul className="space-y-1 text-xs text-emerald-600">
                                <li>• Turn exactly 90° to your right</li>
                                <li>• Fit your HEAD in the circle, FEET at the bottom</li>
                                <li>• Arms relaxed at your sides</li>
                                <li>• The frame turns GREEN when aligned</li>
                            </ul>
                        </div>

                        <CameraCapture
                            label="Side View"
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
                        <div className="relative mb-6">
                            <div className="h-24 w-24 animate-spin rounded-full border-4 border-gray-100 border-t-emerald-600" />
                            <div className="absolute inset-0 flex items-center justify-center text-3xl">
                                📏
                            </div>
                        </div>
                        <h2 className="text-lg font-bold text-gray-900">
                            Analysing your photos
                        </h2>
                        <p className="mt-2 text-sm text-gray-400">
                            {processingStep || "AI is reading your measurements..."}
                        </p>
                        <p className="mt-1 text-xs text-gray-300">
                            Usually takes 5–10 seconds
                        </p>
                    </div>
                )}

                {/* ── REVIEW ─────────────────────────────── */}
                {step === "review" && result && (
                    <>
                        {/* Confidence badge */}
                        <div className={`rounded-2xl border p-4 ${result.confidence >= 0.8
                            ? "border-emerald-100 bg-emerald-50"
                            : "border-amber-100 bg-amber-50"
                            }`}>
                            <div className="flex items-center gap-2">
                                {result.confidence >= 0.8
                                    ? <Check size={15} className="text-emerald-600" />
                                    : <AlertTriangle size={15} className="text-amber-600" />
                                }
                                <p className={`text-sm font-semibold ${result.confidence >= 0.8 ? "text-emerald-800" : "text-amber-800"
                                    }`}>
                                    {result.confidence >= 0.8
                                        ? "Measurements look good!"
                                        : "Please review your measurements"}
                                </p>
                            </div>
                            <p className={`mt-1 text-xs ${result.confidence >= 0.8 ? "text-emerald-600" : "text-amber-600"
                                }`}>
                                AI confidence: {Math.round(result.confidence * 100)}%
                                {result.confidence < 0.8 && " — Check and correct any values below"}
                            </p>
                        </div>

                        {/* Advisor note */}
                        {result.advisorNote && (
                            <div className="rounded-2xl bg-gray-50 border border-gray-200 p-4">
                                <p className="text-xs font-semibold text-gray-500 mb-1">
                                    Tailor's Note
                                </p>
                                <p className="text-sm italic text-gray-700">
                                    {result.advisorNote}
                                </p>
                            </div>
                        )}

                        {/* Editable measurements */}
                        <div className="rounded-2xl bg-white p-5 shadow-sm">
                            <div className="mb-4 flex items-center justify-between">
                                <h2 className="text-sm font-bold text-gray-900">
                                    {result.style} Measurements
                                </h2>
                                <div className="flex items-center gap-1 text-xs text-gray-400">
                                    <Edit3 size={11} /> Tap to edit
                                </div>
                            </div>

                            <div className="space-y-2">
                                {result.measurements.map((m, i) => (
                                    <div key={i} className="flex items-center justify-between py-2 border-b border-gray-50 last:border-0">
                                        <label className="text-xs text-gray-600 flex-1 min-w-0 pr-3 truncate">
                                            {m.label}
                                        </label>
                                        <div className="flex items-center gap-1.5 flex-shrink-0">
                                            <input
                                                type="number"
                                                value={editableResult[m.label] ?? m.value}
                                                onChange={(e) =>
                                                    setEditableResult(prev => ({
                                                        ...prev,
                                                        [m.label]: e.target.value,
                                                    }))
                                                }
                                                className="h-9 w-20 rounded-lg border border-gray-200 px-2 text-right text-sm font-semibold outline-none focus:border-emerald-500"
                                            />
                                            <span className="text-[10px] text-gray-400">cm</span>
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