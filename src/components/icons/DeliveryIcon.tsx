export function DeliveryIcon({
    className = "w-6 h-6",
}) {
    return (
        <svg
            viewBox="0 0 24 24"
            fill="none"
            className={className}
            stroke="currentColor"
            strokeWidth="1.8"
        >
            <path d="M3 7h11v8H3z" />
            <path d="M14 10h4l3 3v2h-7z" />
            <circle cx="7" cy="18" r="1.5" />
            <circle cx="18" cy="18" r="1.5" />
        </svg>
    );
}
