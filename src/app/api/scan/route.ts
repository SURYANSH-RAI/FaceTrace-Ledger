import { NextRequest, NextResponse } from "next/server";
import { analyzeFaceBiometrics } from "@/lib/faceDetection";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { imageBase64, fileName } = body;

    if (!imageBase64) {
      return NextResponse.json(
        { error: "Image data (base64) is required" },
        { status: 400 }
      );
    }

    const scanResult = analyzeFaceBiometrics(imageBase64, fileName);

    return NextResponse.json({
      success: true,
      data: scanResult,
    });
  } catch (error: any) {
    console.error("Error during face scan:", error);
    return NextResponse.json(
      { error: error.message || "Failed to process face scan" },
      { status: 500 }
    );
  }
}
