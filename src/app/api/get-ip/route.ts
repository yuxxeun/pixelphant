import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    // Try to get IP from various headers
    const forwarded = request.headers.get("x-forwarded-for");
    const realIp = request.headers.get("x-real-ip");
    const cfConnectingIp = request.headers.get("cf-connecting-ip");
    const xClientIp = request.headers.get("x-client-ip");

    let ip =
      forwarded?.split(",")[0]?.trim() ||
      realIp ||
      cfConnectingIp ||
      xClientIp ||
      "unknown";

    // Clean up the IP address
    if (ip && ip !== "unknown") {
      // Remove port if present
      ip = ip.split(":")[0];
    }

    // If we can't get IP from headers or it's localhost, try external service
    if (ip === "unknown" || ip === "::1" || ip === "127.0.0.1" || !ip) {
      try {
        const response = await fetch("https://api.ipify.org?format=json", {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; LocationDetector/1.0)",
          },
        });

        if (response.ok) {
          const data = await response.json();
          ip = data.ip;
        }
      } catch (error) {
        console.error("Failed to get IP from external service:", error);
        // If all else fails, use a placeholder
        ip = "8.8.8.8"; // Google's DNS as fallback for demo
      }
    }

    return NextResponse.json({ ip });
  } catch (error) {
    console.error("Error getting IP:", error);
    return NextResponse.json(
      {
        error: "Failed to get IP address",
        ip: "8.8.8.8", // Fallback IP for demo
      },
      { status: 200 },
    ); // Return 200 with fallback instead of error
  }
}
