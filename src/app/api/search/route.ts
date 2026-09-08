import { NextRequest, NextResponse } from "next/server";
import { performOsintSearch } from "@/lib/osintSearch";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { faceHash, imagePreview, queryKeyword } = body;

    if (!faceHash) {
      return NextResponse.json(
        { error: "faceHash is required to initiate OSINT web search" },
        { status: 400 }
      );
    }

    const results = await performOsintSearch(faceHash, imagePreview, queryKeyword);

    return NextResponse.json({
      success: true,
      data: results,
      meta: {
        totalFound: results.length,
        timestamp: new Date().toISOString(),
      },
    });
  } catch (error: any) {
    console.error("Error during OSINT search:", error);
    return NextResponse.json(
      { error: error.message || "Failed to execute web / social media search" },
      { status: 500 }
    );
  }
}
