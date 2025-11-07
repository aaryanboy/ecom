import { NextResponse } from "next/server";
import { createAdminClient, supabase, STORAGE_BUCKET } from "@/lib/supabase";

// Centralized server-side media upload to Supabase Storage
export async function POST(req) {
  try {
    const formData = await req.formData();
    const file = formData.get("file");
    const fileName = formData.get("fileName") || (file?.name ?? "image.jpg");

    if (!file || typeof file === "string") {
      return NextResponse.json({ ok: false, error: "No file provided" }, { status: 400 });
    }

    // Generate numeric filename preserving extension
    const timestamp = Date.now();
    const rand = Math.floor(Math.random() * 1e9);
    const base = `${timestamp}${rand}`;
    const extMatch = (fileName || "").match(/\.([a-zA-Z0-9]+)$/);
    const ext = extMatch ? `.${extMatch[1]}` : "";
    const uniqueFileName = `${base}${ext}`;

    // Prefer admin client when available; fallback to public client
    let client;
    try {
      client = createAdminClient();
    } catch (err) {
      console.warn("Supabase admin client not available, falling back to public client");
      client = supabase;
    }

    if (!client) {
      return NextResponse.json({ ok: false, error: "Supabase client not configured" }, { status: 500 });
    }

    const { data, error } = await client.storage
      .from(STORAGE_BUCKET)
      .upload(uniqueFileName, file, {
        cacheControl: "3600",
        upsert: false,
        contentType: file?.type || "image/jpeg",
      });

    if (error) {
      console.error("Error uploading image:", error);
      return NextResponse.json({ ok: false, error: error.message }, { status: 500 });
    }

    const { data: publicData } = client.storage
      .from(STORAGE_BUCKET)
      .getPublicUrl(uniqueFileName);

    return NextResponse.json({ ok: true, path: data.path, url: publicData.publicUrl });
  } catch (err) {
    console.error("Media upload error:", err);
    return NextResponse.json({ ok: false, error: "Internal Server Error" }, { status: 500 });
  }
}