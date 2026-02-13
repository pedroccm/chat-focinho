import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get("image") as File | null;

    if (!file) {
      return NextResponse.json({ error: "No image provided" }, { status: 400 });
    }

    const validTypes = ["image/jpeg", "image/png", "image/webp"];
    if (!validTypes.includes(file.type)) {
      return NextResponse.json(
        { error: "Formato inválido. Use JPG, PNG ou WebP." },
        { status: 400 }
      );
    }

    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: "Imagem muito grande. Máximo 10MB." },
        { status: 400 }
      );
    }

    const fileId = uuidv4();
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const ext = file.type === "image/png" ? "png" : file.type === "image/webp" ? "webp" : "jpg";

    const storagePath = `${fileId}/original.${ext}`;
    const { error: uploadError } = await supabaseAdmin.storage
      .from("originals")
      .upload(storagePath, buffer, {
        contentType: file.type,
        upsert: false,
      });

    if (uploadError) {
      console.error("Upload error:", uploadError);
      throw new Error("Erro ao salvar imagem");
    }

    // Get public URL for preview
    const { data: publicUrlData } = supabaseAdmin.storage
      .from("originals")
      .getPublicUrl(storagePath);

    return NextResponse.json({
      success: true,
      storagePath,
      publicUrl: publicUrlData.publicUrl,
      mimeType: file.type,
    });
  } catch (error) {
    console.error("Upload error:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
