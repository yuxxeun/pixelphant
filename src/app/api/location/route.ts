import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const ip = forwarded?.split(",")[0]?.trim() || realIp || "unknown";

    const country = request.headers.get("x-vercel-ip-country") || "unknown";
    const region =
      request.headers.get("x-vercel-ip-country-region") || "unknown";
    const city = request.headers.get("x-vercel-ip-city") || "unknown";

    return NextResponse.json({
      ip,
      country,
      region,
      city,
      source: "vercel-headers",
    });
  } catch (error) {
    console.error("Error getting location:", error);
    return NextResponse.json(
      { error: "Failed to get location data" },
      { status: 500 },
    );
  }
}
