"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, ArrowLeft, Check } from "lucide-react";
import { supabase } from "@/lib/supabaseClient";

const PLAN_DETAILS: Record<string, { name: string; price: string; features: string[] }> = {
    starter: {
        name: "Starter Plan",
        price: "₦15,000/month",
        features: [
            "Branded storefront",
            "Up to 20 products",
            "5 AI measurement scans/month",
            "Order management",
            "Basic invoicing",
        ],
    },
    growth: {
        name: "Growth Plan",
        price: "₦35,000/month",
        features: [
            "Everything in Starter",
            "Unlimited products",
            "Unlimited AI measurement scans",
            "Advanced analytics",
            "Custom domain storefront",
            "Priority support",
        ],
    },
    enterprise: {
        name: "Enterprise Plan",
        price: "Custom pricing",
        features: [
            "Everything in Growth",
            "Multiple staff accounts",
            "Multiple store locations",
            "Dedicated account manager",
            "Custom integrations",
            "SLA support",
        ],
    },
};

function AuthForm() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const planParam = searchParams.get("plan") ?? "growth";
    const modeParam = searchParams.get("mode") ?? "signup";

    const [mode, setMode] = useState<"signup" | "login">(
        modeParam === "login" ? "login" : "signup"
    );
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [fullName, setFullName] = useState("");
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [googleLoading, setGoogleLoading] = useState(false);
    const [error, setError] = useState("");

    const plan = PLAN_DETAILS[planParam] ?? PLAN_DETAILS.growth;

    const switchMode = (newMode: "signup" | "login") => {
        setMode(newMode);
        setError("");
        setEmail("");
        setPassword("");
        setFullName("");
    };

    const handleSubmit = async () => {
        setError("");

        if (!email.trim()) { setError("Please enter your email address."); return; }
        if (!password.trim()) { setError("Please enter your password."); return; }
        if (mode === "signup" && !fullName.trim()) {
            setError("Please enter your full name.");
            return;
        }
        if (mode === "signup" && password.length < 8) {
            setError("Password must be at least 8 characters.");
            return;
        }

        setLoading(true);

        if (mode === "signup") {
            const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: fullName,
                        plan: planParam,
                    },
                },
            });

            setLoading(false);

            if (signUpError) {
                setError(signUpError.message);
                return;
            }

            if (signUpData.session) {
                // Fire welcome email
                supabase.functions.invoke("send-welcome-email", {
                    body: { email, full_name: fullName, plan: planParam },
                }).catch(console.error);

                router.push("/designer-dashboard/onboarding");
                return;
            }

            // Confirmation email required
            setError("Check your email to confirm your account, then sign in below.");
            switchMode("login");
            return;
        }

        // LOGIN
        const { error: loginError } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        setLoading(false);

        if (loginError) {
            setError(loginError.message);
            return;
        }

        // Check onboarding
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
            const { data: designer } = await supabase
                .from("designers")
                .select("onboarding_completed")
                .eq("id", user.id)
                .single();

            if (!designer?.onboarding_completed) {
                router.push("/designer-dashboard/onboarding");
            } else {
                router.push("/designer-dashboard");
            }
        }
    };

    const handleGoogle = async () => {
        setError("");
        setGoogleLoading(true);

        const { error } = await supabase.auth.signInWithOAuth({
            provider: "google",
            options: {
                redirectTo: `${window.location.origin}/auth/callback`,
                queryParams: { plan: planParam },
            },
        });

        setGoogleLoading(false);
        if (error) setError(error.message);
    };

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === "Enter") handleSubmit();
    };

    return (
        <main className="min-h-screen bg-white">
            {/* NAV */}
            <nav className="border-b border-gray-100 px-6 py-4">
                <div className="mx-auto flex max-w-6xl items-center justify-between">
                    <Link href="/" className="text-lg font-bold tracking-tight">
                        FitHouse<span className="text-emerald-600">Africa</span>
                    </Link>
                    <Link
                        href="/"
                        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900"
                    >
                        <ArrowLeft size={14} />
                        Back to home
                    </Link>
                </div>
            </nav>

            <div className="mx-auto grid min-h-[calc(100vh-65px)] max-w-6xl md:grid-cols-2">

                {/* LEFT — Form */}
                <div className="flex flex-col justify-center px-6 py-12 md:px-16">

                    {/* MODE TABS */}
                    <div className="mb-8 flex rounded-xl border border-gray-200 bg-gray-50 p-1">
                        <button
                            onClick={() => switchMode("signup")}
                            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${mode === "signup"
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Create Account
                        </button>
                        <button
                            onClick={() => switchMode("login")}
                            className={`flex-1 rounded-lg py-2.5 text-sm font-semibold transition ${mode === "login"
                                    ? "bg-white text-gray-900 shadow-sm"
                                    : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            Sign In
                        </button>
                    </div>

                    {/* HEADER */}
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold tracking-tight text-gray-900">
                            {mode === "signup"
                                ? "Start your free trial"
                                : "Welcome back"}
                        </h1>
                        <p className="mt-1 text-sm text-gray-500">
                            {mode === "signup"
                                ? "14 days free. No credit card required."
                                : "Sign in to your FitHouseAfrica account."}
                        </p>
                    </div>

                    {/* GOOGLE */}
                    <button
                        onClick={handleGoogle}
                        disabled={googleLoading || loading}
                        className="flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white text-sm font-medium text-gray-700 transition hover:bg-gray-50 disabled:opacity-60"
                    >
                        {googleLoading ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-700" />
                        ) : (
                            <svg width="18" height="18" viewBox="0 0 18 18">
                                <path fill="#4285F4" d="M16.51 8H8.98v3h4.3c-.18 1-.74 1.48-1.6 2.04v2.01h2.6a7.8 7.8 0 0 0 2.38-5.88c0-.57-.05-.66-.15-1.18z" />
                                <path fill="#34A853" d="M8.98 17c2.16 0 3.97-.72 5.3-1.94l-2.6-2a4.8 4.8 0 0 1-7.18-2.54H1.83v2.07A8 8 0 0 0 8.98 17z" />
                                <path fill="#FBBC05" d="M4.5 10.52a4.8 4.8 0 0 1 0-3.04V5.41H1.83a8 8 0 0 0 0 7.18z" />
                                <path fill="#EA4335" d="M8.98 4.18c1.17 0 2.23.4 3.06 1.2l2.3-2.3A8 8 0 0 0 1.83 5.4L4.5 7.49a4.77 4.77 0 0 1 4.48-3.3z" />
                            </svg>
                        )}
                        Continue with Google
                    </button>

                    {/* DIVIDER */}
                    <div className="my-5 flex items-center gap-4">
                        <div className="h-px flex-1 bg-gray-100" />
                        <span className="text-xs text-gray-400">or continue with email</span>
                        <div className="h-px flex-1 bg-gray-100" />
                    </div>

                    {/* FORM */}
                    <div className="space-y-4">
                        {mode === "signup" && (
                            <div>
                                <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                    Full Name
                                </label>
                                <input
                                    type="text"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder="e.g. Tife Adeyemi"
                                    className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                                />
                            </div>
                        )}

                        <div>
                            <label className="mb-1.5 block text-sm font-medium text-gray-700">
                                Email Address
                            </label>
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                onKeyDown={handleKeyDown}
                                placeholder="you@example.com"
                                className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                            />
                        </div>

                        <div>
                            <div className="mb-1.5 flex items-center justify-between">
                                <label className="text-sm font-medium text-gray-700">
                                    Password
                                </label>
                                {mode === "login" && (
                                    <button className="text-xs text-emerald-600 hover:text-emerald-700">
                                        Forgot password?
                                    </button>
                                )}
                            </div>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    placeholder={mode === "signup" ? "Min. 8 characters" : "Enter your password"}
                                    className="h-12 w-full rounded-xl border border-gray-200 px-4 pr-12 text-sm outline-none transition focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/10"
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* ERROR */}
                    {error && (
                        <div className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-600">
                            {error}
                        </div>
                    )}

                    {/* SUBMIT */}
                    <button
                        onClick={handleSubmit}
                        disabled={loading || googleLoading}
                        className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:opacity-60"
                    >
                        {loading ? (
                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        ) : mode === "signup" ? (
                            "Create Account & Start Trial"
                        ) : (
                            "Sign In to Dashboard"
                        )}
                    </button>

                    {/* TERMS */}
                    {mode === "signup" && (
                        <p className="mt-4 text-center text-xs text-gray-400">
                            By creating an account you agree to our{" "}
                            <a href="#" className="underline hover:text-gray-600">Terms</a>
                            {" "}and{" "}
                            <a href="#" className="underline hover:text-gray-600">Privacy Policy</a>.
                        </p>
                    )}
                </div>

                {/* RIGHT — Plan panel */}
                <div className="hidden flex-col justify-center bg-gray-900 px-12 py-12 md:flex">
                    {mode === "signup" ? (
                        <>
                            <div className="mb-8 inline-flex w-fit items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-400">
                                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                                14-Day Free Trial
                            </div>

                            <h2 className="mb-2 text-2xl font-bold text-white">
                                {plan.name}
                            </h2>
                            <p className="mb-8 text-sm text-gray-400">
                                {plan.price} after trial
                            </p>

                            <ul className="mb-10 space-y-4">
                                {plan.features.map((feature) => (
                                    <li key={feature} className="flex items-center gap-3 text-sm text-gray-300">
                                        <div className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-emerald-500/20">
                                            <Check size={11} className="text-emerald-400" />
                                        </div>
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <div className="h-px bg-gray-700 mb-8" />

                            <div>
                                <p className="text-sm italic leading-relaxed text-gray-400">
                                    "FitHouseAfrica cut our measurement errors to zero and doubled our monthly order capacity."
                                </p>
                                <div className="mt-4 flex items-center gap-3">
                                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-emerald-600 text-sm font-bold text-white">
                                        T
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-white">Tife Adeyemi</p>
                                        <p className="text-xs text-gray-500">House of Tife · Lagos</p>
                                    </div>
                                </div>
                            </div>
                        </>
                    ) : (
                        <>
                            <h2 className="mb-4 text-3xl font-bold text-white">
                                Welcome back to
                                <br />
                                <span className="text-emerald-400">FitHouseAfrica.</span>
                            </h2>
                            <p className="mb-10 text-sm leading-relaxed text-gray-400">
                                Your designer dashboard, orders, measurements, and storefront are waiting for you.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { label: "Active Designers", value: "1,200+" },
                                    { label: "Orders Processed", value: "18,000+" },
                                    { label: "AI Scans Done", value: "47,000+" },
                                    { label: "Countries Reached", value: "40+" },
                                ].map((stat) => (
                                    <div key={stat.label} className="rounded-xl border border-gray-700 bg-gray-800 p-4">
                                        <div className="text-xl font-bold text-emerald-400">{stat.value}</div>
                                        <div className="mt-1 text-xs text-gray-500">{stat.label}</div>
                                    </div>
                                ))}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}

export default function AuthPage() {
    return (
        <Suspense fallback={
            <main className="flex min-h-screen items-center justify-center bg-white">
                <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-200 border-t-emerald-600" />
            </main>
        }>
            <AuthForm />
        </Suspense>
    );
}