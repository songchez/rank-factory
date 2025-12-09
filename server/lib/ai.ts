import { GoogleGenerativeAI } from "@google/generative-ai";

// Helper to get environment variables (works in both Node and Cloudflare Workers)
function getEnv(key: string, defaultValue = ""): string {
  if (typeof process !== 'undefined' && process.env) {
    return process.env[key] || defaultValue;
  }
  // Fallback for Cloudflare Workers - will be passed via context
  return defaultValue;
}

export interface GeneratedTopic {
  title: string;
  category: string;
  items: string[];
}

export async function generateTopicContent(
  prompt: string,
  env?: any
): Promise<GeneratedTopic> {
  const apiKey = env?.GOOGLE_API_KEY || getEnv('GOOGLE_API_KEY');
  const textModel = env?.GOOGLE_TEXT_MODEL || getEnv('GOOGLE_TEXT_MODEL', 'gemini-2.5-flash');

  if (!apiKey) {
    throw new Error("GOOGLE_API_KEY is not set");
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: textModel });

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

export async function generateImage(prompt: string, env?: any): Promise<string> {
  const apiKey = env?.GOOGLE_API_KEY || getEnv('GOOGLE_API_KEY');
  const imageModel = env?.GOOGLE_IMAGE_MODEL || getEnv('GOOGLE_IMAGE_MODEL', 'gemini-2.5-flash-image');
  const supabaseUrl = env?.SUPABASE_URL || getEnv('SUPABASE_URL');
  const supabaseKey = env?.SUPABASE_SERVICE_ROLE_KEY || env?.SUPABASE_PUBLISHABLE_KEY || getEnv('SUPABASE_SERVICE_ROLE_KEY') || getEnv('SUPABASE_PUBLISHABLE_KEY');

  if (!apiKey) {
    console.warn("GOOGLE_API_KEY is not set. Skipping image generation.");
    return "https://placehold.co/400x400?text=No+API+Key";
  }

  try {
    const genAI = new GoogleGenerativeAI(apiKey);
    const model = genAI.getGenerativeModel({ model: imageModel });

    const result = await model.generateContent(prompt);
    const response = result.response;

    if (!response.candidates || response.candidates.length === 0) {
      throw new Error("No candidates returned");
    }

    const candidate = response.candidates[0];
    const part = candidate.content.parts[0];

    if (!part || !part.inlineData) {
      console.warn(
        "No inline data found in response. Response might be text-only or error."
      );
      return "https://placehold.co/400x400?text=Generation+Failed";
    }

    const base64Data = part.inlineData.data;
    const mimeType = part.inlineData.mimeType || "image/png";

    // Upload to Supabase Storage
    const buffer = Buffer.from(base64Data, "base64");
    const filename = `ai-generated/${Date.now()}-${Math.random()
      .toString(36)
      .substring(7)}.png`;

    if (!supabaseUrl || !supabaseKey) {
      console.warn("Supabase credentials not available");
      return "https://placehold.co/400x400?text=Upload+Error";
    }

    const supabase = createClient(supabaseUrl, supabaseKey);

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
        return "https://placehold.co/400x400?text=Bucket+Error";
      }
    }

    // Upload
    const { data, error } = await supabase.storage
      .from("images")
      .upload(filename, buffer, {
        contentType: mimeType,
        upsert: false,
      });

    if (error) {
      console.error("Supabase Upload Error:", error);
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
