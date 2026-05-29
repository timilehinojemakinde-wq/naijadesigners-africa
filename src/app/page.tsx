export default function Home() {
  const categories = [
    "Aso Ebi",
    "Wedding",
    "Native Wear",
    "Corporate",
    "Luxury",
    "Casual",
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
      <nav className="sticky top-0 z-50 border-b bg-white/90 backdrop-blur-md">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold">
            NaijaDesigners<span className="text-red-600">.africa</span>
          </h1>

          <div className="hidden gap-8 md:flex">
            <button>Explore</button>
            <button>Designers</button>
            <button>Pricing</button>
          </div>

          <button className="rounded-full bg-red-600 px-5 py-2 text-white">
            Become a Designer
          </button>
        </div>
      </nav>

      {/* HERO */}
      <section className="overflow-hidden px-6 pb-16 pt-10 md:pb-24 md:pt-20">
        <div className="mx-auto grid max-w-7xl items-center gap-12 lg:grid-cols-2">

          {/* LEFT CONTENT */}
          <div className="text-center lg:text-left">
            <span className="inline-flex rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-600">
              Africa’s Global Fashion Marketplace
            </span>

            <h1 className="mt-6 text-5xl font-bold leading-tight tracking-tight md:text-7xl">
              Find Top Fashion Designers Across Africa
            </h1>

            <p className="mx-auto mt-6 max-w-xl text-lg text-gray-600 lg:mx-0 md:text-xl">
              Discover stunning fashion, connect with trusted designers,
              and order custom outfits from anywhere in the world —
              no physical measurement needed.
            </p>

            <div className="mt-8 flex flex-col gap-4 sm:flex-row lg:justify-start justify-center">
              <button className="rounded-full bg-red-600 px-8 py-4 text-white transition hover:scale-105 hover:bg-red-700">
                Find Designers
              </button>

              <button className="rounded-full border border-gray-300 px-8 py-4 transition hover:bg-gray-100">
                Become a Designer
              </button>
            </div>

            <div className="mt-8 flex items-center justify-center gap-8 text-sm text-gray-500 lg:justify-start">
              <div>
                <span className="font-bold text-black">500+</span>
                <p>Designers</p>
              </div>

              <div>
                <span className="font-bold text-black">10k+</span>
                <p>Happy Clients</p>
              </div>

              <div>
                <span className="font-bold text-black">Global</span>
                <p>Delivery</p>
              </div>
            </div>
          </div>

          {/* RIGHT IMAGES */}
          <div className="relative">
            <div className="grid grid-cols-2 gap-4">

              <div className="overflow-hidden rounded-[32px] shadow-lg">
                <img
                  src="https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=900&q=80"
                  alt="African fashion"
                  className="h-[420px] w-full object-cover"
                />
              </div>

              <div className="flex flex-col gap-4">
                <div className="overflow-hidden rounded-[32px] shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1529139574466-a303027c1d8b?w=900&q=80"
                    alt="Fashion designer"
                    className="h-[200px] w-full object-cover"
                  />
                </div>

                <div className="overflow-hidden rounded-[32px] shadow-lg">
                  <img
                    src="https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=900&q=80"
                    alt="Luxury outfit"
                    className="h-[200px] w-full object-cover"
                  />
                </div>
              </div>
            </div>

            {/* Floating card */}
            <div className="absolute bottom-4 left-4 rounded-[28px] bg-white p-4 shadow-xl">
              <p className="text-sm text-gray-500">
                Easy body measurement
              </p>

              <p className="font-semibold">
                No tailor visit needed
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <h2 className="mb-5 text-2xl font-bold">
            Shop by Occasion
          </h2>

          <div className="flex gap-3 overflow-x-auto pb-2">
            {categories.map((category) => (
              <button
                key={category}
                className="whitespace-nowrap rounded-full border border-gray-200 px-6 py-3 transition hover:border-red-500 hover:text-red-600"
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </section>

      {/* FEATURED DESIGNERS */}
      <section className="px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <div className="mb-8 flex items-center justify-between">
            <h2 className="text-2xl font-bold">
              Featured Designers
            </h2>

            <button className="text-red-600">
              View all →
            </button>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {designers.map((designer) => (
              <div
                key={designer.name}
                className="rounded-[32px] border border-gray-200 p-5 shadow-sm transition hover:shadow-lg"
              >
                <div className="h-60 rounded-[24px] bg-gray-100" />

                <h3 className="mt-4 text-xl font-semibold">
                  {designer.name}
                </h3>

                <p className="text-gray-500">
                  {designer.specialty}
                </p>

                <button className="mt-5 text-red-600">
                  View Store →
                </button>
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
      <section className="px-6 py-20">
        <div className="mx-auto max-w-5xl rounded-[40px] bg-black px-8 py-16 text-center text-white">
          <h2 className="text-4xl font-bold">
            Are You a Fashion Designer?
          </h2>

          <p className="mx-auto mt-4 max-w-xl text-gray-300">
            Create your storefront, get discovered, and grow your
            fashion business globally.
          </p>

          <button className="mt-8 rounded-full bg-red-600 px-8 py-4">
            Become a Designer
          </button>
        </div>
      </section>
    </main>
  );
}
