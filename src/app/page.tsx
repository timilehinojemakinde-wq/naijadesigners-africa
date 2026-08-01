"use client";

import { useReveal } from "@/hooks/useReveal";
import Link from "next/link";
import { Check, ArrowRight, ShoppingBag, FileText, Ruler, Zap } from "lucide-react";

function RevealImage({ src, alt, maxWidth = "max-w-5xl" }: { src: string; alt: string; maxWidth?: string }) {
    const { ref, visible } = useReveal<HTMLDivElement>();
    return (
        <div ref={ref} className={`mx-auto ${maxWidth} reveal ${visible ? "revealed" : ""}`}>
            <img src={src} alt={alt} className="w-full rounded-2xl" />
        </div>
    );
}

export default function LandingPage() {
    const { ref: heroTextRef, visible: heroTextVisible } = useReveal<HTMLDivElement>();

    const faqs = [
        { q: "How accurate is the AI body scan?", a: "Our AI uses advanced spatial scanning accurate to within 1.5cm, requiring only a tight-fitting outfit and two quick photos from 3 meters away." },
        { q: "Do my customers need to download an app?", a: "No. The AI scan happens right inside your storefront in the web browser. Customers just snap two photos — front and side — and measurements populate instantly." },
        { q: "Which payment methods are supported?", a: "We integrate with Paystack and Flutterwave for NGN payments, and support international card payments for diaspora customers paying in USD or GBP." },
        { q: "Can I use this if I already have existing clients?", a: "Absolutely. FitHouseAfrica is built first as a tool for managing your existing business — clients, orders, invoices. The marketplace exposure is an additional benefit." },
        { q: "What happens after my 14-day free trial?", a: "You choose a plan that fits your business. No automatic charges — we'll remind you before the trial ends and you decide whether to continue." },
    ];

    const plans = [
        { name: "Starter", price: "₦5,000", usd: "$4.50", period: "/month", description: "For upcoming tailors getting started", features: ["Branded storefront", "Up to 20 products", "Order management", "Basic invoicing", "5 AI measurement scans/month", "Email support"], cta: "Start Free Trial", featured: false },
        { name: "Growth", price: "₦10,000", usd: "$9.99", period: "/month", description: "For established fashion houses scaling up", features: ["Everything in Starter", "Unlimited products", "Unlimited AI measurement scans", "Advanced analytics", "Custom domain storefront", "Priority support", "Paystack & Flutterwave integration"], cta: "Start Free Trial", featured: true },
        { name: "Enterprise", price: "Custom", usd: "", period: "", description: "For large fashion brands with multiple teams", features: ["Everything in Growth", "Multiple staff accounts", "Multiple store locations", "Dedicated account manager", "Custom integrations", "SLA support"], cta: "Contact Sales", featured: false },
    ];

    return (
        <main className="min-h-screen bg-white text-gray-900 antialiased selection:bg-emerald-500 selection:text-white">
            {/* ── STICKY NAV ── */}
            <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
                <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
                    <h1 className="text-xl font-bold tracking-tight">
                        FitHouse<span className="text-emerald-600">Africa</span>
                    </h1>
                    <div className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
                        <a href="#how-it-works" className="transition hover:text-gray-900">How It Works</a>
                        <a href="#dashboard" className="transition hover:text-gray-900">Dashboard</a>
                        <a href="#pricing" className="transition hover:text-gray-900">Pricing</a>
                        <a href="#faq" className="transition hover:text-gray-900">FAQ</a>
                    </div>
                    <div className="flex items-center gap-3">
                        <Link href="/auth?plan=growth" className="hidden text-sm font-medium text-gray-600 hover:text-gray-900 md:block">Log in</Link>
                        <Link href="/auth?plan=growth" className="rounded-full bg-black px-5 py-2 text-sm font-semibold text-white transition hover:bg-gray-800">Start Free Trial</Link>
                    </div>
                </div>
            </nav>

            {/* ── 1. HERO — WHAT IS THIS? ── */}
            <section className="px-6 pt-20 pb-16 text-center md:pt-28">
                <div ref={heroTextRef} className={`mx-auto max-w-4xl reveal ${heroTextVisible ? "revealed" : ""}`}>
                    <div className="mb-8 inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50/80 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-700">
                        <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-600" />
                        Early Access · Powering African Bespoke Fashion
                    </div>
                    <h1 className="text-5xl font-extrabold tracking-tight text-gray-900 sm:text-6xl md:text-7xl">
                        Measure Any Client.
                        <br />
                        <span className="bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">Anywhere in the World.</span>
                    </h1>
                    <p className="mx-auto mt-8 max-w-2xl text-lg font-normal leading-relaxed text-gray-500 md:text-xl">
                        A single link lets your clients capture 14 precise body measurements instantly using AI photo scanning. No app download. No fitting errors.
                    </p>
                    <div className="mt-10 flex flex-col items-center justify-center gap-4 sm:flex-row">
                        <Link href="/auth?plan=starter" className="flex w-full items-center justify-center gap-2 rounded-full bg-black px-8 py-4 text-base font-semibold text-white transition hover:bg-gray-800 sm:w-auto">
                            Start 14-Day Free Trial
                            <ArrowRight size={18} />
                        </Link>
                        <a href="#how-it-works" className="flex w-full items-center justify-center gap-2 rounded-full border border-gray-200 bg-white px-8 py-4 text-base font-semibold text-gray-700 transition hover:bg-gray-50 sm:w-auto">
                            See How It Works
                        </a>
                    </div>
                    <p className="mt-6 text-xs text-gray-400">No credit card required · Setup in 5 minutes · Cancel anytime</p>
                </div>
            </section>

            <section className="px-6 pb-24 md:pb-32">
                <RevealImage src="/images/hero-scan.png" alt="Client taking an AI body scan with FitHouseAfrica" maxWidth="max-w-3xl" />
            </section>

            {/* ── 2. THE PROBLEM — WHY DO I NEED IT? ── */}
            <section className="border-t border-gray-100 bg-gray-50 px-6 py-20 md:py-28">
                <RevealImage src="/images/old-vs-new.png" alt="The old way of tape measuring versus the new AI scan way" />
            </section>

            {/* ── 3. TECHNOLOGY — HOW DOES IT WORK? ── */}
            <section id="how-it-works" className="px-6 py-20 md:py-28">
                <RevealImage src="/images/how-it-works.png" alt="Three step AI scan process: front scan, side scan, measurements generated" />
            </section>

            {/* ── 4. DASHBOARD — WHAT HAPPENS AFTER THE SCAN? ── */}
            <section id="dashboard" className="border-t border-gray-100 bg-gray-50 px-6 py-20 md:py-28">
                <RevealImage src="/images/dashboard-hero.png" alt="FitHouseAfrica designer dashboard on laptop and phone" />
                <div className="mt-12 flex flex-wrap justify-center gap-8 text-center text-sm font-medium text-gray-500">
                    <span className="flex items-center gap-2"><ShoppingBag size={18} className="text-emerald-600" /> Custom Storefront</span>
                    <span className="flex items-center gap-2"><Ruler size={18} className="text-emerald-600" /> AI Measurement Engine</span>
                    <span className="flex items-center gap-2"><FileText size={18} className="text-emerald-600" /> Digital Invoicing</span>
                    <span className="flex items-center gap-2"><Zap size={18} className="text-emerald-600" /> Automated Order Tracking</span>
                </div>
            </section>

            {/* ── 5. WORKFLOW — HOW DOES MY BUSINESS CHANGE? ── */}
            <section id="journey" className="px-6 py-20 md:py-28">
                <RevealImage src="/images/journey-timeline.png" alt="From scan to stitch: the full client journey timeline" maxWidth="max-w-2xl" />
            </section>

            {/* ── 6. GLOBAL — WHAT OPPORTUNITIES DOES IT UNLOCK? ── */}
            <section className="border-t border-gray-100 bg-gray-50 px-6 py-20 md:py-28">
                <RevealImage src="/images/global-reach.png" alt="Map showing FitHouseAfrica connecting designers to clients worldwide" />
            </section>

            {/* ── 7. TESTIMONIALS — CAN I TRUST IT? ── */}
            <section className="px-6 py-20 md:py-28">
                <RevealImage src="/images/testimonials.png" alt="Designer testimonials for FitHouseAfrica" />
            </section>

            {/* ── PRICING ── */}
            <section id="pricing" className="bg-gray-50 py-24 md:py-32">
                <div className="mx-auto max-w-6xl px-6">
                    <div className="text-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Transparent Pricing</span>
                        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900 md:text-5xl">Simple Plans. No Surprises.</h2>
                        <p className="mx-auto mt-4 max-w-xl text-gray-500">Start with a 14-day free trial. No credit card required. Cancel anytime.</p>
                    </div>

                    <div className="no-scrollbar mt-16 flex snap-x snap-mandatory gap-6 overflow-x-auto pb-4 md:grid md:gap-8 md:overflow-visible md:grid-cols-3">
                        {plans.map((plan) => (
                            <div
                                key={plan.name}
                                className={`relative flex w-[85%] flex-shrink-0 snap-center flex-col rounded-3xl p-8 md:w-auto md:flex-shrink ${plan.featured ? "border-2 border-emerald-600 bg-gray-900 text-white shadow-xl" : "border border-gray-200 bg-white text-gray-900"}`}
                            >
                                {plan.featured && (
                                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-emerald-600 px-4 py-1 text-xs font-bold uppercase tracking-wider text-white">⭐ Most Popular</div>
                                )}
                                <div className="mb-6">
                                    <h3 className={`text-xs font-bold uppercase tracking-widest ${plan.featured ? "text-emerald-400" : "text-gray-500"}`}>{plan.name}</h3>
                                    <div className="mt-3 flex items-end gap-2">
                                        <span className="text-4xl font-extrabold">{plan.price}</span>
                                        {plan.usd && <span className="mb-1 text-sm text-gray-400">· {plan.usd}</span>}
                                        {plan.period && <span className="mb-1 text-sm text-gray-400">{plan.period}</span>}
                                    </div>
                                    <p className={`mt-2 text-xs ${plan.featured ? "text-gray-400" : "text-gray-500"}`}>{plan.description}</p>
                                </div>
                                <div className="mb-6 h-px bg-gray-200/20" />
                                <ul className="mb-8 flex-1 space-y-3 text-sm">
                                    {plan.features.map((f) => (
                                        <li key={f} className="flex items-center gap-3">
                                            <Check size={16} className="text-emerald-500 flex-shrink-0" />
                                            <span>{f}</span>
                                        </li>
                                    ))}
                                </ul>
                                <Link
                                    href={plan.name === "Starter" ? "/auth?plan=starter" : plan.name === "Growth" ? "/auth?plan=growth" : "mailto:timilehinojemakinde@gmail.com?subject=FitHouseAfrica%20Enterprise%20Plan%20Enquiry&body=Hi%2C%20I%20am%20interested%20in%20the%20FitHouseAfrica%20Enterprise%20plan.%20Here%20are%20my%20details%3A%0A%0ABrand%20Name%3A%20%0ANumber%20of%20designers%3A%20%0AMonthly%20order%20volume%3A%20%0A%0ALooking%20forward%20to%20hearing%20from%20you."}
                                    className={`flex items-center justify-center rounded-full py-3.5 text-sm font-bold transition ${plan.featured ? "bg-emerald-600 text-white hover:bg-emerald-500" : "border border-gray-200 bg-white text-gray-900 hover:bg-gray-50"}`}
                                >
                                    {plan.cta}
                                </Link>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── FAQ ── */}
            <section id="faq" className="py-24 md:py-32">
                <div className="mx-auto max-w-3xl px-6">
                    <div className="text-center">
                        <span className="text-xs font-bold uppercase tracking-widest text-emerald-600">Questions & Answers</span>
                        <h2 className="mt-3 text-3xl font-extrabold tracking-tight text-gray-900">Frequently Asked Questions</h2>
                    </div>
                    <div className="mt-12 space-y-4">
                        {faqs.map((faq, i) => (
                            <details key={i} className="group rounded-2xl border border-gray-200 bg-white p-6">
                                <summary className="flex cursor-pointer items-center justify-between font-semibold text-gray-900 marker:content-none">
                                    {faq.q}
                                    <span className="ml-4 flex-shrink-0 text-gray-400 transition group-open:rotate-45">+</span>
                                </summary>
                                <p className="mt-4 text-sm leading-relaxed text-gray-500">{faq.a}</p>
                            </details>
                        ))}
                    </div>
                </div>
            </section>

            {/* ── 8. FINAL CTA — LET'S BEGIN ── */}
            <section className="bg-black py-24 text-center text-white md:py-32">
                <div className="mx-auto max-w-4xl px-6">
                    <h2 className="text-4xl font-extrabold tracking-tight md:text-6xl">The Future of Fashion Measurement Has Arrived.</h2>
                    <p className="mx-auto mt-6 max-w-xl text-lg text-gray-400">Join forward-thinking African designers scaling their custom fashion businesses with automated body scanning.</p>
                    <div className="mt-10 flex justify-center">
                        <Link href="/auth?plan=growth" className="flex items-center gap-2 rounded-full bg-emerald-600 px-8 py-4 text-base font-semibold text-white transition hover:bg-emerald-500">
                            Start Free Trial
                            <ArrowRight size={18} />
                        </Link>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className="border-t border-gray-100 bg-white px-6 py-12">
                <div className="mx-auto max-w-6xl flex flex-col items-center justify-between gap-6 text-sm text-gray-400 md:flex-row">
                    <p>© 2026 FitHouseAfrica. All rights reserved.</p>
                    <div className="flex gap-6">
                        <a href="#" className="hover:text-gray-600">Privacy Policy</a>
                        <a href="#" className="hover:text-gray-600">Terms of Service</a>
                        <a href="#" className="hover:text-gray-600">Built for Africa</a>
                    </div>
                </div>
            </footer>
        </main>
    );
}