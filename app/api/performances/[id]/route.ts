import { NextRequest, NextResponse } from "next/server";
import { fetchPerformanceDetail } from "@/lib/kopis";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const detail = await fetchPerformanceDetail(id);
    return NextResponse.json(detail);
  } catch (error) {
    console.error("Detail API error:", error);
    return NextResponse.json(
      { error: "Failed to fetch detail" },
      { status: 500 }
    );
  }
}
