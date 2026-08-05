// Capitalizes only the first letter after the start of the string or a space —
// leaves everything else untouched so names like "McDonald" or "O'Brien" aren't mangled.
export function capitalizeWords(value: string): string {
    return value.replace(/(^|\s)([a-z])/g, (_match, sep, char) => sep + char.toUpperCase());
}
