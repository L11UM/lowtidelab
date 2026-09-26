import { NextResponse } from "next/server";
import { fetchCoastalSnapshot } from "@/lib/coastal";

export const revalidate = 300;

export async function GET() {
  try {
    return NextResponse.json(await fetchCoastalSnapshot());
  } catch {
    return NextResponse.json(
      {
        updatedAt: new Date().toISOString(),
        storms: [],
        alerts: [],
        stormFeedAvailable: false,
        alertFeedAvailable: false,
        sources: [
          { label: "National Hurricane Center", url: "https://www.nhc.noaa.gov/" },
          { label: "National Weather Service alerts", url: "https://www.weather.gov/alerts" },
        ],
        degraded: true,
      },
      { status: 200 }
    );
  }
}
