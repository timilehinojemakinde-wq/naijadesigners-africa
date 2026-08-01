"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";

type Props = {
    productId: string;
    productName: string;
    price: number;
    currency: string;
    slug: string;
};

export default function CheckoutForm({ productId, productName, price, currency, slug }: Props) {
    const [name, setName] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [quantity, setQuantity] = useState(1);
    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState("");

    const total = price * quantity;

    const handleCheckout = async () => {
        setError("");

        if (!name.trim()) { setError("Please enter your name."); return; }
        if (!phone.trim()) { setError("Please enter your phone number."); return; }
        if (!email.trim()) { setError("Please enter your email — needed for payment receipt."); return; }

        setSubmitting(true);

        try {
            const res = await fetch("/api/checkout/initialize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    productId,
                    buyerName: name,
                    buyerPhone: phone,
                    buyerEmail: email,
                    quantity,
                    slug,
                }),
            });

            const data = await res.json();

            if (!data.success) {
                throw new Error(data.error ?? "Could not start payment");
            }

            window.location.href = data.authorizationUrl;
        } catch (err: any) {
            setError(err.message);
            setSubmitting(false);
        }
    };

    return (
        <section className="rounded-2xl bg-white p-5 shadow-sm">
            <h2 className="mb-4 text-sm font-bold text-gray-900">Buy This Item</h2>

            <div className="space-y-3">
                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                        Full Name <span className="text-red-500">*</span>
                    </label>
                    <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="e.g. Sarah Johnson"
                        className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm outline-none focus:border-gray-900"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                        WhatsApp / Phone <span className="text-red-500">*</span>
                    </label>
                    <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="e.g. 08012345678"
                        type="tel"
                        className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm outline-none focus:border-gray-900"
                    />
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">
                        Email <span className="text-red-500">*</span>
                    </label>
                    <input
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="e.g. sarah@email.com"
                        type="email"
                        className="h-11 w-full rounded-xl border border-gray-200 px-3.5 text-sm outline-none focus:border-gray-900"
                    />
                    <p className="mt-1 text-xs text-gray-400">Your payment receipt goes here</p>
                </div>
                <div>
                    <label className="mb-1 block text-xs font-medium text-gray-600">Quantity</label>
                    <div className="flex h-11 w-28 items-center rounded-xl border border-gray-200">
                        <button
                            onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                            className="flex h-full w-9 items-center justify-center text-gray-500"
                        >
                            −
                        </button>
                        <span className="flex-1 text-center text-sm font-semibold">{quantity}</span>
                        <button
                            onClick={() => setQuantity((q) => q + 1)}
                            className="flex h-full w-9 items-center justify-center text-gray-500"
                        >
                            +
                        </button>
                    </div>
                </div>
            </div>

            {error && (
                <div className="mt-3 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                    {error}
                </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
                <span className="text-sm text-gray-500">Total</span>
                <span className="text-lg font-bold text-gray-900">
                    {formatCurrency(total, currency)}
                </span>
            </div>

            <button
                onClick={handleCheckout}
                disabled={submitting}
                className="mt-4 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gray-900 text-sm font-semibold text-white disabled:opacity-60"
            >
                {submitting ? (
                    <><Loader2 size={16} className="animate-spin" /> Redirecting to Paystack...</>
                ) : (
                    "Pay Now →"
                )}
            </button>
            <p className="mt-2 text-center text-xs text-gray-400">
                Secure payment powered by Paystack
            </p>
        </section>
    );
}
