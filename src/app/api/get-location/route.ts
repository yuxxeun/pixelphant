import { type NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const ip = searchParams.get("ip");

    if (!ip) {
      return NextResponse.json(
        { error: "IP address is required" },
        { status: 400 },
      );
    }

    // Skip localhost/private IPs
    if (
      ip === "127.0.0.1" ||
      ip === "::1" ||
      ip.startsWith("192.168.") ||
      ip.startsWith("10.") ||
      ip.startsWith("172.")
    ) {
      return NextResponse.json({
        country: "Unknown",
        countryCode: "XX",
        region: "Local Network",
        regionCode: "LOCAL",
        city: "Localhost",
        latitude: 0,
        longitude: 0,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        isp: "Local Network",
        org: "Private Network",
        as: "Private",
      });
    }

    try {
      // Using HTTPS and ip-api.com with more detailed fields
      const response = await fetch(
        `https://ip-api.com/json/${ip}?fields=status,message,country,countryCode,region,regionName,city,lat,lon,timezone,isp,org,as`,
        {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; LocationDetector/1.0)",
          },
        },
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const text = await response.text();
      let data;

      try {
        data = JSON.parse(text);
      } catch {
        console.error("Failed to parse JSON:", text);
        throw new Error("Invalid response format from geolocation service");
      }

      if (data.status === "fail") {
        throw new Error(data.message || "Failed to get location data");
      }

      return NextResponse.json({
        country: data.country || "Unknown",
        countryCode: data.countryCode || "XX",
        region: data.regionName || "Unknown",
        regionCode: data.region || "XX",
        city: data.city || "Unknown",
        latitude: data.lat || 0,
        longitude: data.lon || 0,
        timezone: data.timezone || "UTC",
        isp: data.isp || "Unknown",
        org: data.org || "Unknown",
        as: data.as || "Unknown",
      });
    } catch (apiError) {
      console.error("Primary API failed, trying fallback:", apiError);

      // Fallback to a different service
      try {
        const fallbackResponse = await fetch(`https://ipapi.co/${ip}/json/`, {
          headers: {
            "User-Agent": "Mozilla/5.0 (compatible; LocationDetector/1.0)",
          },
        });

        if (!fallbackResponse.ok) {
          throw new Error(
            `Fallback API error! status: ${fallbackResponse.status}`,
          );
        }

        const fallbackText = await fallbackResponse.text();
        const fallbackData = JSON.parse(fallbackText);

        if (fallbackData.error) {
          throw new Error(fallbackData.reason || "Fallback API error");
        }

        return NextResponse.json({
          country: fallbackData.country_name || "Unknown",
          countryCode: fallbackData.country_code || "XX",
          region: fallbackData.region || "Unknown",
          regionCode: fallbackData.region_code || "XX",
          city: fallbackData.city || "Unknown",
          latitude: fallbackData.latitude || 0,
          longitude: fallbackData.longitude || 0,
          timezone: fallbackData.timezone || "UTC",
          isp: fallbackData.org || "Unknown",
          org: fallbackData.org || "Unknown",
          as: fallbackData.asn || "Unknown",
        });
      } catch (fallbackError) {
        console.error("Fallback API also failed:", fallbackError);
        throw new Error("All geolocation services failed");
      }
    }
  } catch (error) {
    console.error("Error getting location:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error
            ? error.message
            : "Failed to get location data",
      },
      { status: 500 },
    );
  }
}
