const MAX_VIDEO_DURATION_SECONDS = 30;
const MAX_VIDEO_SIZE_MB = 25;

export function validateVideo(file: File): Promise<{ valid: boolean; reason?: string }> {
    return new Promise((resolve) => {
        if (file.size > MAX_VIDEO_SIZE_MB * 1024 * 1024) {
            resolve({
                valid: false,
                reason: `Video must be under ${MAX_VIDEO_SIZE_MB}MB. Yours is ${(file.size / 1024 / 1024).toFixed(1)}MB.`,
            });
            return;
        }

        const video = document.createElement("video");
        video.preload = "metadata";

        const objectUrl = URL.createObjectURL(file);
        video.src = objectUrl;

        const timer = setTimeout(() => {
            URL.revokeObjectURL(objectUrl);
            resolve({ valid: true });
        }, 5000);

        video.onloadedmetadata = () => {
            clearTimeout(timer);
            const duration = video.duration;
            URL.revokeObjectURL(objectUrl);

            if (duration > MAX_VIDEO_DURATION_SECONDS) {
                resolve({
                    valid: false,
                    reason: `Video must be ${MAX_VIDEO_DURATION_SECONDS}s or less. Yours is ${Math.round(duration)}s.`,
                });
            } else {
                resolve({ valid: true });
            }
        };

        video.onerror = () => {
            clearTimeout(timer);
            URL.revokeObjectURL(objectUrl);
            resolve({ valid: true });
        };
    });
}