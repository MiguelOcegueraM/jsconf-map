import type { Metadata } from "next";
import { VenueMap } from "@/components/map/venue-map";

export const metadata: Metadata = {
  title: "Mapa del venue",
  description:
    "Plano interactivo de Jardín Americana: Stage A, Stage B, Taller A, Taller B, registro y cowork.",
};

export default function MapPage() {
  return <VenueMap />;
}
