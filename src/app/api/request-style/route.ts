import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
);

export async function POST(request: Request) {
    try {
        const formData = await request.formData();

        const designerId = formData.get("designerId") as string;
        const styleId = formData.get("styleId") as string | null;
        const styleTitle = formData.get("styleTitle") as string | null;
        const styleImages = JSON.parse((formData.get("styleImages") as string) ?? "[]");
        const fullName = formData.get("fullName") as string;
        const phone = formData.get("phone") as string;
        const email = formData.get("email") as string | null;
        const notes = formData.get("notes") as string | null;
        const audioFile = formData.get("voiceNote") as File | null;

        if (!designerId || !fullName?.trim() || !phone?.trim()) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Find or create client
        const { data: existingClient } = await supabase
            .from("clients")
            .select("id")
            .eq("designer_id", designerId)
            .eq("phone", phone.trim())
            .maybeSingle();

        let clientId = existingClient?.id;

        if (!clientId) {
            const { data: newClient, error: clientError } = await supabase
                .from("clients")
                .insert({
                    designer_id: designerId,
                    full_name: fullName.trim(),
                    phone: phone.trim(),
                    email: email?.trim() || null,
                })
                .select("id")
                .single();

            if (clientError) throw new Error(clientError.message);
            clientId = newClient.id;
        }

        // Upload voice note server-side (bypasses RLS via service role)
        let voiceNoteUrl: string | null = null;

        if (audioFile) {
            const arrayBuffer = await audioFile.arrayBuffer();
            const buffer = Buffer.from(arrayBuffer);
            const fileName = `${crypto.randomUUID()}.webm`;

            const { error: uploadError } = await supabase.storage
                .from("job-voice-notes")
                .upload(fileName, buffer, { contentType: "audio/webm" });

            if (uploadError) throw new Error(uploadError.message);

            const { data: urlData } = supabase.storage
                .from("job-voice-notes")
                .getPublicUrl(fileName);

            voiceNoteUrl = urlData.publicUrl;
        }

        const jobTitle = styleTitle
            ? `${styleTitle} — ${fullName.trim()}`
            : `Style Request — ${fullName.trim()}`;

        const fullNotes = [
            styleTitle ? `Style: ${styleTitle}` : null,
            notes?.trim() ? `Customer notes: ${notes.trim()}` : null,
        ].filter(Boolean).join("\n\n");

        const jobNumber = `FH-${Date.now().toString().slice(-6)}`;

        const { data: job, error: jobError } = await supabase
            .from("jobs")
            .insert({
                designer_id: designerId,
                client_id: clientId,
                job_number: jobNumber,
                title: jobTitle,
                style_images: styleImages ?? [],
                style_notes: fullNotes || null,
                voice_note_url: voiceNoteUrl,
                status: "inquiry",
            })
            .select("id")
            .single();

        if (jobError) throw new Error(jobError.message);

        await supabase.from("job_updates").insert({
            job_id: job.id,
            status: "inquiry",
            note: `Request received from catalogue — ${fullName.trim()}`,
            notify_client: false,
        });

        return NextResponse.json({ success: true, jobId: job.id });

    } catch (error: any) {
        console.error("request-style error:", error);
        return NextResponse.json(
            { success: false, error: error.message ?? "Something went wrong" },
            { status: 500 }
        );
    }
}