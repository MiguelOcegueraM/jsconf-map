import type { Metadata } from "next";
import { VenueMap } from "@/components/map/venue-map";

export const metadata: Metadata = {
  title: "Mapa del venue",
  description:
    "Plano interactivo de Jardín Americana: Main Stage, ASYNC Stage, salas de workshops, registro y cowork.",
};

export default function MapPage() {
  return <VenueMap />;
}
