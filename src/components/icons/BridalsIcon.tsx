interface IconProps {
    className?: string;
}

export default function BridalsIcon({
    className = "h-6 w-6",
}: IconProps) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={className}
        >
            <path d="M12 4c1.2 0 2-.8 2-2s-.8-2-2-2-2 .8-2 2 .8 2 2 2Z" />

            <path d="M12 4 8 10l-3 8h14l-3-8-4-6Z" />

            <path d="M9 10h6" />
        </svg>
    );
}
