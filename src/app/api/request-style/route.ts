import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Server-side only — service role bypasses RLS safely
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
        const body = await request.json();

        const {
            designerId,
            styleId,
            styleTitle,
            styleImages,
            fullName,
            phone,
            email,
            notes,
        } = body;

        // Validate required fields
        if (!designerId || !fullName?.trim() || !phone?.trim()) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        // Find or create client by phone number
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

        // Build job title and notes
        const jobTitle = styleTitle
            ? `${styleTitle} — ${fullName.trim()}`
            : `Style Request — ${fullName.trim()}`;

        const fullNotes = [
            styleTitle ? `Style: ${styleTitle}` : null,
            notes?.trim() ? `Customer notes: ${notes.trim()}` : null,
        ].filter(Boolean).join("\n\n");

        // Generate job number
        const jobNumber = `FH-${Date.now().toString().slice(-6)}`;

        // Create the job
        const { data: job, error: jobError } = await supabase
            .from("jobs")
            .insert({
                designer_id: designerId,
                client_id: clientId,
                job_number: jobNumber,
                title: jobTitle,
                style_images: styleImages ?? [],
                style_notes: fullNotes || null,
                status: "inquiry",
            })
            .select("id")
            .single();

        if (jobError) throw new Error(jobError.message);

        // Add timeline entry
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