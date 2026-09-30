import Papa from "papaparse";
import type { FishingSpot } from "@/lib/fishing-spots";

const azgfdSchedules = [
  {
    season: "Spring / Summer 2026",
    url: "https://docs.google.com/spreadsheets/d/1S5wsDfGzEInV64UKjUPzexAe2KOO1KocfB4dJH7oVrs/export?format=csv",
  },
  {
    season: "Fall / Winter 2026–27",
    url: "https://docs.google.com/spreadsheets/d/1PZuTV-zi5vMdxaMSnGx6c-QxeQQm-6DRQJJPKAZDjZM/export?format=csv",
  },
];

export type StockingWeek = {
  weekOf: string;
  season: string;
};

export type StockingReport = {
  weeks: Record<string, StockingWeek[]>;
  checkedAt: string;
  available: boolean;
};

function normalizeWaterName(value: string) {
  return value.toUpperCase().replace(/[^A-Z0-9]+/g, " ").trim().replace(/\s+/g, " ");
}

function getMonth(value: string) {
  const month = value.trim().toUpperCase();
  const names = ["JANUARY", "FEBRUARY", "MARCH", "APRIL", "MAY", "JUNE", "JULY", "AUGUST", "SEPTEMBER", "OCTOBER", "NOVEMBER", "DECEMBER"];
  const index = names.indexOf(month);
  return index < 0 ? null : index + 1;
}

function getScheduleDate(rows: string[][]) {
  for (const row of rows) {
    const dateLabelIndex = row.findIndex((cell) => cell.trim().toLowerCase() === "date:");
    if (dateLabelIndex < 0) continue;
    const rawDate = row.slice(dateLabelIndex + 1).find((cell) => cell.trim());
    if (!rawDate) continue;
    const match = rawDate.trim().match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
    if (match) return new Date(Number(match[3]), Number(match[1]) - 1, Number(match[2]));
  }
  return new Date();
}

function readSheet(text: string, season: string) {
  const rows = Papa.parse<string[]>(text, { skipEmptyLines: false }).data;
  const headerIndex = rows.findIndex((row) => normalizeWaterName(row[0] ?? "") === "STOCKED WATERS BY FISHING AREA");
  if (headerIndex < 1) return new Map<string, StockingWeek[]>();

  const monthRow = rows[headerIndex - 1];
  const dayRow = rows[headerIndex];
  const referenceDate = getScheduleDate(rows);
  const dateByColumn = new Map<number, string>();
  let month = 0;
  let year = referenceDate.getFullYear();
  let previousMonth = 0;

  for (let column = 1; column < dayRow.length; column += 1) {
    const columnMonth = getMonth(monthRow[column] ?? "");
    if (columnMonth) {
      if (previousMonth > 0 && columnMonth < previousMonth) year += 1;
      month = columnMonth;
      previousMonth = columnMonth;
    }

    const day = Number(dayRow[column]);
    if (month && Number.isInteger(day) && day > 0 && day <= 31) {
      dateByColumn.set(column, `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`);
    }
  }

  const waterWeeks = new Map<string, StockingWeek[]>();
  for (const row of rows.slice(headerIndex + 1)) {
    const waterName = normalizeWaterName(row[0] ?? "");
    if (!waterName) continue;

    for (let column = 1; column < row.length; column += 1) {
      if ((row[column] ?? "").trim().toUpperCase() !== "X") continue;
      const weekOf = dateByColumn.get(column);
      if (!weekOf) continue;
      const weeks = waterWeeks.get(waterName) ?? [];
      weeks.push({ weekOf, season });
      waterWeeks.set(waterName, weeks);
    }
  }

  return waterWeeks;
}

function arizonaDate(now: Date) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Phoenix",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(now);
  const part = (type: string) => parts.find((item) => item.type === type)?.value ?? "00";
  return `${part("year")}-${part("month")}-${part("day")}`;
}

export function matchingStockingWeek(spot: FishingSpot, report: StockingReport, now = new Date()) {
  const names = [spot.name, ...(spot.stockingNames ?? [])].map(normalizeWaterName);
  return names
    .flatMap((name) => report.weeks[name] ?? [])
    .filter((week) => week.weekOf <= arizonaDate(now))
    .sort((left, right) => right.weekOf.localeCompare(left.weekOf))[0] ?? null;
}

export async function fetchStockingReport(signal?: AbortSignal): Promise<StockingReport> {
  const results = await Promise.allSettled(azgfdSchedules.map(async ({ season, url }) => {
    const response = await fetch(url, { signal });
    if (!response.ok) throw new Error(`AZGFD stocking schedule returned ${response.status}`);
    return readSheet(await response.text(), season);
  }));

  const weeks: Record<string, StockingWeek[]> = {};
  let available = false;
  for (const result of results) {
    if (result.status !== "fulfilled") continue;
    available = true;
    for (const [waterName, candidates] of result.value) {
      const merged = new Map((weeks[waterName] ?? []).map((week) => [`${week.season}:${week.weekOf}`, week]));
      for (const week of candidates) merged.set(`${week.season}:${week.weekOf}`, week);
      weeks[waterName] = [...merged.values()].sort((left, right) => left.weekOf.localeCompare(right.weekOf));
    }
  }

  return { weeks, checkedAt: new Date().toISOString(), available };
}
