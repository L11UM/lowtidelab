import { pierCams } from "@/lib/piers";
import { tideStations } from "@/lib/tides";

export type CoastalSpot = {
  id: string;
  name: string;
  area: string;
  lat: number;
  lon: number;
  tideStationId: string;
  cameraId: string;
  offshoreFromDegrees: number;
};

export const coastalSpots: CoastalSpot[] = [
  {
    id: "redondo",
    name: "Redondo Beach Pier",
    area: "Redondo Beach",
    lat: 33.8397,
    lon: -118.3927,
    tideStationId: "9410660",
    cameraId: "redondo",
    offshoreFromDegrees: 70,
  },
  {
    id: "hermosa",
    name: "Hermosa Beach Pier",
    area: "Hermosa Beach",
    lat: 33.8622,
    lon: -118.3995,
    tideStationId: "9410660",
    cameraId: "redondo",
    offshoreFromDegrees: 70,
  },
  {
    id: "manhattan",
    name: "Manhattan Beach Pier",
    area: "Manhattan Beach",
    lat: 33.8842,
    lon: -118.4109,
    tideStationId: "9410840",
    cameraId: "redondo",
    offshoreFromDegrees: 70,
  },
  {
    id: "huntington",
    name: "Huntington Beach Pier",
    area: "Huntington Beach",
    lat: 33.6553,
    lon: -118.0048,
    tideStationId: "9410580",
    cameraId: "huntington",
    offshoreFromDegrees: 60,
  },
];

export const defaultCoastalSpot = coastalSpots.find((spot) => spot.id === "redondo")!;

export function getSpotTideStation(spot: CoastalSpot) {
  return tideStations.find((station) => station.id === spot.tideStationId) ?? tideStations[1];
}

export function getSpotCamera(spot: CoastalSpot) {
  return pierCams.find((cam) => cam.id === spot.cameraId);
}

export function closestCoastalSpot(latitude: number, longitude: number) {
  return coastalSpots.reduce((closest, spot) => {
    const distance = distanceKm(latitude, longitude, spot.lat, spot.lon);
    return distance < closest.distance ? { spot, distance } : closest;
  }, { spot: defaultCoastalSpot, distance: Infinity });
}

function distanceKm(lat1: number, lon1: number, lat2: number, lon2: number) {
  const radians = (degrees: number) => degrees * Math.PI / 180;
  const dLat = radians(lat2 - lat1);
  const dLon = radians(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(radians(lat1)) * Math.cos(radians(lat2)) * Math.sin(dLon / 2) ** 2;
  return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}
