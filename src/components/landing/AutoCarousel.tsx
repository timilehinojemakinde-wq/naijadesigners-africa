"use client";

import { useEffect, useRef } from "react";

export default function AutoCarousel({
    children,
    autoPlay = true,
    interval = 3500,
}: {
    children: React.ReactNode[];
    autoPlay?: boolean;
    interval?: number;
}) {
    const scrollRef = useRef<HTMLDivElement>(null);
    const indexRef = useRef(0);
    const pausedRef = useRef(false);

    useEffect(() => {
        if (!autoPlay) return;
        const el = scrollRef.current;
        if (!el) return;

        const timer = setInterval(() => {
            if (pausedRef.current || !el) return;
            const cardWidth = el.firstElementChild?.clientWidth ?? el.clientWidth;
            indexRef.current = (indexRef.current + 1) % children.length;
            el.scrollTo({
                left: indexRef.current * (cardWidth + 16),
                behavior: "smooth",
            });
        }, interval);

        return () => clearInterval(timer);
    }, [autoPlay, interval, children.length]);

    return (
        <div
            ref={scrollRef}
            onTouchStart={() => (pausedRef.current = true)}
            className="no-scrollbar flex snap-x snap-mandatory gap-4 overflow-x-auto pb-2 md:hidden"
        >
            {children.map((child, i) => (
                <div key={i} className="w-[85%] flex-shrink-0 snap-center">
                    {child}
                </div>
            ))}
        </div>
    );
}