import imageCompression from "browser-image-compression";

export function compressWithTimeout(file: File, timeoutMs = 8000): Promise<File> {
    return new Promise((resolve) => {
        let settled = false;

        const timer = setTimeout(() => {
            if (!settled) {
                settled = true;
                console.warn("Compression timed out for", file.name, "- using original");
                resolve(file);
            }
        }, timeoutMs);

        imageCompression(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1600,
            useWebWorker: false,
        })
            .then((compressed) => {
                if (!settled) {
                    settled = true;
                    clearTimeout(timer);
                    resolve(compressed);
                }
            })
            .catch((err) => {
                if (!settled) {
                    settled = true;
                    clearTimeout(timer);
                    console.warn("Compression failed for", file.name, err);
                    resolve(file);
                }
            });
    });
}