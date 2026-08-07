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

    const threeDaysFromNow = new Date(Date.now() + 3 * 86400000);

    const { data: designers, error } = await supabase
        .from("designers")
        .select("id, brand_name, trial_ends_at")
        .eq("approval_status", "approved")
        .eq("plan", "trial")
        .lte("trial_ends_at", threeDaysFromNow.toISOString())
        .gte("trial_ends_at", new Date().toISOString());

    if (error) {
        return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    for (const designer of designers ?? []) {
        const daysLeft = Math.ceil(
            (new Date(designer.trial_ends_at).getTime() - Date.now()) / 86400000
        );

        await notifyDesigner({
            designerId: designer.id,
            title: "Your trial is ending soon ⏳",
            body: `Your free trial ends in ${daysLeft} day${daysLeft !== 1 ? "s" : ""}. Choose a plan to keep your catalogue and jobs running without interruption.`,
            link: "/designer-dashboard",
            type: "trial_ending",
        });
    }

    return NextResponse.json({ success: true, notified: designers?.length ?? 0 });
}