export function PaymentIcon({
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
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="M3 10h18" />
            <path d="M7 15h3" />
        </svg>
    );
}
