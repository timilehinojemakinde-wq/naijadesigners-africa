"use client";

import { useState, useRef } from "react";
import { Mic, Square, Play, Pause, Trash2, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

type Props = {
    jobId: string;
    existingUrl: string | null;
    onSaved: (url: string) => void;
};

export default function VoiceNoteRecorder({ jobId, existingUrl, onSaved }: Props) {
    const [recording, setRecording] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [playing, setPlaying] = useState(false);
    const [error, setError] = useState("");

    const mediaRecorderRef = useRef<MediaRecorder | null>(null);
    const chunksRef = useRef<Blob[]>([]);
    const audioRef = useRef<HTMLAudioElement | null>(null);
    const streamRef = useRef<MediaStream | null>(null);

    const startRecording = async () => {
        setError("");
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            streamRef.current = stream;

            const recorder = new MediaRecorder(stream);
            mediaRecorderRef.current = recorder;
            chunksRef.current = [];

            recorder.ondataavailable = (e) => {
                if (e.data.size > 0) chunksRef.current.push(e.data);
            };

            recorder.onstop = async () => {
                const blob = new Blob(chunksRef.current, { type: "audio/webm" });
                await uploadVoiceNote(blob);
                streamRef.current?.getTracks().forEach((t) => t.stop());
            };

            recorder.start();
            setRecording(true);
        } catch (err: any) {
            setError("Microphone access denied. Please allow microphone access.");
        }
    };

    const stopRecording = () => {
        mediaRecorderRef.current?.stop();
        setRecording(false);
    };

    const uploadVoiceNote = async (blob: Blob) => {
        setUploading(true);
        try {
            const fileName = `${jobId}/${Date.now()}.webm`;

            const { error: uploadError } = await supabase.storage
                .from("job-voice-notes")
                .upload(fileName, blob, { contentType: "audio/webm" });

            if (uploadError) throw uploadError;

            const { data: urlData } = supabase.storage
                .from("job-voice-notes")
                .getPublicUrl(fileName);

            await supabase
                .from("jobs")
                .update({ voice_note_url: urlData.publicUrl })
                .eq("id", jobId);

            onSaved(urlData.publicUrl);
        } catch (err: any) {
            setError("Upload failed: " + err.message);
        }
        setUploading(false);
    };

    const togglePlay = () => {
        if (!audioRef.current) return;
        if (playing) {
            audioRef.current.pause();
        } else {
            audioRef.current.play();
        }
        setPlaying(!playing);
    };

    const deleteVoiceNote = async () => {
        if (!confirm("Delete this voice note?")) return;
        await supabase.from("jobs").update({ voice_note_url: null }).eq("id", jobId);
        onSaved("");
    };

    if (existingUrl) {
        return (
            <div className="rounded-xl bg-gray-50 p-3">
                <audio
                    ref={audioRef}
                    src={existingUrl}
                    onEnded={() => setPlaying(false)}
                    hidden
                />
                <div className="flex items-center gap-3">
                    <button
                        onClick={togglePlay}
                        className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-gray-900 text-white"
                    >
                        {playing ? <Pause size={14} /> : <Play size={14} className="ml-0.5" />}
                    </button>
                    <div className="flex-1">
                        <p className="text-xs font-semibold text-gray-900">Customer Voice Note</p>
                        <p className="text-[10px] text-gray-400">Tap to play</p>
                    </div>
                    <button
                        onClick={deleteVoiceNote}
                        className="flex h-8 w-8 items-center justify-center rounded-full text-gray-400 hover:text-red-500"
                    >
                        <Trash2 size={14} />
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div>
            {!recording ? (
                <button
                    onClick={startRecording}
                    disabled={uploading}
                    className="flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-gray-300 py-3 text-xs font-semibold text-gray-500 disabled:opacity-50"
                >
                    {uploading ? (
                        <><Loader2 size={14} className="animate-spin" /> Uploading...</>
                    ) : (
                        <><Mic size={14} /> Record Voice Note</>
                    )}
                </button>
            ) : (
                <button
                    onClick={stopRecording}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-red-500 py-3 text-xs font-semibold text-white animate-pulse"
                >
                    <Square size={14} /> Stop Recording
                </button>
            )}
            {error && <p className="mt-1.5 text-[10px] text-red-500">{error}</p>}
        </div>
    );
}