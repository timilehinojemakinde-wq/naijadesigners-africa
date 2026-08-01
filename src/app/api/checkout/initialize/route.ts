import { NextRequest, NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { productId, buyerName, buyerPhone, buyerEmail, quantity, slug } = body;

        if (!productId || !buyerName || !buyerPhone || !buyerEmail) {
            return NextResponse.json(
                { success: false, error: "Missing required fields" },
                { status: 400 }
            );
        }

        const supabase = await createSupabaseServerClient();

        const { data: product, error: productError } = await supabase
            .from("products")
            .select("id, designer_id, price, currency, name, active")
            .eq("id", productId)
            .eq("active", true)
            .single();

        if (productError || !product) {
            return NextResponse.json(
                { success: false, error: "Product not found or unavailable" },
                { status: 404 }
            );
        }

        const qty = Math.max(1, Number(quantity) || 1);
        const amount = Number(product.price) * qty;
        const reference = `ORD-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        const { error: orderError } = await supabase.from("orders").insert({
            designer_id: product.designer_id,
            product_id: product.id,
            buyer_name: buyerName,
            buyer_phone: buyerPhone,
            buyer_email: buyerEmail,
            quantity: qty,
            amount,
            currency: product.currency ?? "NGN",
            status: "pending",
            payment_reference: reference,
            payment_provider: "paystack",
        });

        if (orderError) throw orderError;

        const callbackUrl = `${req.nextUrl.origin}/api/checkout/verify?reference=${reference}&slug=${encodeURIComponent(slug ?? "")}`;

        const paystackRes = await fetch("https://api.paystack.co/transaction/initialize", {
            method: "POST",
            headers: {
                Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                email: buyerEmail,
                amount: Math.round(amount * 100), // Paystack expects kobo
                currency: product.currency ?? "NGN",
                reference,
                callback_url: callbackUrl,
            }),
        });

        const paystackData = await paystackRes.json();

        if (!paystackData.status) {
            return NextResponse.json(
                { success: false, error: paystackData.message ?? "Could not start payment" },
                { status: 500 }
            );
        }

        return NextResponse.json({
            success: true,
            authorizationUrl: paystackData.data.authorization_url,
        });
    } catch (err: any) {
        return NextResponse.json({ success: false, error: err.message }, { status: 500 });
    }
}
