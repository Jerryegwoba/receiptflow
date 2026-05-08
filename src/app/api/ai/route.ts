import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { getAnthropicClient } from "@/lib/ai/client";
import { extractedReceiptSchema } from "@/lib/validators/receipt";

export async function POST(request: NextRequest) {
  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { receiptId, imageUrl } = body as {
    receiptId: string;
    imageUrl: string;
  };

  if (!receiptId || !imageUrl) {
    return NextResponse.json({ error: "Missing receiptId or imageUrl" }, { status: 400 });
  }

  // Verify ownership
  const { data: receipt } = await (supabase
    .from("receipts") as any)
    .select("user_id, status")
    .eq("id", receiptId)
    .single();

  if (!receipt || receipt.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  try {
    const anthropic = getAnthropicClient();

    // Fetch the image
    const imageResponse = await fetch(imageUrl);
    const imageBuffer = await imageResponse.arrayBuffer();
    const base64Image = Buffer.from(imageBuffer).toString("base64");
    const mediaType = imageResponse.headers.get("content-type") || "image/jpeg";

    // Call Claude for receipt extraction
    const message = await anthropic.messages.create({
      model: "claude-3-5-haiku-20241022",
      max_tokens: 1024,
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: mediaType as any,
                data: base64Image,
              },
            },
            {
              type: "text",
              text: `Extract the following information from this receipt image. Return ONLY a valid JSON object with these fields:
- merchant: (string) the merchant/store name
- date: (string) the transaction date in ISO format (YYYY-MM-DD)
- amount: (number) the total amount as a number (no currency symbols)
- currency: (string) the 3-letter currency code (e.g., USD, EUR, GBP)
- category: (string) one of: Software & Tools, Marketing, Office Supplies, Travel & Transport, Meals & Entertainment, Professional Services, Equipment, Utilities, Rent, Miscellaneous
- confidence: (number) your confidence score from 0-100
- notes: (string, optional) any unusual observations

If you cannot read the receipt clearly, set confidence below 50 and note the issue in notes.`,
            },
          ],
        },
      ],
    });

    // Parse the response
    const contentBlock = message.content[0];
    if (contentBlock.type !== "text") {
      throw new Error("Unexpected response type from AI");
    }

    const extractedText = contentBlock.text;
    const jsonMatch = extractedText.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No valid JSON found in AI response");
    }

    const parsed = JSON.parse(jsonMatch[0]);
    const validated = extractedReceiptSchema.parse(parsed);

    // Update receipt with extracted data
    await (supabase
      .from("receipts") as any)
      .update({
        extracted_data: validated as any,
        status: "processed",
      })
      .eq("id", receiptId);

    return NextResponse.json({ success: true });
  } catch (error) {
    // Update receipt status to failed
    await (supabase
      .from("receipts") as any)
      .update({ status: "failed" })
      .eq("id", receiptId);

    console.error("AI extraction failed:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
