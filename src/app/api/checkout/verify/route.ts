import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function GET(req: NextRequest) {
    const reference = req.nextUrl.searchParams.get("reference");
    const slug = req.nextUrl.searchParams.get("slug") ?? "";

    if (!reference) {
        return NextResponse.redirect(new URL(`/store/${slug}?payment=missing_reference`, req.url));
    }

    try {
        const verifyRes = await fetch(
            `https://api.paystack.co/transaction/verify/${reference}`,
            { headers: { Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}` } }
        );
        const verifyData = await verifyRes.json();

        const supabase = await createSupabaseServerClient();

        if (verifyData.status && verifyData.data.status === "success") {
            await supabase
                .from("orders")
                .update({ status: "paid" })
                .eq("payment_reference", reference);

            return NextResponse.redirect(
                new URL(`/store/${slug}/order/${reference}?status=success`, req.url)
            );
        } else {
            await supabase
                .from("orders")
                .update({ status: "failed" })
                .eq("payment_reference", reference);

            return NextResponse.redirect(
                new URL(`/store/${slug}/order/${reference}?status=failed`, req.url)
            );
        }
    } catch (err: any) {
        return NextResponse.redirect(new URL(`/store/${slug}?payment=error`, req.url));
    }
}
