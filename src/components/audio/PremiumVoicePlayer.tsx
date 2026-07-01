"use client";

import { useEffect, useRef, useState } from "react";
import { Play, Pause } from "lucide-react";

interface PremiumVoicePlayerProps {
    src: string;
}

export default function PremiumVoicePlayer({
    src,
}: PremiumVoicePlayerProps) {

    const audioRef = useRef<HTMLAudioElement | null>(null);

    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTime, setCurrentTime] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {

        const audio = new Audio(src);

        audioRef.current = audio;

        audio.onloadedmetadata = () => {
            setDuration(audio.duration);
        };

        audio.ontimeupdate = () => {
            setCurrentTime(audio.currentTime);
        };

        audio.onended = () => {
            setIsPlaying(false);
            setCurrentTime(0);
        };

        return () => {
            audio.pause();
        };

    }, [src]);

    const togglePlayback = () => {

        if (!audioRef.current) return;

        if (isPlaying) {
            audioRef.current.pause();
            setIsPlaying(false);
        } else {
            audioRef.current.play();
            setIsPlaying(true);
        }

    };

    const formatTime = (seconds: number) => {

        if (!seconds) return "0:00";

        const mins = Math.floor(seconds / 60);
        const secs = Math.floor(seconds % 60);

        return `${mins}:${secs.toString().padStart(2, "0")}`;

    };

    return (

        <div className="rounded-2xl border border-gray-200 bg-white p-5">

            <div className="flex items-center gap-4">

                <button
                    onClick={togglePlayback}
                    className="flex h-14 w-14 items-center justify-center rounded-full bg-emerald-600 text-white transition hover:bg-emerald-700"
                >
                    {isPlaying ? (
                        <Pause size={22} />
                    ) : (
                        <Play size={22} className="ml-0.5" />
                    )}
                </button>

                <div className="flex-1 overflow-hidden">

                    <div className="flex h-12 items-end gap-[3px] overflow-hidden">
                        {Array.from({ length: 40 }).map((_, i) => {
                            const progress =
                                duration > 0 ? currentTime / duration : 0;

                            const activeBars = Math.floor(progress * 40);

                            const heights = [
                                10, 18, 14, 28, 20, 12, 24, 16, 30, 18,
                                12, 22, 16, 26, 14, 20, 30, 16, 24, 12,
                                18, 28, 14, 22, 10, 26, 16, 20, 30, 18,
                                12, 24, 16, 28, 14, 20, 26, 18, 12, 24
                            ];

                            return (
                                <div
                                    key={i}
                                    className={`w-[3px] rounded-full transition-all duration-300 ${i <= activeBars
                                        ? "bg-emerald-600"
                                        : "bg-gray-300"
                                        } ${isPlaying
                                            ? "animate-[wave_1.2s_ease-in-out_infinite]"
                                            : ""
                                        }`}
                                    style={{
                                        height: `${heights[i]}px`,
                                        animationDelay: `${(i % 8) * 120}ms`,
                                    }}
                                />
                            );
                        })}
                    </div>

                    <div className="mt-2 flex justify-between text-xs text-gray-500">

                        <span>{formatTime(currentTime)}</span>

                        <span>{formatTime(duration)}</span>

                    </div>

                </div>

            </div>

        </div>

    );

}