import { Search, Menu } from "lucide-react";

export default function Home() {
  const categories = [
    {
      name: "Aso Ebi",
      image: "/occasion-asoebi.jpg",
    },
    {
      name: "Wedding",
      image: "/occasion-wedding.jpg",
    },
    {
      name: "Native Wear",
      image: "/occasion-native.jpg",
    },
    {
      name: "Corporate",
      image: "/occasion-corporate.jpg",
    },
    {
      name: "Luxury",
      image: "/occasion-luxury.jpg",
    },
    {
      name: "Casual",
      image: "/occasion-casual.jpg",
    },
  ];
  const designers = [
    {
      name: "House of Tife",
      specialty: "Luxury Bridal",
    },
    {
      name: "Veekee Atelier",
      specialty: "Couture Fashion",
    },
    {
      name: "Style by Naija",
      specialty: "Native Fashion",
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
      <section className="bg-[#fafafa] px-5 pt-6 pb-0 overflow-hidden">
        <div className="mx-auto max-w-md">

          {/* Headline */}
          <h1 className="text-[52px] font-semibold leading-[0.95] tracking-tight text-black">
            Global Marketplace
            <br />
            <span className="text-red-600">
              For Africa's Finest
              <br />
              Designers.
            </span>
          </h1>
          {/* CTA Buttons */}
          <div className="mt-8 flex flex-col gap-4">
            <button className="flex h-14 items-center justify-center rounded-xl bg-red-600 text-base font-medium text-white shadow-md transition hover:bg-red-700">
              Become a Designer →
            </button>

            <button className="flex h-14 items-center justify-center rounded-xl border border-red-200 bg-white text-base font-medium text-red-700 transition hover:bg-red-50">
              Find Designers
            </button>
          </div>

          {/* Description */}
          <p className="mt-6 max-w-sm text-lg leading-9 text-gray-600">
            With AI-powered measurement - no physical measurement required.
            <br /> Shop custom-made outfits from top designers accross Africa from anywhere you are in the world.
          </p>

          {/* HERO IMAGE AREA */}
          <div className="relative mt-14">

            {/* Hero Image */}
            <img
              src="/hero.png"
              alt="Fashion models"
              className="w-full object-contain"
            />

            {/* Floating Trust Card */}
            <div className="absolute bottom-10 left-1/2 z-20 w-[92%] -translate-x-1/2 rounded-[28px] bg-white p-5 shadow-2xl backdrop-blur-sm">

              <div className="grid grid-cols-3 gap-3 text-center">

                <div className="flex flex-col items-center">
                  <div className="mb-2 text-red-600 text-2xl">
                    🛡️
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    Verified
                  </p>
                  <p className="text-sm text-gray-500">
                    Designers
                  </p>
                </div>

                <div className="flex flex-col items-center border-x border-gray-100">
                  <div className="mb-2 text-red-600 text-2xl">
                    🔒
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    Secure
                  </p>
                  <p className="text-sm text-gray-500">
                    Payments
                  </p>
                </div>

                <div className="flex flex-col items-center">
                  <div className="mb-2 text-red-600 text-2xl">
                    🚚
                  </div>
                  <p className="text-sm font-medium text-gray-800">
                    Fast
                  </p>
                  <p className="text-sm text-gray-500">
                    Delivery
                  </p>
                </div>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* SHOP BY OCCASION */}
      <section className="px-6 py-10">
        <div className="mx-auto max-w-6xl">

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Shop by Occasion
            </h2>

            <button className="text-red-600">
              View all →
            </button>
          </div>

          {/* Carousel */}
          <div className="flex gap-3 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4">

            {categories.map((category) => (
              <div
                key={category.name}
                className="relative min-w-[31%] md:min-w-[18%] snap-start overflow-hidden rounded-[24px]"
              >

                {/* Image */}
                <img
                  src={category.image}
                  alt={category.name}
                  className="h-40 w-full object-cover"
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-black/30" />

                {/* Text */}
                <div className="absolute bottom-3 left-3">
                  <h3 className="text-sm font-semibold text-white">
                    {category.name}
                  </h3>
                </div>

              </div>
            ))}

          </div>
        </div>
      </section>


      {/* FEATURED DESIGNERS */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">

          <div className="mb-6 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Featured Designers
            </h2>
            <button className="text-red-600">
              View all →
            </button>
          </div>

          {/* Carousel */}
          <div className="flex gap-4 overflow-x-auto scroll-smooth snap-x snap-mandatory pb-4">

            {designers.map((designer) => (
              <div
                key={designer.name}
                className="relative min-w-[75%] md:min-w-[30%] snap-start overflow-hidden rounded-[28px]"
              >

                {/* Image */}
                <img
                  src="https://images.unsplash.com/photo-1520975916090-3105956dac38?w=800&q=80"
                  alt={designer.name}
                  className="h-72 w-full object-cover"
                />

                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Content overlay */}
                <div className="absolute bottom-0 p-4 text-white">

                  <div className="flex items-center gap-2 text-lg font-semibold">
                    {designer.name}

                    {/* FLAG (future dynamic) */}
                    <span className="text-sm">
                      {designer.name === "House of Tife" ? "🇳🇬" : ""}
                    </span>
                  </div>

                  <p className="text-sm text-gray-200">
                    {designer.specialty}
                  </p>

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

      {/* CTA */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl rounded-[40px] bg-black px-8 py-16 text-center text-white">

          <h2 className="text-4xl font-bold">
            Are You a Fashion Designer?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-gray-300">
            Create your storefront, get discovered, and grow your
            fashion business globally.
          </p>

          <button className="mt-8 rounded-md bg-red-600 px-8 3">
            Become a Designer
          </button>

        </div>
      </section>

    </main >
  );
}
