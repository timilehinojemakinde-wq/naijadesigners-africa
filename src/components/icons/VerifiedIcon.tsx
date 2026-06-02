export function VerifiedIcon({
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
            <path d="M12 2l7 3v6c0 5-3.5 8.5-7 11-3.5-2.5-7-6-7-11V5l7-3Z" />
            <path d="M9 12l2 2 4-4" />
        </svg>
    );
}
