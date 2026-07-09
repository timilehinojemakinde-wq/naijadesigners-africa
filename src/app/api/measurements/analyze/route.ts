import { NextResponse } from "next/server";

const STYLE_FIELDS: Record<string, {
    label: string;
    description: string;
    fields: string[];
}> = {
    senator: {
        label: "Senator & Kaftan",
        description: "Traditional Top & Trouser (Buba & Sokoto)",
        fields: [
            "Shoulder (Back)", "Chest (Chest Round)", "Neck (Neck Round)",
            "Sleeve Length (Hand Length)", "Sleeve Cuff (Hand Round)",
            "Top Length (Buba Length)", "Trouser Waist", "Thigh (Lap Round)",
            "Knee (Knee Round)", "Ankle (Trouser Mouth)", "Trouser Length (Sokoto Length)"
        ]
    },
    gown: {
        label: "Traditional Gown",
        description: "Ankara, Corset & Fitted Bespoke Gowns",
        fields: [
            "Shoulder (Back)", "Bust (Bust Round)", "Underbust (Underbust Round)",
            "Armhole", "Bicep (Hand Round)", "Sleeve Length (Hand Length)",
            "Half Length (Shoulder to Underbust)", "Waist (High Waist)",
            "Hip (Hip Round)", "Thigh (Lap Round)", "Gown Length"
        ]
    },
    skirt_blouse: {
        label: "Skirt & Blouse",
        description: "Traditional Two-Piece Outfit",
        fields: [
            "Shoulder (Back)", "Bust (Bust Round)", "Armhole",
            "Bicep (Hand Round)", "Sleeve Length (Hand Length)",
            "Blouse Length", "Waist (Skirt Waist)", "Hip (Hip Round)",
            "Knee (Knee Round)", "Skirt Length"
        ]
    },
    suit: {
        label: "Formal Suit",
        description: "Western Style Jacket & Trousers",
        fields: [
            "Shoulder Width (Back)", "Chest (Chest Round)", "Neck (Neck Round)",
            "Sleeve Length (Hand Length)", "Shirt Waist (Waist)",
            "Trouser Waist", "Hip (Seat / Hip Round)", "Inseam", "Trouser Length"
        ]
    },
};

export async function POST(request: Request) {
    try {
        const { frontImage, sideImage, style, gender } = await request.json();

        if (!frontImage || !sideImage) {
            return NextResponse.json(
                { error: "Front and side images are required." },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                { error: "Gemini API key not configured on server." },
                { status: 500 }
            );
        }

        const styleInfo = STYLE_FIELDS[style ?? "senator"] ?? STYLE_FIELDS.senator;
        const clientGender = gender ?? "unspecified";

        const prompt = `You are a master tailor with 30 years of experience in Nigerian bespoke tailoring.

The customer was photographed inside a calibrated measurement frame:
- The RECTANGULAR FRAME covers their FULL BODY from head to feet
- The CIRCULAR GUIDE at the top is where their HEAD was positioned  
- The HORIZONTAL LINE in the middle marks their WAIST
- Use these frame proportions as your scale reference to extract accurate measurements

Analyze the FRONT photo and SIDE photo of this ${clientGender} client.
Extract precise body measurements in CENTIMETRES for a custom ${styleInfo.label} (${styleInfo.description}).

The frame-based capture ensures accurate proportional scaling — use the head circle, waist line, and full frame to calibrate your measurements.

Return ONLY a valid JSON object with exactly these measurement keys:
${styleInfo.fields.map(f => `"${f}"`).join(", ")}

Also include:
- "advisorNote": a professional tailor's observation about this client's proportions and fit recommendation (2 sentences)
- "confidence": number between 0.0 and 1.0

CRITICAL: Return ONLY the JSON. No markdown. No backticks. No explanation.`;

        // Dynamically import to avoid SSR issues
        const { GoogleGenAI } = await import("@google/genai");
        const ai = new GoogleGenAI({ apiKey });

        const frontBase64 = frontImage.replace(/^data:image\/\w+;base64,/, "");
        const sideBase64 = sideImage.replace(/^data:image\/\w+;base64,/, "");

        const response = await ai.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [
                {
                    role: "user",
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: "image/jpeg",
                                data: frontBase64,
                            },
                        },
                        {
                            inlineData: {
                                mimeType: "image/jpeg",
                                data: sideBase64,
                            },
                        },
                    ],
                },
            ],
        });

        const text =
            response.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
        const cleaned = text.replace(/```json|```/g, "").trim();
        const parsed = JSON.parse(cleaned);

        const measurements = styleInfo.fields.map((field) => ({
            label: field,
            value: parsed[field]
                ? Number(parsed[field]).toFixed(1)
                : "0",
            unit: "cm",
        }));

        return NextResponse.json({
            success: true,
            measurements,
            advisorNote: parsed.advisorNote ?? "",
            confidence: parsed.confidence ?? 0.8,
            style: styleInfo.label,
            gender: clientGender,
        });
    } catch (error: any) {
        console.error("Measurement analysis error:", error);
        return NextResponse.json(
            { error: error.message ?? "Analysis failed. Please try again." },
            { status: 500 }
        );
    }
}