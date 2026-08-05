import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { notifyDesigner } from "@/lib/sendPush";

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
);

export async function GET(req: NextRequest) {
    const authHeader = req.headers.get("authorization");
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json({ success: false, error: "Unauthorized" }, { status: 401 });
    }

    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const tomorrowStr = tomorrow.toISOString().split("T")[0];

    const { data: jobs, error } = await supabase
        .from("jobs")
        .select("id, title, designer_id, client_id, clients(full_name)")
        .eq("expected_delivery", tomorrowStr)
        .not("status", "in", "(delivered,cancelled)");

    if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    for (const job of jobs ?? []) {
        const clientName = (job as any).clients?.full_name ?? "a client";
        await notifyDesigner({
            designerId: job.designer_id,
            type: "job_due_soon",
            title: "Job Due Tomorrow ⏰",
            body: `${job.title ?? "A job"} for ${clientName} is due tomorrow`,
            link: `/designer-dashboard/jobs/${job.id}`,
        });
    }

    return NextResponse.json({ success: true, notified: jobs?.length ?? 0 });
}
