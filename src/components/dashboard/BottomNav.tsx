"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutGrid, Briefcase, Images, Users, Store } from "lucide-react";

const items = [
    { label: "Home", href: "/designer-dashboard", icon: LayoutGrid },
    { label: "Jobs", href: "/designer-dashboard/jobs", icon: Briefcase },
    { label: "Library", href: "/designer-dashboard/style-library", icon: Images },
    { label: "Clients", href: "/designer-dashboard/clients", icon: Users },
    { label: "Store", href: "/designer-dashboard/store", icon: Store },
];

export default function BottomNav() {
    const pathname = usePathname();

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-gray-100 bg-white">
            <div className="mx-auto flex max-w-md items-center justify-between px-4 py-3">
                {items.map((item) => {
                    const Icon = item.icon;
                    const active =
                        item.href === "/designer-dashboard"
                            ? pathname === "/designer-dashboard"
                            : pathname.startsWith(item.href);

                    return (
                        <Link
                            key={item.label}
                            href={item.href}
                            className={`flex flex-col items-center gap-1 transition ${active ? "text-gray-900" : "text-gray-400"
                                }`}
                        >
                            <Icon size={20} strokeWidth={active ? 2.5 : 1.8} />
                            <span className="text-[10px] font-medium">{item.label}</span>
                        </Link>
                    );
                })}
            </div>
        </nav>
    );
}