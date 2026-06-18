import Link from "next/link";
import { Check, ArrowRight, Star, Zap, ShoppingBag, BarChart3, FileText, Ruler } from "lucide-react";

export default function LandingPage() {

  const features = [
    {
      icon: <ShoppingBag size={24} />,
      title: "Instant Custom Storefront",
      description: "Stop selling via Instagram DMs. Launch a branded online store in 5 minutes. Accept payments, showcase collections, and manage orders automatically.",
      benefit: "Launch in 5 minutes",
    },
    {
      icon: <Ruler size={24} />,
      title: "AI Body Measurement",
      description: "No more fitting errors. Customers snap a front and side photo — our AI sends precise measurements straight to your designer dashboard. No app download needed.",
      benefit: "Up to 98% accuracy",
    },
    {
      icon: <Zap size={24} />,
      title: "Order & Operations Management",
      description: "Track every garment from cutting table to delivery. Update statuses in real-time so your clients stay informed automatically — no more 'where is my dress?' texts.",
      benefit: "Zero WhatsApp chaos",
    },
    {
      icon: <FileText size={24} />,
      title: "Digital Invoicing & Bookkeeping",
      description: "Generate professional invoices, track deposits, and view your monthly revenue at a glance. Look like the premium brand you are.",
      benefit: "Get paid 3× faster",
    },
  ];

  const faqs = [
    {
      q: "How accurate is the AI body scan?",
      a: "Our AI uses advanced spatial scanning accurate to within 1.5cm, requiring only a tight-fitting outfit and two quick photos from 3 meters away.",
    },
    {
      q: "Do my customers need to download an app?",
      a: "No. The AI scan happens right inside your storefront in the web browser. Customers just snap two photos — front and side — and measurements populate instantly.",
    },
    {
      q: "Which payment methods are supported?",
      a: "We integrate with Paystack and Flutterwave for NGN payments, and support international card payments for diaspora customers paying in USD or GBP.",
    },
    {
      q: "Can I use this if I already have existing clients?",
      a: "Absolutely. FitHouseAfrica is built first as a tool for managing your existing business — clients, orders, invoices. The marketplace exposure is an additional benefit.",
    },
    {
      q: "What happens after my 14-day free trial?",
      a: "You choose a plan that fits your business. No automatic charges — we'll remind you before the trial ends and you decide whether to continue.",
    },
  ];

  const plans = [
    {
      name: "Starter",
      price: "₦15,000",
      usd: "$10",
      period: "/month",
      description: "For upcoming tailors getting started",
      features: [
        "Branded storefront",
        "Up to 20 products",
        "Order management",
        "Basic invoicing",
        "5 AI measurement scans/month",
        "Email support",
      ],
      cta: "Start Free Trial",
      featured: false,
    },
    {
      name: "Growth",
      price: "₦35,000",
      usd: "$23",
      period: "/month",
      description: "For established fashion houses scaling up",
      features: [
        "Everything in Starter",
        "Unlimited products",
        "Unlimited AI measurement scans",
        "Advanced analytics",
        "Custom domain storefront",
        "Priority support",
        "Paystack & Flutterwave integration",
      ],
      cta: "Start Free Trial",
      featured: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      usd: "",
      period: "",
      description: "For large fashion brands with multiple teams",
      features: [
        "Everything in Growth",
        "Multiple staff accounts",
        "Multiple store locations",
        "Dedicated account manager",
        "Custom integrations",
        "SLA support",
      ],
      cta: "Contact Sales",
      featured: false,
    },
  ];

  return (
    <main className="min-h-screen bg-white text-gray-900 antialiased">

      {/* ── NAV ── */}
      <nav className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-6 py-4">
          <h1 className="text-xl font-bold tracking-tight">
            FitHouse<span className="text-emerald-600">Africa</span>
          </h1>
          <div className="hidden items-center gap-8 text-sm font-medium text-gray-600 md:flex">
            <a href="#features" className="hover:text-gray-900">Features</a>
            <a href="#how-it-works" className="hover:text-gray-900">How It Works</a>
            <a href="#pricing" className="hover:text-gray-900">Pricing</a>
            <a href="#faq" className="hover:text-gray-900">FAQ</a>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/auth"
              className="hidden text-sm font-medium text-gray-600 hover:text-gray-900 md:block"
            >
              Log in
            </Link>
            <Link
              href="/auth"
              className="rounded-lg bg-black px-4 py-2 text-sm font-semibold text-white hover:bg-gray-800"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </nav>

      {/* ── HERO ── */}
      <section className="bg-gradient-to-b from-gray-50 to-white px-6 py-20 text-center md:py-28">
        <div className="mx-auto max-w-4xl">
          <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-red-100 bg-emerald-50 px-4 py-1.5 text-xs font-semibold uppercase tracking-widest text-emerald-600">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-black" />
            Now in Early Access · Nigeria & Pan-Africa
          </div>

          <h1 className="text-4xl font-bold leading-[1.1] tracking-tight text-gray-900 md:text-6xl">
            The All-In-One Platform
            <br />
            <span className="text-emerald-600">Built for African</span>
            <br />
            Fashion Designers.
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-gray-500">
            Launch a stunning online store, capture perfect AI body measurements instantly via photo, and manage your custom orders — all from one dashboard. No WhatsApp chaos. No missed measurements. No lost invoices.
          </p>

          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/auth"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-8 py-4 text-base font-semibold text-white hover:bg-gray-800 sm:w-auto"
            >
              Start 14-Day Free Trial
              <ArrowRight size={18} />
            </Link>

            <a
              href="#how-it-works"
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-gray-200 px-8 py-4 text-base font-semibold text-gray-700 hover:border-gray-300 hover:bg-gray-50 sm:w-auto"
            >
              See How It Works
            </a>
          </div>

          <p className="mt-6 text-sm text-gray-400">
            No credit card required · Cancel anytime · Setup in 5 minutes
          </p>

          {/* HERO MOCKUP */}
          <div className="mx-auto mt-16 max-w-5xl overflow-hidden rounded-2xl border border-gray-200 bg-gray-900 shadow-2xl">
            {/* Browser chrome */}
            <div className="flex items-center gap-2 border-b border-gray-700 bg-gray-800 px-4 py-3">
              <div className="h-3 w-3 rounded-full bg-emerald-500" />
              <div className="h-3 w-3 rounded-full bg-yellow-500" />
              <div className="h-3 w-3 rounded-full bg-green-500" />
              <div className="mx-auto rounded-md bg-gray-700 px-4 py-1 text-xs text-gray-400">
                app.fithouse.africa/dashboard
              </div>
            </div>

            {/* Dashboard preview */}
            <div className="grid grid-cols-4 gap-0">
              {/* Sidebar */}
              <div className="col-span-1 border-r border-gray-700 bg-gray-800 p-4">
                <div className="mb-6 text-sm font-bold text-white">
                  FitHouse<span className="text-emerald-400">Africa</span>
                </div>
                {["Dashboard", "Orders", "Measurements", "Store", "Invoices", "Profile"].map((item, i) => (
                  <div
                    key={item}
                    className={`mb-1 rounded-lg px-3 py-2 text-xs ${i === 0 ? "bg-black text-white" : "text-gray-400 hover:text-gray-200"}`}
                  >
                    {item}
                  </div>
                ))}
              </div>

              {/* Main content */}
              <div className="col-span-3 p-6">
                <div className="mb-4 text-sm font-semibold text-white">
                  Good morning, House of Tife 👋
                </div>

                {/* Stats */}
                <div className="mb-6 grid grid-cols-3 gap-3">
                  {[
                    { label: "Revenue (Month)", value: "₦820k", change: "+34%" },
                    { label: "Active Orders", value: "12", change: "+3 new" },
                    { label: "AI Scans Sent", value: "47", change: "This week" },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-xl bg-gray-700 p-3">
                      <div className="text-xs text-gray-400">{stat.label}</div>
                      <div className="mt-1 text-lg font-bold text-white">{stat.value}</div>
                      <div className="mt-0.5 text-xs text-green-400">{stat.change}</div>
                    </div>
                  ))}
                </div>

                {/* Recent orders */}
                <div className="text-xs font-semibold uppercase tracking-wider text-gray-500 mb-3">
                  Recent Orders
                </div>
                {[
                  { name: "Sarah A.", item: "Wedding Dress", amount: "₦250k", status: "Production", color: "bg-yellow-500" },
                  { name: "David K.", item: "Native Agbada", amount: "₦120k", status: "AI Measuring", color: "bg-purple-500" },
                  { name: "Mariam B.", item: "Luxury Gown", amount: "₦180k", status: "Delivered", color: "bg-green-500" },
                ].map((order) => (
                  <div key={order.name} className="mb-2 flex items-center justify-between rounded-lg bg-gray-700 px-3 py-2">
                    <div>
                      <div className="text-xs font-medium text-white">{order.name}</div>
                      <div className="text-xs text-gray-400">{order.item}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-xs font-bold text-yellow-400">{order.amount}</div>
                      <div className={`mt-0.5 inline-block rounded-full px-2 py-0.5 text-[10px] text-white ${order.color}`}>
                        {order.status}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── TRUST STRIP ── */}
      <section className="border-y border-gray-100 bg-gray-50 py-8">
        <div className="mx-auto max-w-6xl px-6">
          <p className="mb-6 text-center text-xs font-semibold uppercase tracking-widest text-gray-400">
            Trusted by designers across Africa
          </p>
          <div className="flex flex-wrap items-center justify-center gap-8 text-sm font-semibold text-gray-300">
            {["House of Tife", "Veekee Atelier", "Mode & Cedar", "Style Temple", "Atelier Red", "Luxe Native"].map((brand) => (
              <span key={brand}>{brand}</span>
            ))}
          </div>
        </div>
      </section>

      {/* ── PROBLEM ── */}
      <section className="px-6 py-20">
        <div className="mx-auto max-w-4xl text-center">
          <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-emerald-600">
            The Problem
          </p>
          <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
            Running a fashion business on WhatsApp
            <span className="text-emerald-600"> is killing your growth.</span>
          </h2>
          <p className="mx-auto mt-5 max-w-2xl text-gray-500 leading-relaxed">
            Most African tailors and designers are incredibly talented — but buried in admin, chasing payments, losing orders to avoidable measurement errors, and unable to scale beyond their local market.
          </p>
        </div>

        <div className="mx-auto mt-16 max-w-5xl grid gap-6 md:grid-cols-2">
          {[
            {
              emoji: "😤",
              title: "Wrong measurements, ruined orders",
              body: "Clients send numbers over WhatsApp, you guess the rest. Every remake costs time, money, and your reputation.",
            },
            {
              emoji: "👻",
              title: "No order tracking or visibility",
              body: "You're managing 15 orders in your head. Things fall through. Clients chase you. Deadlines slip.",
            },
            {
              emoji: "💸",
              title: "Payment collection is chaos",
              body: "Bank transfers with no paper trail. Clients who 'forget' to pay. No invoicing system. Your cash flow suffers.",
            },
            {
              emoji: "🌍",
              title: "You can't reach diaspora customers",
              body: "Your portfolio is scattered across Instagram stories. Customers abroad want to order but have no reliable way to buy from you.",
            },
          ].map((pain) => (
            <div key={pain.title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
              <div className="mb-4 text-3xl">{pain.emoji}</div>
              <h3 className="mb-2 font-semibold text-gray-900">{pain.title}</h3>
              <p className="text-sm leading-relaxed text-gray-500">{pain.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-emerald-600">
              Features
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Everything your fashion business needs.
              <span className="text-emerald-600"> One tool.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-gray-500">
              Stop juggling five apps. FitHouseAfrica replaces your measurement book, order tracker, invoice tool, storefront, and client database.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {features.map((feature, i) => (
              <div key={i} className="rounded-2xl border border-gray-100 bg-white p-8 shadow-sm">
                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
                  {feature.icon}
                </div>
                <h3 className="mb-2 text-lg font-bold text-gray-900">{feature.title}</h3>
                <p className="mb-4 text-sm leading-relaxed text-gray-500">{feature.description}</p>
                <div className="inline-flex items-center gap-1.5 rounded-full bg-green-50 px-3 py-1 text-xs font-semibold text-green-700">
                  <Check size={12} />
                  {feature.benefit}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section id="how-it-works" className="px-6 py-20">
        <div className="mx-auto max-w-4xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-emerald-600">
              How It Works
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Up and running in
              <span className="text-emerald-600"> under 10 minutes.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-gray-500">
              No tech skills needed. If you can use WhatsApp, you can use FitHouseAfrica.
            </p>
          </div>

          <div className="relative">
            {/* Connecting line */}
            <div className="absolute left-6 top-8 h-[calc(100%-4rem)] w-0.5 bg-gray-100 md:left-1/2 md:-translate-x-px" />

            <div className="space-y-12">
              {[
                {
                  step: "01",
                  title: "Create your account",
                  body: "Sign up free. Enter your brand name, the styles you specialise in, and claim your store URL. Takes 2 minutes.",
                },
                {
                  step: "02",
                  title: "Set up your storefront",
                  body: "Upload photos of your best work. Your branded store goes live instantly — shareable with any client anywhere in the world.",
                },
                {
                  step: "03",
                  title: "Send your first AI measurement link",
                  body: "Share a link with your client. They snap two photos. You receive 14 precise body measurements in under 60 seconds.",
                },
                {
                  step: "04",
                  title: "Manage orders and get paid",
                  body: "Track every order through your pipeline. Send professional invoices. Get paid via Paystack, Flutterwave, or international card.",
                },
              ].map((item, i) => (
                <div key={i} className="relative flex gap-8 pl-16 md:pl-0">
                  <div className="absolute left-0 flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-emerald-600 bg-white font-bold text-emerald-600 md:relative md:left-auto">
                    {item.step}
                  </div>
                  <div className="md:pl-8">
                    <h3 className="mb-2 font-bold text-gray-900">{item.title}</h3>
                    <p className="text-sm leading-relaxed text-gray-500">{item.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── SOCIAL PROOF ── */}
      <section className="bg-gray-900 px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-emerald-400">
              Designer Stories
            </p>
            <h2 className="text-3xl font-bold text-white md:text-4xl">
              Designers are growing faster.
            </h2>
          </div>

          <div className="grid gap-6 md:grid-cols-3">
            {[
              {
                quote: "Before FitHouse, I was managing everything in my head and on WhatsApp. Now I have a real order pipeline. My monthly revenue doubled in 4 months.",
                name: "Tife Adeyemi",
                brand: "House of Tife · Lagos",
              },
              {
                quote: "The AI measurement link changed everything. I send it to clients abroad and they scan themselves. Six international orders with zero remakes.",
                name: "Kemi Fashola",
                brand: "KF Couture · Abuja",
              },
              {
                quote: "The invoice tool alone saved me hours every week. Clients take you more seriously when you send a professional invoice instead of an account number.",
                name: "Bisi Johnson",
                brand: "BJ Bespoke · Port Harcourt",
              },
            ].map((testi, i) => (
              <div key={i} className="rounded-2xl border border-gray-700 bg-gray-800 p-6">
                <div className="mb-4 flex text-yellow-400">
                  {[...Array(5)].map((_, j) => <Star key={j} size={14} fill="currentColor" />)}
                </div>
                <p className="mb-6 text-sm italic leading-relaxed text-gray-300">
                  "{testi.quote}"
                </p>
                <div>
                  <p className="font-semibold text-white">{testi.name}</p>
                  <p className="text-xs text-gray-400">{testi.brand}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="px-6 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="mb-16 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-emerald-600">
              Pricing
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900 md:text-4xl">
              Simple pricing.
              <span className="text-emerald-600"> No surprises.</span>
            </h2>
            <p className="mx-auto mt-5 max-w-xl text-gray-500">
              Start with a 14-day free trial. No credit card required. Cancel anytime.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 md:items-stretch">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`relative flex flex-col rounded-2xl p-8 ${plan.featured
                  ? "border-2 border-emerald-600 bg-gray-900 shadow-xl"
                  : "border border-gray-200 bg-white"
                  }`}
              >
                {plan.featured && (
                  <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 rounded-full bg-black px-4 py-1 text-xs font-bold text-white">
                    ⭐ Most Popular
                  </div>
                )}

                <div className="mb-6">
                  <h3 className={`text-xs font-bold uppercase tracking-widest ${plan.featured ? "text-gray-400" : "text-gray-500"}`}>
                    {plan.name}
                  </h3>
                  <div className="mt-3 flex items-end gap-2">
                    <span className={`text-4xl font-bold ${plan.featured ? "text-yellow-400" : "text-gray-900"}`}>
                      {plan.price}
                    </span>
                    {plan.usd && (
                      <span className={`mb-1 text-sm ${plan.featured ? "text-gray-400" : "text-gray-400"}`}>
                        · {plan.usd}
                      </span>
                    )}
                    {plan.period && (
                      <span className={`mb-1 text-sm ${plan.featured ? "text-gray-400" : "text-gray-400"}`}>
                        {plan.period}
                      </span>
                    )}
                  </div>
                  <p className={`mt-2 text-sm ${plan.featured ? "text-gray-400" : "text-gray-500"}`}>
                    {plan.description}
                  </p>
                </div>

                <div className="mb-8 h-px bg-gray-700 opacity-20" />

                <ul className="mb-8 flex-1 space-y-3">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-start gap-3 text-sm">
                      <Check size={16} className="mt-0.5 flex-shrink-0 text-emerald-500" />
                      <span className={plan.featured ? "text-gray-300" : "text-gray-600"}>{f}</span>
                    </li>
                  ))}
                </ul>

                <Link
                  href="/auth"
                  className={`flex items-center justify-center rounded-xl py-3.5 text-sm font-bold transition ${plan.featured
                    ? "bg-black text-white hover:bg-gray-800"
                    : "border border-gray-200 text-gray-900 hover:border-gray-300 hover:bg-gray-50"
                    }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="bg-gray-50 px-6 py-20">
        <div className="mx-auto max-w-3xl">
          <div className="mb-12 text-center">
            <p className="mb-3 text-xs font-semibold uppercase tracking-widest text-emerald-600">
              FAQ
            </p>
            <h2 className="text-3xl font-bold tracking-tight text-gray-900">
              Questions we always get.
            </h2>
          </div>

          <div className="space-y-4">
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

      {/* ── FINAL CTA ── */}
      <section className="bg-gray-900 px-6 py-24 text-center">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-4xl font-bold text-white md:text-5xl">
            Ready to build a smarter
            <span className="text-emerald-500"> fashion business?</span>
          </h2>
          <p className="mx-auto mt-5 max-w-xl text-lg text-gray-400">
            Join the future of African fashion. No technical skills required. Set up in 5 minutes.
          </p>
          <div className="mt-10 flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
            <Link
              href="/auth"
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-black px-8 py-4 text-base font-semibold text-white hover:bg-gray-800 sm:w-auto"
            >
              Launch Your Store Now
              <ArrowRight size={18} />
            </Link>
          </div>
          <p className="mt-5 text-sm text-gray-500">
            14-day free trial · No credit card required · Cancel anytime
          </p>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-gray-100 bg-white px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <div className="grid gap-10 md:grid-cols-4">
            <div>
              <h2 className="text-lg font-bold">
                FitHouse<span className="text-emerald-600">Africa</span>
              </h2>
              <p className="mt-3 text-sm leading-relaxed text-gray-500">
                The business operating system for African fashion designers. Measurements, orders, invoices, and storefront — all in one place.
              </p>
            </div>
            {[
              {
                title: "Product",
                links: ["Features", "AI Measurement", "Pricing", "Changelog"],
              },
              {
                title: "Designers",
                links: ["Get Started", "Success Stories", "Community", "Affiliate Programme"],
              },
              {
                title: "Company",
                links: ["About", "Blog", "Careers", "Contact"],
              },
            ].map((col) => (
              <div key={col.title}>
                <h3 className="mb-4 text-xs font-bold uppercase tracking-widest text-gray-400">
                  {col.title}
                </h3>
                <ul className="space-y-3">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a href="#" className="text-sm text-gray-500 hover:text-gray-900">
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-gray-100 pt-8 text-sm text-gray-400 md:flex-row">
            <p>© 2026 FitHouseAfrica. All rights reserved.</p>
            <div className="flex gap-6">
              <a href="#" className="hover:text-gray-600">Privacy Policy</a>
              <a href="#" className="hover:text-gray-600">Terms of Service</a>
              <a href="#" className="hover:text-gray-600">Built for Africa</a>
            </div>
          </div>
        </div>
      </footer>
    </main>
  );
}