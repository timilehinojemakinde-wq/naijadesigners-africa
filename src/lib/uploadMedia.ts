import { supabase } from "@/lib/supabaseClient";

export async function uploadMediaFile(file: File, userId: string): Promise<string> {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).slice(2)}.${fileExt}`;

    let uploadError = null;
    const MAX_RETRIES = 3;

    for (let attempt = 1; attempt <= MAX_RETRIES; attempt++) {
        const result = await supabase.storage
            .from("product-media")
            .upload(fileName, file, {
                cacheControl: "3600",
                upsert: false,
            });

        uploadError = result.error;
        if (!uploadError) break;

        if (attempt < MAX_RETRIES) {
            await new Promise((r) => setTimeout(r, 1000));
        }
    }

    if (uploadError) {
        throw new Error(uploadError.message);
    }

    const { data: urlData } = supabase.storage
        .from("product-media")
        .getPublicUrl(fileName);

    return urlData.publicUrl;
}