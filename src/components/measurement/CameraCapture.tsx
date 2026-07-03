"use client";

import { useRef, useState, useCallback } from "react";
import { Camera, RotateCcw, Check } from "lucide-react";

type Props = {
    label: string;
    hint: string;
    guideType: "front" | "side";
    onCapture: (imageData: string, imageElement: HTMLImageElement) => void;
};

export default function CameraCapture({
    label,
    hint,
    guideType,
    onCapture,
}: Props) {
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const [mode, setMode] = useState<"idle" | "camera" | "captured">("idle");
    const [capturedImage, setCapturedImage] = useState<string | null>(null);
    const [error, setError] = useState("");

    const startCamera = async () => {
        setError("");

        // Check if mediaDevices API exists at all
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            setError("Camera not supported on this browser. Please try Chrome or Safari, or use 'Upload Photo' instead.");
            return;
        }

        // Check if we're on HTTPS
        if (window.location.protocol !== "https:" && window.location.hostname !== "localhost") {
            setError("Camera requires a secure connection (HTTPS). Please use 'Upload Photo' instead.");
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
        } catch (err: any) {
            console.error("Camera error:", err.name, err.message);

            if (err.name === "NotAllowedError" || err.name === "PermissionDeniedError") {
                setError("Camera access denied. Please allow camera permission in your browser settings, or use 'Upload Photo' instead.");
            } else if (err.name === "NotFoundError" || err.name === "DevicesNotFoundError") {
                setError("No camera found on this device. Please use 'Upload Photo' instead.");
            } else if (err.name === "NotReadableError" || err.name === "TrackStartError") {
                setError("Camera is already in use by another app. Please close other apps and try again, or use 'Upload Photo'.");
            } else if (err.name === "OverconstrainedError") {
                // Retry with simpler constraints
                try {
                    const fallbackStream = await navigator.mediaDevices.getUserMedia({ video: true });
                    streamRef.current = fallbackStream;
                    if (videoRef.current) {
                        videoRef.current.srcObject = fallbackStream;
                        await videoRef.current.play();
                    }
                    setMode("camera");
                    return;
                } catch (fallbackErr) {
                    setError("Could not access camera. Please use 'Upload Photo' instead.");
                }
            } else {
                setError(`Camera error: ${err.message || "Unknown error"}. Please use 'Upload Photo' instead.`);
            }
        }
    };

    const stopCamera = () => {
        if (streamRef.current) {
            streamRef.current.getTracks().forEach((t) => t.stop());
            streamRef.current = null;
        }
    };

    const capture = useCallback(() => {
        if (!videoRef.current || !canvasRef.current) return;

        const video = videoRef.current;
        const canvas = canvasRef.current;
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;

        const ctx = canvas.getContext("2d");
        if (!ctx) return;

        ctx.drawImage(video, 0, 0);
        const imageData = canvas.toDataURL("image/jpeg", 0.9);

        const img = new Image();
        img.onload = () => {
            stopCamera();
            setCapturedImage(imageData);
            setMode("captured");
            onCapture(imageData, img);
        };
        img.src = imageData;
    }, [onCapture]);

    const retake = () => {
        setCapturedImage(null);
        setMode("idle");
        startCamera();
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (event) => {
            const imageData = event.target?.result as string;
            const img = new Image();
            img.onload = () => {
                setCapturedImage(imageData);
                setMode("captured");
                onCapture(imageData, img);
            };
            img.src = imageData;
        };
        reader.readAsDataURL(file);
        e.target.value = "";
    };

    return (
        <div className="overflow-hidden rounded-2xl bg-white shadow-sm">
            {/* HEADER */}
            <div className="border-b border-gray-100 px-4 py-3">
                <p className="text-sm font-bold text-gray-900">{label}</p>
                <p className="text-xs text-gray-400">{hint}</p>
            </div>

            {/* CONTENT */}
            <div className="relative">
                {mode === "idle" && (
                    <div className="flex flex-col items-center justify-center px-5 py-10 text-center">
                        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                            <Camera size={28} className="text-gray-400" />
                        </div>
                        <p className="mb-4 text-sm text-gray-500">
                            Take a photo or upload from your gallery
                        </p>
                        <div className="flex w-full gap-2">
                            <button
                                onClick={startCamera}
                                className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-gray-900 py-3 text-xs font-semibold text-white"
                            >
                                <Camera size={14} />
                                Open Camera
                            </button>
                            <label className="flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 py-3 text-xs font-semibold text-gray-700">
                                Upload Photo
                                <input
                                    type="file"
                                    accept="image/*"
                                    hidden
                                    onChange={handleFileUpload}
                                />
                            </label>
                        </div>
                        {error && (
                            <p className="mt-3 text-xs text-red-600">{error}</p>
                        )}
                    </div>
                )}

                {mode === "camera" && (
                    <div className="relative">
                        <video
                            ref={videoRef}
                            className="h-72 w-full object-cover"
                            playsInline
                            muted
                        />

                        {/* POSE GUIDE OVERLAY */}
                        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
                            {guideType === "front" ? (
                                <svg
                                    viewBox="0 0 100 200"
                                    className="h-64 w-32 opacity-40"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="1.5"
                                >
                                    {/* Head */}
                                    <circle cx="50" cy="15" r="10" />
                                    {/* Body */}
                                    <line x1="50" y1="25" x2="50" y2="90" />
                                    {/* Shoulders */}
                                    <line x1="20" y1="35" x2="80" y2="35" />
                                    {/* Arms */}
                                    <line x1="20" y1="35" x2="10" y2="75" />
                                    <line x1="80" y1="35" x2="90" y2="75" />
                                    {/* Hips */}
                                    <line x1="30" y1="90" x2="70" y2="90" />
                                    {/* Legs */}
                                    <line x1="35" y1="90" x2="30" y2="160" />
                                    <line x1="65" y1="90" x2="70" y2="160" />
                                </svg>
                            ) : (
                                <svg
                                    viewBox="0 0 60 200"
                                    className="h-64 w-20 opacity-40"
                                    fill="none"
                                    stroke="white"
                                    strokeWidth="1.5"
                                >
                                    {/* Head */}
                                    <circle cx="30" cy="15" r="10" />
                                    {/* Body */}
                                    <line x1="30" y1="25" x2="30" y2="90" />
                                    {/* Arm forward */}
                                    <line x1="30" y1="35" x2="55" y2="65" />
                                    {/* Legs */}
                                    <line x1="30" y1="90" x2="25" y2="160" />
                                </svg>
                            )}
                        </div>

                        {/* INSTRUCTION */}
                        <div className="absolute bottom-16 left-0 right-0 text-center">
                            <p className="inline-block rounded-full bg-black/60 px-3 py-1 text-xs text-white">
                                {guideType === "front"
                                    ? "Stand straight, arms slightly out"
                                    : "Turn sideways, arms forward"}
                            </p>
                        </div>

                        {/* CAPTURE BUTTON */}
                        <div className="absolute bottom-4 left-0 right-0 flex justify-center">
                            <button
                                onClick={capture}
                                className="flex h-14 w-14 items-center justify-center rounded-full border-4 border-white bg-white shadow-lg"
                            >
                                <div className="h-10 w-10 rounded-full bg-gray-900" />
                            </button>
                        </div>
                    </div>
                )}

                {mode === "captured" && capturedImage && (
                    <div className="relative">
                        <img
                            src={capturedImage}
                            alt="Captured"
                            className="h-72 w-full object-cover"
                        />
                        <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-600">
                                <Check size={28} className="text-white" strokeWidth={3} />
                            </div>
                        </div>
                        <div className="absolute bottom-4 right-4">
                            <button
                                onClick={retake}
                                className="flex items-center gap-1.5 rounded-full bg-black/70 px-3 py-2 text-xs font-medium text-white"
                            >
                                <RotateCcw size={12} />
                                Retake
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* CANVAS (hidden, used for capture) */}
            <canvas ref={canvasRef} className="hidden" />
        </div>
    );
}