const AIML_API_KEY = process.env.AIML_API_KEY;

const STYLE_PROMPTS: Record<string, string> = {
  renaissance:
    "Transform this pet photo into a majestic Renaissance oil painting portrait. The pet should be dressed as a noble aristocrat wearing ornate royal garments with rich velvet and gold embroidery. Seated on a luxurious velvet cushion with gold tassels. Dramatic Rembrandt lighting with a rich dark background. Museum-quality fine art style reminiscent of 16th century Italian masters. Highly detailed fur texture blended seamlessly with the clothing. Warm golden tones.",
  baroque:
    "Transform this pet photo into an opulent Baroque-era portrait painting. The pet should be dressed as a wealthy merchant prince wearing extravagant silk robes with lace collar and jeweled accessories. Dramatic chiaroscuro lighting in the style of Caravaggio. Rich, dark velvet background with a hint of draped curtain. Gilt frame worthy composition. Lavish detail in fabrics and textures.",
  victorian:
    "Transform this pet photo into a distinguished Victorian-era portrait. The pet should be dressed as a proper British aristocrat wearing a fitted waistcoat, cravat, and top hat or bonnet. Seated in an ornate wingback chair. Soft, refined lighting. Muted earth tones with deep greens and burgundy. Prim and proper pose. Style of John Singer Sargent.",
};

export async function generatePetPortrait(
  imageBase64: string,
  mimeType: string,
  style: string
): Promise<string> {
  if (!AIML_API_KEY) {
    throw new Error("AIML_API_KEY is not configured");
  }

  const prompt = STYLE_PROMPTS[style] || STYLE_PROMPTS.renaissance;
  const dataUrl = `data:${mimeType};base64,${imageBase64}`;

  console.log("Calling AIML API with base64 image...");

  const response = await fetch("https://api.aimlapi.com/v1/images/generations", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${AIML_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "google/gemini-2.5-flash-image-edit",
      image_urls: [dataUrl],
      prompt: prompt,
      num_images: 1,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error("AIML API error:", errorText);
    throw new Error(`AIML API error: ${response.status}`);
  }

  const result = await response.json();
  console.log("AIML API response:", JSON.stringify(result, null, 2));

  // Format: { data: [{ url: "..." }] }
  if (result.data?.[0]?.url) {
    const imageResponse = await fetch(result.data[0].url);
    const imageBuffer = await imageResponse.arrayBuffer();
    return Buffer.from(imageBuffer).toString("base64");
  }

  throw new Error("No image generated in response");
}
