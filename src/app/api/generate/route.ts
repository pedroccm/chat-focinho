import { NextRequest, NextResponse } from "next/server";
import { generatePetPortrait } from "@/lib/gemini";
import { applyWatermark } from "@/lib/watermark";
import { supabaseAdmin } from "@/lib/supabase";
import { v4 as uuidv4 } from "uuid";

export const maxDuration = 60;

export async function POST(request: NextRequest) {
  try {
    let storagePath: string;
    let style: string;

    const contentType = request.headers.get("content-type") || "";

    if (contentType.includes("application/json")) {
      // JSON body: { storagePath, style }
      const body = await request.json();
      storagePath = body.storagePath;
      style = body.style || "renaissance";
    } else {
      // FormData: image file + style
      const formData = await request.formData();
      const file = formData.get("image") as File | null;
      style = (formData.get("style") as string) || "renaissance";

      if (!file) {
        return NextResponse.json({ error: "No image provided" }, { status: 400 });
      }

      const validTypes = ["image/jpeg", "image/png", "image/webp"];
      if (!validTypes.includes(file.type)) {
        return NextResponse.json({ error: "Formato inválido. Use JPG, PNG ou WebP." }, { status: 400 });
      }

      if (file.size > 10 * 1024 * 1024) {
        return NextResponse.json({ error: "Imagem muito grande. Máximo 10MB." }, { status: 400 });
      }

      const fileId = uuidv4();
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      const ext = file.type === "image/png" ? "png" : "jpg";

      storagePath = `${fileId}/original.${ext}`;
      const { error: uploadError } = await supabaseAdmin.storage
        .from("originals")
        .upload(storagePath, buffer, {
          contentType: file.type,
          upsert: false,
        });

      if (uploadError) {
        console.error("Upload error:", uploadError);
        throw new Error("Erro ao salvar imagem original");
      }
    }

    if (!storagePath) {
      return NextResponse.json({ error: "storagePath is required" }, { status: 400 });
    }

    // Download image from Supabase Storage
    const { data: fileData, error: downloadError } = await supabaseAdmin.storage
      .from("originals")
      .download(storagePath);

    if (downloadError || !fileData) {
      console.error("Download error:", downloadError);
      return NextResponse.json({ error: "Imagem não encontrada" }, { status: 404 });
    }

    const arrayBuffer = await fileData.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    const base64 = buffer.toString("base64");
    const mimeType = storagePath.endsWith(".png") ? "image/png" : "image/jpeg";

    const generationId = uuidv4();

    // Create generation record (status: generating)
    const { error: insertError } = await supabaseAdmin
      .from("pets_generations")
      .insert({
        id: generationId,
        style,
        original_image_path: storagePath,
        status: "generating",
      });

    if (insertError) {
      console.error("Insert error:", insertError);
      throw new Error("Erro ao criar registro");
    }

    // Call AIML API to generate portrait
    let generatedBase64: string;
    try {
      generatedBase64 = await generatePetPortrait(base64, mimeType, style);
    } catch (genError) {
      await supabaseAdmin
        .from("pets_generations")
        .update({ status: "failed" })
        .eq("id", generationId);
      throw genError;
    }

    const generatedBuffer = Buffer.from(generatedBase64, "base64");

    // Apply watermark
    const watermarkedBuffer = await applyWatermark(generatedBuffer);

    // Upload clean version (private)
    const generatedPath = `${generationId}/clean.jpg`;
    await supabaseAdmin.storage
      .from("generated")
      .upload(generatedPath, generatedBuffer, {
        contentType: "image/jpeg",
        upsert: false,
      });

    // Upload watermarked version (public)
    const watermarkedPath = `${generationId}/preview.jpg`;
    await supabaseAdmin.storage
      .from("watermarked")
      .upload(watermarkedPath, watermarkedBuffer, {
        contentType: "image/jpeg",
        upsert: false,
      });

    // Get public URL for watermarked image
    const { data: publicUrlData } = supabaseAdmin.storage
      .from("watermarked")
      .getPublicUrl(watermarkedPath);

    // Update generation record (status: completed)
    await supabaseAdmin
      .from("pets_generations")
      .update({
        status: "completed",
        generated_image_path: generatedPath,
        watermarked_image_path: watermarkedPath,
      })
      .eq("id", generationId);

    return NextResponse.json({
      success: true,
      generationId,
      watermarkedImage: publicUrlData.publicUrl,
    });
  } catch (error) {
    console.error("Generation error:", error);
    const message = error instanceof Error ? error.message : "Erro desconhecido";
    return NextResponse.json({ error: `Falha ao gerar retrato: ${message}` }, { status: 500 });
  }
}
