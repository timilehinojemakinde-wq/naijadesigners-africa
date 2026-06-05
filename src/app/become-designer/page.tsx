import Image from "next/image";
import Link from "next/link";
import { Menu, Search, ArrowRight } from "lucide-react";

export default function BecomeDesigner() {
    const benefits = [
        {
            title: "Global Reach",
            desc: "Get discovered by clients worldwide.",
            icon: "🌍",
        },
        {
            title: "AI Measurement",
            desc: "No physical fitting required.",
            icon: "📏",
        },
        {
            title: "Storefront",
            desc: "Own your fashion website.",
            icon: "🏪",
        },
        {
            title: "Business Tools",
            desc: "Invoices, customers & orders.",
            icon: "💼",
        },
    ];

    return (
        <main className="min-h-screen bg-[#fafafa] text-black">
            {/* NAVBAR */}
            <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
                <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
                    <Link href="/">
                        <h1 className="text-xl font-bold cursor-pointer">
                            FitHouse
                            <span className="text-red-600">Africa</span>
                        </h1>
                    </Link>

                    {/* Desktop Links */}
                    <div className="hidden items-center gap-6 md:flex">
                        <button className="hover:text-red-600">
                            Explore
                        </button>

                        <button className="hover:text-red-600">
                            Designers
                        </button>

                        <button className="hover:text-red-600">
                            Pricing
                        </button>
                    </div>

                    {/* Right Side */}
                    <div className="flex items-center gap-3">
                        <button className="border-0 bg-transparent p-1">
                            <Search size={18} />
                        </button>

                        <button className="rounded-md border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-600">
                            Become Designer
                        </button>

                        <button className="rounded-md border border-gray-300 p-2 hover:bg-gray-100 md:hidden">
                            <Menu size={16} />
                        </button>
                    </div>
                </div>
            </nav>

            {/* HERO */}
            <section className="relative overflow-hidden px-5 pb-10 pt-8">
                <div className="mx-auto mw-full max-w-[1200px] px-6">
                    <div className="relative rounded-[12px] bg-white p-6 shadow-sm md:p-10">

                        {/* Hero Content */}
                        <div className="relative z-10 flex min-h-[380px] flex-col justify-between">

                            {/* Text */}
                            <div className="max-w-[70%]">


                                <h1 className="mt-5 text-[36px] font-semibold leading-[1.05] tracking-tight md:text-[50px]">
                                    Sell Fashion
                                    <br />
                                    <span className="text-red-700">
                                        Globally.
                                    </span>
                                </h1>

                                <p className="mt-5 max-w-sm text-base leading-8 text-gray-600 md:text-lg">
                                    Reach customers across Africa and worldwide.
                                    Manage measurements, invoices, storefronts,
                                    and orders — all in one place.
                                </p>
                            </div>
                        </div>

                        {/* Right Hero Image */}
                        <div className="absolute bottom-0 right-0 h-full w-[58%]">
                            <Image
                                src="/designer-cta.png"
                                alt="Designer"
                                fill
                                priority
                                className="object-contain object-bottom"
                            />
                        </div>
                    </div>
                </div>
            </section>

            {/* BENEFITS */}
            <section className="px-5 pb-20">
                <div className="mx-auto w-full max-w-[1200px] px-6">

                    <h2 className="mb-6 text-2xl font-bold">
                        Why Join FitHouse Africa?
                    </h2>

                    {/* 2 by 2 Grid */}
                    <div className="grid grid-cols-2 gap-4">

                        {benefits.map((item) => (
                            <div
                                key={item.title}
                                className="aspect-square rounded-[12px] border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md"
                            >
                                <div className="text-3xl">
                                    {item.icon}
                                </div>

                                <h3 className="mt-5 text-lg font-semibold">
                                    {item.title}
                                </h3>

                                <p className="mt-2 text-sm leading-6 text-gray-500">
                                    {item.desc}
                                </p>
                            </div>
                        ))}
                    </div>

                    {/* Bottom CTA */}
                    <Link
                        href="/become-designer/eligibility"
                        className="flex h-14 items-center justify-center rounded-xl bg-red-600 text-white"
                    >
                        Apply as a Designer
                    </Link>


                </div>
            </section>
        </main>
    );
}
