import { createClient } from "@supabase/supabase-js";

const HF_API_KEY = process.env.HUGGINGFACE_API_KEY;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Initialize Supabase client for storage
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

/**
 * Generates an image using Hugging Face Inference API.
 * Uses FLUX.1 or SDXL models.
 */
export async function generateHuggingFaceImage(prompt: string): Promise<Buffer> {
    if (!HF_API_KEY) throw new Error("HUGGINGFACE_API_KEY is not set");

    // Using FLUX.1-schnell for best text-in-image performance
    const model = "black-forest-labs/FLUX.1-schnell";
    const response = await fetch(
        `https://router.huggingface.co/hf-test-utils/inference-proxy/m/${model}`,
        {
            headers: {
                Authorization: `Bearer ${HF_API_KEY}`,
                "Content-Type": "application/json",
            },
            method: "POST",
            body: JSON.stringify({ inputs: prompt }),
        }
    );

    if (!response.ok) {
        const error = await response.text();
        console.error("[HF-IMAGE-ERROR]", error);
        throw new Error(`Failed to generate image: ${response.statusText}`);
    }

    const arrayBuffer = await response.arrayBuffer();
    return Buffer.from(arrayBuffer);
}

/**
 * Uploads an image buffer to Supabase storage and returns the public URL.
 */
export async function uploadToSupabase(buffer: Buffer, fileName: string): Promise<string> {
    const { data, error } = await supabase.storage
        .from("graphics")
        .upload(`generated/${fileName}`, buffer, {
            contentType: "image/webp",
            upsert: true,
        });

    if (error) {
        console.error("[SUPABASE-STORAGE-ERROR]", error);
        throw new Error(`Failed to upload to Supabase: ${error.message}`);
    }

    const { data: publicUrlData } = supabase.storage
        .from("graphics")
        .getPublicUrl(data.path);

    return publicUrlData.publicUrl;
}

/**
 * High-level helper to generate a minimalist B&W graphic.
 */
export async function generateMinimalistGraphic(text: string): Promise<string> {
    // Crafting a very specific prompt for the "handwritten/minimalist" style the user showed
    const prompt = `
        A minimalist, premium LinkedIn graphic on an A4 portrait canvas (aspect ratio 4:5). 
        The background is high-quality white paper texture with very subtle grain.
        In the exact center, there is clear, bold, dark-navy or black text that says: "${text}".
        The font is clean, modern, and looks professional. 
        Style: Apple-inspired minimalist aesthetic.
        Colors: Pure Black and White only.
        No other elements, no logos, no clutter. High resolution.
    `.trim();

    const buffer = await generateHuggingFaceImage(prompt);
    const fileName = `graphic_${Date.now()}.webp`;
    return await uploadToSupabase(buffer, fileName);
}
