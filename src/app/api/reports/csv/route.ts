import { NextRequest, NextResponse } from "next/server";
import { createServerClient } from "@/lib/supabase/server";
import { generateCSV } from "@/lib/reports/csv-export";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("start") || "";
  const endDate = searchParams.get("end") || "";

  const supabase = await createServerClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch receipts
  let query = (supabase)
    .from("receipts")
    .select("*")
    .eq("user_id", user.id)
    .eq("status", "processed");

  if (startDate) query = query.gte("created_at", startDate);
  if (endDate) query = query.lte("created_at", endDate);

  const { data: receipts } = await (query as any).order("created_at", {
    ascending: true,
  });

  const csv = generateCSV(receipts || []);

  const filename = `expense-report-${startDate || "all"}-${endDate || "all"}-${Date.now()}.csv`;

  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}
