import type { CoastalSpot } from "@/lib/coastal-spots";

export type MarineConditions = {
  windKnots: number | null;
  windDirection: number | null;
  waveHeightMeters: number | null;
  waveDirection: number | null;
  wavePeriodSeconds: number | null;
  waterTemperatureC: number | null;
  updatedAt: string;
};

type OpenMeteoCurrent = {
  time?: string;
  wind_speed_10m?: number | null;
  wind_direction_10m?: number | null;
  wave_height?: number | null;
  wave_direction?: number | null;
  wave_period?: number | null;
  sea_surface_temperature?: number | null;
};

function finite(value: unknown) {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

export async function fetchMarineConditions(spot: CoastalSpot): Promise<MarineConditions> {
  const common = new URLSearchParams({
    latitude: String(spot.lat),
    longitude: String(spot.lon),
    timezone: "auto",
  });
  const weatherParams = new URLSearchParams(common);
  weatherParams.set("current", "wind_speed_10m,wind_direction_10m");
  weatherParams.set("wind_speed_unit", "kn");

  const marineParams = new URLSearchParams(common);
  marineParams.set("current", "wave_height,wave_direction,wave_period,sea_surface_temperature");

  const [weatherResponse, marineResponse] = await Promise.all([
    fetch(`https://api.open-meteo.com/v1/forecast?${weatherParams}`, { signal: AbortSignal.timeout(10000) }),
    fetch(`https://marine-api.open-meteo.com/v1/marine?${marineParams}`, { signal: AbortSignal.timeout(10000) }),
  ]);
  if (!weatherResponse.ok || !marineResponse.ok) throw new Error("Marine conditions are unavailable");

  const [weather, marine] = await Promise.all([
    weatherResponse.json() as Promise<{ current?: OpenMeteoCurrent }>,
    marineResponse.json() as Promise<{ current?: OpenMeteoCurrent }>,
  ]);
  const wind = weather.current;
  const sea = marine.current;
  if (!wind || !sea) throw new Error("Marine conditions are unavailable");

  return {
    windKnots: finite(wind.wind_speed_10m),
    windDirection: finite(wind.wind_direction_10m),
    waveHeightMeters: finite(sea.wave_height),
    waveDirection: finite(sea.wave_direction),
    wavePeriodSeconds: finite(sea.wave_period),
    waterTemperatureC: finite(sea.sea_surface_temperature),
    updatedAt: sea.time ?? wind.time ?? "",
  };
}
