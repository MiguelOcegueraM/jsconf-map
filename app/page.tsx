import type { Metadata } from "next";
import { VenueMap } from "@/components/map/venue-map";
import { getDictionary } from "@/lib/i18n/server";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getDictionary();
  return { title: t.meta.mapTitle, description: t.meta.mapDescription };
}

export default function MapPage() {
  return <VenueMap />;
}
