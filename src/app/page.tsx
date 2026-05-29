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
      <section className="px-6 py-20 md:py-28">
        <div className="mx-auto max-w-6xl text-center">
          <span className="rounded-full bg-red-100 px-4 py-2 text-sm font-medium text-red-600">
            Africa’s Fashion Marketplace
          </span>

          <h1 className="mt-6 text-5xl font-bold tracking-tight md:text-7xl">
            Discover Africa’s Finest Fashion Designers
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg text-gray-600 md:text-xl">
            Shop custom-made fashion from top African designers —
            powered by AI body measurement for the perfect fit,
            anywhere in the world.
          </p>

          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <button className="rounded-full bg-red-600 px-8 py-4 text-white transition hover:scale-105">
              Explore Designers
            </button>

            <button className="rounded-full border border-black px-8 py-4 transition hover:bg-gray-100">
              Become a Designer
            </button>
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
