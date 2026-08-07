import { NextRequest, NextResponse } from "next/server";
import { notifyDesigner } from "@/lib/sendPush";

export async function POST(req: NextRequest) {
    try {
        const { designerId, title, body, link, type } = await req.json();

        if (!designerId || !title || !body) {
            return NextResponse.json({ success: false, error: "Missing required fields" }, { status: 400 });
        }

        await notifyDesigner({ designerId, title, body, link, type });

        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error("notify-designer error:", err);
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}