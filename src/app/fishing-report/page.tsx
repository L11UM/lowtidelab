import type { Metadata } from "next";
import { FishingReport } from "@/components/fishing-report";

export const metadata: Metadata = {
  title: "Northern Arizona Fishing Report",
  description: "Local weather, target species, and trip notes for Northern Arizona fishing waters.",
};

export default function FishingReportPage() {
  return <FishingReport />;
}
