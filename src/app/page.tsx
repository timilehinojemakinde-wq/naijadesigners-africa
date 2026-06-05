import Link from "next/link";
import {
  BridalsIcon,
  AsoEbiIcon,
  LuxuryIcon,
  NativeWearIcon,
  CorporateIcon,
  CasualIcon,
  VerifiedIcon,
  PaymentIcon,
  DeliveryIcon,
} from "@/components/icons";

import { Search, Menu } from "lucide-react";

export default function Home() {
  const categories = [
    { name: "Bridals", icon: BridalsIcon, image: "/occasion-wedding.png" },
    { name: "Aso Ebi", icon: AsoEbiIcon, image: "/occasion-asoebi.png" },
    { name: "Luxury", icon: LuxuryIcon, image: "/occasion-luxury.png" },
    { name: "Native Wear", icon: NativeWearIcon, image: "/occasion-native.png" },
    { name: "Corporate", icon: CorporateIcon, image: "/occasion-corporate.jpg" },
    { name: "Casual", icon: CasualIcon, image: "/occasion-casual.jpg" },
  ];

  const featuredDesigns = [
    {
      id: 1,
      name: "Luxury Bridal Dress",
      price: "₦180,000",
      store: "House of Tife",
      category: "Bridals",
      image: "/design-1.png",
    },
    {
      id: 2,
      name: "Royal Aso Ebi",
      price: "₦95,000",
      store: "Veekee Atelier",
      category: "Aso Ebi",
      image: "/design-2.png",
    },
    {
      id: 3,
      name: "Luxury Senator",
      price: "₦120,000",
      store: "Style Temple",
      category: "Native Wear",
      image: "/design-3.png",
    },
    {
      id: 4,
      name: "Elegant Corporate Set",
      price: "₦75,000",
      store: "House of Style",
      category: "Corporate",
      image: "/design-4.png",
    },
  ];


  return (
    <main className="min-h-screen bg-white text-black">

      {/* NAVBAR */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">

          <h1 className="text-xl font-bold">
            FitHouse<span className="text-red-600">Africa</span>
          </h1>

          {/* Desktop links */}
          <div className="hidden items-center gap-6 md:flex">
            <button className="hover:text-red-600">Explore</button>
            <button className="hover:text-red-600">Designers</button>
            <button className="hover:text-red-600">Pricing</button>
          </div>

          {/* Right side */}
          <div className="flex items-center gap-3">
            <button className="border-0 bg-transparent p-1">
              <Search size={14} />
            </button>

            <button className="rounded-md border border-gray-300 p-2 hover:bg-gray-100 md:hidden">
              <Menu size={14} />
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="bg-[#fafafa] px-6 py-16 lg:py-24">
        <div className="mx-auto max-w-[1200px]">

          <div className="grid items-center gap-16 lg:grid-cols-2">
            {/* LEFT SIDE */}
          </div>
        </div>
        {/* Headline */}
        <h1 className="text-4xl md:text-5xl lg:text-6xl leading-[1.05]">
          Global marketplace
          <br />
          <span className="text-red-700">
            for African Fashion
          </span>
          <br />
          From Top Designers
          <br />
          Across Africa.

          <p className="mt-6 max-w-[560px] text-sm text-gray-600 leading-relaxed">
            With AI-powered body measurement that lets you order perfectly fitted outfits without visiting a tailor. Shop from verified designers across Africa and get your outfits delivered anywhere in the world.
          </p>

        </h1>
        {/* CTA Buttons */}
        <div className="mt-8 flex flex-col gap-4">
          <button className="flex h-14 items-center justify-center rounded-xl bg-red-600 text-base font-medium text-white shadow-md transition hover:bg-red-700">
            Find Designers →
          </button>

          <Link
            href="/become-designer"
            className="flex h-14 items-center justify-center rounded-xl bg-white text-black font-medium shadow-md border border-gray-300 hover:bg-gray-100 transistion-colors"
          >
            Become a Designer →
          </Link>

        </div>

        {/* Description */}

        <div className="mt-6 overflow-hidden">
          <div className="hero-ticker">
            <span>✓ AI Measurement</span>
            <span>✓ Verified Designers</span>
            <span>✓ Worldwide Delivery</span>
            <span>✓ Secure Payments</span>

            <span>✓ AI Measurement</span>
            <span>✓ Verified Designers</span>
            <span>✓ Worldwide Delivery</span>
            <span>✓ Secure Payments</span>
          </div>
        </div>

        {/* HERO IMAGE AREA */}
        <div>

          {/* Hero Image */}
          <div>
            <div className="relative">
              <img
                src="/hero.png"
                alt="Fashion models"
                className="w-full object-contain"
              />

            </div>
          </div>
        </div>
      </section>

      {/* FEATURED DESIGNER HOUSES */}
      <section className="overflow-hidden py-14 bg-[#fafafa] border-y border-gray-100">

        <div className="mb-10 text-center px-6">
          <p className="mb-2 text-sm font-medium uppercase tracking-[0.18em] text-red-600">
            Trusted By
          </p>

          <h2 className="text-2xl font-semibold text-black">
            Africa's Emerging Fashion Houses
          </h2>

          <p className="mx-auto mt-3 max-w-md text-sm text-gray-500">
            Premium designers shaping the future of African fashion.
          </p>
        </div>

        {/* Row 1 */}
        <div className="marquee mb-5">
          <div className="marquee-content">
            {[
              "VEEKEE",
              "MODE & CEDAR",
              "ATELIER RED",
              "STYLE TEMPLE",
              "MODE & CEDAR",
              "LUXE NATIVE",
              "AÏDA",
              "ELAN NOIR",
            ].map((brand) => (
              <div
                key={brand}
                className="mx-5 shrink-0 text-[20px] font-semibold tracking-[0.14em] text-black/80"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>

        {/* Row 2 */}
        <div className="marquee marquee-reverse">
          <div className="marquee-content">
            {[
              "MAI ATAFO",
              "VEEKEE JAMES",
              "HOUSE OF LUXE",
              "MODE & CEDAR",
              "TEMPLE WEAR",
              "ORÍ",
              "ATELIER NOIR",
              "MODE & CEDAR",
            ].map((brand) => (
              <div
                key={brand}
                className="mx-5 shrink-0 text-[20px] font-semibold tracking-[0.14em] text-black/80"
              >
                {brand}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SHOP BY OCCASION */}
      <section className="px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-semibold">Shop by Occasion</h2>
            <button className="text-red-600">View all →</button>
          </div>

          {/* GRID (mobile 2 rows, desktop single row scroll feel) */}
          <div className="grid grid-cols-3 gap-3 auto-rows-fr">
            {categories.map((category) => {
              const Icon = category.icon;

              return (
                <div
                  key={category.name}
                  className="relative h-36 md:h-50 rounded-[6px] overflow-hidden"
                >
                  <img
                    src={category.image}
                    alt={category.name}
                    className="h-full w-full object-cover"
                  />

                  {/* overlay */}
                  <div className="absolute inset-0 bg-black/35" />

                  {/* icon */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="rounded-full bg-white/90 p-3 backdrop-blur-sm">
                      <Icon className="h-7 w-7 text-red-600" />
                    </div>
                  </div>

                  {/* text */}
                  <div className="absolute bottom-3 left-1/2 -translate-x-1/2">
                    <h3 className="text-sm font-semibold text-white">
                      {category.name}
                    </h3>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>



      {/* FEATURED DESIGNS */}
      <section className="px-6 py-14">
        <div className="mx-auto max-w-6xl">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-semibold">
                Featured Designs
              </h2>
              <p className="mt-6 max-w-[560px] text-gray-600">
                Discover handcrafted premium fashion.
              </p>
            </div>

            <button className="text-red-600 text-sm font-medium">
              View all →
            </button>
          </div>

          {/* Horizontal ecommerce carousel */}
          <div className="flex gap-3 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide">

            {featuredDesigns.map((design) => (
              <div
                key={design.id}
                className="min-w-[45%] lg:min-w-[280px] snap-start cursor-pointer"
              >
                {/* Card */}
                <div className="overflow-hidden rounded-[6px] border border-gray-100 bg-white">

                  {/* Image */}
                  <div className="relative">
                    <img
                      src={design.image}
                      alt={design.name}
                      className="h-60 w-full object-cover"
                    />
                  </div>

                  {/* Content */}
                  <div className="space-y-1 p-3">

                    <p className="text-sm font-semibold text-black">
                      {design.price}
                    </p>

                    <p className="truncate text-sm font-medium text-gray-900">
                      {design.store}
                    </p>

                    <p className="text-xs text-gray-500">
                      {design.category}
                    </p>

                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>





      {/* HOW IT WORKS */}
      <section className="bg-red-50 px-6 py-16">
        <div className="mx-auto max-w-6xl text-center">

          <h2 className="text-3xl font-bold">
            How It Works
          </h2>

          <div className="mt-10 grid gap-6 md:grid-cols-4">
            {[
              "Discover",
              "Choose Outfit",
              "AI Body Scan",
              "Get Delivered",
            ].map((step) => (
              <div
                key={step}
                className="rounded-[28px] bg-white p-6"
              >
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-600 text-white">
                  ✓
                </div>
                <h3 className="font-semibold">{step}</h3>
              </div>
            ))}
          </div>

        </div>
      </section>

      {/* DESIGNER CTA */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl overflow-hidden rounded-[6px] bg-[#f8f8f8]">

          <div className="relative min-h-[160px] overflow-hidden rounded-[28px]">

            {/* Background image */}
            <img
              src="/designer-cta.png"
              alt="Become a designer"
              className="absolute inset-0 h-full w-full object-cover"
            />


            {/* Overlay gradient for text readability */}
            <div className="absolute inset-0 bg-gradient-to-r from-red-700/55 via-red-600/20 to-transparent" />

            {/* Content */}
            <div className="relative z-10 flex min-h-[360px] flex-col justify-center px-8 py-10 md:max-w-[50%]">

              <p className="mb-4 text-sm font-semibold uppercase tracking-[0.18em] text-white/90">
                ARE YOU A DESIGNER?
              </p>

              <h2
                className="text-[42px] leading-[1.05] text-white md:text-[56px]"
                style={{
                  fontFamily: "var(--font-playfair)",
                }}
              >
                Grow your brand.
                <br />
                Reach more customers.
              </h2>

              <p className="mt-5 max-w-sm text-sm leading-7 text-white/85">
                Open your fashion storefront, receive orders globally,
                and grow your business with AI-powered measurement.
              </p>

              {/* CTA button */}
              <div className="mt-8">
                <button className="rounded-2xl bg-white px-8 py-4 text-base font-semibold text-red-600 transition hover:scale-[1.02]">
                  Open Your Store →
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>


      {/* WHAT OUR CUSTOMERS SAY */}
      <section className="bg-[#fafafa] px-6 py-16">

        <div className="mx-auto max-w-6xl">

          {/* Heading */}
          <div className="mb-8 text-center">
            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-red-600">
              WHAT OUR CUSTOMERS SAY
            </p>

            <h2 className="text-3xl font-semibold text-black">
              Loved by fashion lovers
            </h2>

            <p className="mx-auto mt-3 max-w-md text-sm leading-7 text-gray-500">
              Thousands trust FitHouseAfrica for premium African fashion,
              custom-made outfits, and seamless delivery.
            </p>
          </div>

          {/* Reviews */}
          <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory">

            {[
              {
                name: "Chioma A.",
                location: "Lagos, Nigeria",
                image: "/review-1.jpg",
                review:
                  "FitHouse made my dream outfit a reality. The quality, service and attention to detail were amazing.",
              },
              {
                name: "David K.",
                location: "Abuja, Nigeria",
                image: "/review-2.jpg",
                review:
                  "The AI measurement surprised me. My outfit fit perfectly without a physical fitting.",
              },
              {
                name: "Amaka O.",
                location: "London, UK",
                image: "/review-3.jpg",
                review:
                  "I ordered from abroad and everything arrived beautifully made. This is the future of African fashion.",
              },
            ].map((review, index) => (
              <div
                key={index}
                className="min-w-[90%] snap-start rounded-[28px] border border-gray-100 bg-white p-6 shadow-sm md:min-w-[360px]"
              >

                {/* Stars */}
                <div className="mb-5 flex gap-1 text-red-500">
                  ★★★★★
                </div>

                {/* Review text */}
                <p className="text-[15px] leading-8 text-gray-700">
                  "{review.review}"
                </p>

                {/* User */}
                <div className="mt-6 flex items-center gap-4">

                  <img
                    src={review.image}
                    alt={review.name}
                    className="h-12 w-12 rounded-full object-cover"
                  />

                  <div>
                    <h4 className="font-semibold text-black">
                      {review.name}
                    </h4>

                    <p className="text-sm text-gray-500">
                      {review.location}
                    </p>
                  </div>

                </div>
              </div>
            ))}

          </div>
        </div>
      </section>
      {/* FOLLOW US + FOOTER */}
      <footer className="border-t border-gray-100 bg-white px-6 pt-16 pb-10">

        <div className="mx-auto w-full max-w-[1200px] px-6">

          {/* FOLLOW US */}
          <div className="mb-14 rounded-[28px] bg-[#fafafa] p-8">

            <p className="mb-2 text-sm font-semibold uppercase tracking-[0.18em] text-red-600">
              FOLLOW US
            </p>

            <h2 className="text-3xl font-semibold text-black">
              Stay inspired
            </h2>

            <p className="mt-3 max-w-md text-sm leading-7 text-gray-500">
              Follow FitHouseAfrica for fashion inspiration,
              premium collections, designer stories and updates.
            </p>

            {/* Social Icons */}
            <div className="mt-8 flex flex-wrap gap-4">

              {[
                "Instagram",
                "Facebook",
                "TikTok",
                "X",
                "YouTube",
              ].map((social) => (
                <button
                  key={social}
                  className="rounded-full border border-gray-200 bg-white px-5 py-3 text-sm font-medium text-gray-700 transition hover:border-red-300 hover:text-red-600"
                >
                  {social}
                </button>
              ))}

            </div>
          </div>

          {/* FOOTER */}
          <div className="grid gap-10 border-t border-gray-100 pt-14 md:grid-cols-4">

            {/* Brand */}
            <div>
              <h2 className="text-2xl font-bold text-black">
                FitHouse
                <span className="text-red-600">
                  Africa
                </span>
              </h2>

              <p className="mt-4 text-sm leading-7 text-gray-500">
                Africa’s home of fashion. Connecting people
                to premium designers and custom-made outfits
                powered by AI measurement.
              </p>
            </div>

            {/* Explore */}
            <div>
              <h3 className="mb-5 font-semibold text-black">
                Explore
              </h3>

              <div className="space-y-3 text-sm text-gray-500">
                <p>Explore Designers</p>
                <p>Categories</p>
                <p>How It Works</p>
                <p>About Us</p>
                <p>Blog</p>
              </div>
            </div>

            {/* Designers */}
            <div>
              <h3 className="mb-5 font-semibold text-black">
                For Designers
              </h3>

              <div className="space-y-3 text-sm text-gray-500">
                <p>Open Your Store</p>
                <p>Designer Resources</p>
                <p>Pricing & Plans</p>
                <p>Success Stories</p>
              </div>
            </div>

            {/* Support */}
            <div>
              <h3 className="mb-5 font-semibold text-black">
                Support
              </h3>

              <div className="space-y-3 text-sm text-gray-500">
                <p>Help Center</p>
                <p>Shipping & Delivery</p>
                <p>Returns & Refunds</p>
                <p>Contact Us</p>
              </div>
            </div>

          </div>

          {/* Bottom Footer */}
          <div className="mt-6 max-w-[560px] text-gray-600">
            © 2026 FitHouseAfrica. All rights reserved.
          </div>

        </div>
      </footer>
    </main>
  );
}