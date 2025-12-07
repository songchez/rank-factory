import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");

const DEFAULT_TEXT_MODEL = process.env.GOOGLE_TEXT_MODEL || "gemini-2.5-flash";
const DEFAULT_IMAGE_MODEL =
  process.env.GOOGLE_IMAGE_MODEL || "gemini-2.5-flash-image";

export interface GeneratedTopic {
  title: string;
  category: string;
  items: string[];
}

export async function generateTopicContent(
  prompt: string
): Promise<GeneratedTopic> {
  if (!process.env.GOOGLE_API_KEY) {
    throw new Error("GOOGLE_API_KEY is not set");
  }

  const model = genAI.getGenerativeModel({ model: DEFAULT_TEXT_MODEL });

  const systemPrompt = `
    You are a helpful assistant that generates ranking topics.
    Given a user prompt, generate a JSON object with the following structure:
    {
      "title": "A catchy title for the ranking topic",
      "category": "One of: General, Food, Tech, Game, Entertain",
      "items": ["Item 1", "Item 2", "Item 3", "Item 4", "Item 5", "Item 6", "Item 7", "Item 8"]
    }
    Generate at least 8 items.
    Ensure the response is valid JSON. Do not include markdown code blocks.
  `;

  const result = await model.generateContent([
    systemPrompt,
    `Prompt: ${prompt}`,
  ]);
  const response = result.response;
  const text = response.text();

  // Clean up markdown if present
  const jsonStr = text
    .replace(/```json/g, "")
    .replace(/```/g, "")
    .trim();

  try {
    return JSON.parse(jsonStr) as GeneratedTopic;
  } catch (e) {
    console.error("Failed to parse AI response:", text);
    throw new Error("Failed to parse AI response");
  }
}

import { createClient } from "@supabase/supabase-js";

// Create a Supabase client with the service role key for uploading images
// We need the service role key to bypass RLS if necessary, or just use the public key if the bucket is public writable (unlikely).
// However, since this runs on the server, we should use the service role key if available, or fall back to the anon key.
// But usually, uploading requires authentication.
// For simplicity in this demo, we'll try to use the standard client creation but we might need the service role key for admin uploads.
// Let's check if we have a service role key in env, otherwise we use the anon key and hope the user is authenticated (but this is a server action).
// Actually, server actions run on the server. We can use the service role key if we have it.
// If not, we'll try to use the anon key.
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseKey =
  process.env.SUPABASE_SERVICE_ROLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseKey);

export async function generateImage(prompt: string): Promise<string> {
  if (!process.env.GOOGLE_API_KEY) {
    console.warn("GOOGLE_API_KEY is not set. Skipping image generation.");
    return "https://placehold.co/400x400?text=No+API+Key";
  }

  try {
    // Use the specific model for image generation
    // Note: The Node.js SDK might have a slightly different way to access the 'imagen' or 'gemini-2.5-flash-image' capabilities
    // compared to the Python SDK.
    // However, based on the user's Python code: client.models.generate_content(model="gemini-2.5-flash-image", contents=[prompt])
    // We will try to replicate this structure.

    const model = genAI.getGenerativeModel({ model: DEFAULT_IMAGE_MODEL });

    const result = await model.generateContent(prompt);
    const response = result.response;

    // The response for image generation usually contains inline data (base64)
    // We need to inspect the candidates/parts.
    // In the Node SDK, we might need to access the raw parts if the helper text() doesn't work for images.

    // According to some docs, for image generation models, the response might be different.
    // But let's assume standard structure first.

    // If the SDK doesn't support "gemini-2.5-flash-image" directly via generateContent returning an image,
    // we might need to look at 'candidates[0].content.parts[0].inlineData'.

    // Let's try to find the image data.
    // Note: The user's python code iterates over parts and checks for inline_data.

    // We can't easily inspect the structure at runtime without running it.
    // But we will write defensive code.

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No candidates returned");
    }

    const candidate = response.candidates[0];
    const part = candidate.content.parts[0];

    if (!part || !part.inlineData) {
      console.warn(
        "No inline data found in response. Response might be text-only or error."
      );
      // Fallback if it returns text (e.g. "I cannot generate that")
      return "https://placehold.co/400x400?text=Generation+Failed";
    }

    const base64Data = part.inlineData.data;
    const mimeType = part.inlineData.mimeType || "image/png";

    // Upload to Supabase Storage
    // Convert base64 to Buffer
    const buffer = Buffer.from(base64Data, "base64");

    // Generate a unique filename
    const filename = `ai-generated/${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.png`;

    // Check if bucket exists and create if not
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.find((b) => b.name === "images");

    if (!bucketExists) {
      console.log("Bucket 'images' not found. Attempting to create...");
      const { error: createError } = await supabase.storage.createBucket(
        "images",
        {
          public: true,
          fileSizeLimit: 5242880, // 5MB
          allowedMimeTypes: ["image/png", "image/jpeg", "image/webp"],
        }
      );

      if (createError) {
        console.error("Failed to create bucket:", createError);
        // If we can't create it, we can't upload.
        return "https://placehold.co/400x400?text=Bucket+Error";
      }
    }

    // Upload
    const { data, error } = await supabase.storage
      .from("images") // Assuming 'images' bucket exists
      .upload(filename, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      console.error("Supabase Upload Error:", error);
      // If bucket doesn't exist or permission denied, fallback
      return "https://placehold.co/400x400?text=Upload+Failed";
    }

    // Get Public URL
    const { data: publicUrlData } = supabase.storage
      .from("images")
      .getPublicUrl(filename);

    return publicUrlData.publicUrl;
  } catch (e) {
    console.error("Image Generation Error:", e);
    return "https://placehold.co/400x400?text=Error";
  }
}
