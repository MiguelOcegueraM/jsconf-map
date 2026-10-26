"use client";

import Link from "next/link";
import { ArrowUpRight, Footprints, Info, MoveUp } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { ZONE_STYLES, ZONE_TO_STAGE, type VenueZone } from "@/lib/venue";
import { cn } from "@/lib/utils";

type Props = {
  zone: VenueZone | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onJump: (zoneId: string) => void;
};

export function ZoneSheet({ zone, open, onOpenChange, onJump }: Props) {
  const stageId = zone ? ZONE_TO_STAGE[zone.id] : undefined;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="bottom"
        className="safe-bottom max-h-[80dvh] gap-0 overflow-y-auto rounded-t-3xl px-5 pb-6"
      >
        {zone && (
          <>
            <SheetHeader className="gap-2 px-0">
              <span
                className={cn(
                  "w-fit rounded-full border-2 border-js-indigo-900 px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase",
                  ZONE_STYLES[zone.kind].chip,
                )}
              >
                {KIND_LABELS[zone.kind]}
              </span>
              <SheetTitle className="font-display typography-shadow text-3xl text-js-indigo-900">
                {zone.name}
              </SheetTitle>
              <SheetDescription className="text-[15px] text-js-indigo-900">
                {zone.description}
              </SheetDescription>
            </SheetHeader>

            {zone.level === "planta-alta" && (
              <p className="radius-card mt-4 flex items-start gap-2 border-[3px] border-js-red-700 bg-js-red-50 p-3 text-sm font-semibold text-js-red-800">
                <MoveUp className="mt-0.5 size-4 shrink-0" aria-hidden />
                Está en planta alta. Súbete por las escaleras marcadas en rojo en el
                mapa.
              </p>
            )}

            {zone.howTo && (
              <p className="radius-card mt-3 flex items-start gap-2 bg-js-haze p-3 text-sm text-js-indigo-900">
                <Footprints className="mt-0.5 size-4 shrink-0 text-js-indigo-500" aria-hidden />
                {zone.howTo}
              </p>
            )}

            <div className="mt-5 flex flex-col gap-2">
              {stageId && (
                <Link
                  href={`/agenda?escenario=${stageId}`}
                  className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-[3px] border-js-indigo-900 bg-js-indigo-500 px-5 text-[15px] font-bold text-white shadow-[4px_4px_0_0_#f3ba20] transition-colors hover:bg-js-indigo-700"
                >
                  Ver la agenda de {zone.name}
                  <ArrowUpRight className="size-4" />
                </Link>
              )}
              <button
                type="button"
                className="inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full border-[3px] border-js-indigo-900 bg-white px-5 text-[15px] font-bold text-js-indigo-900"
                onClick={() => onJump(zone.id)}
              >
                <Info className="size-4" />
                Centrar en el mapa
              </button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

const KIND_LABELS: Record<VenueZone["kind"], string> = {
  stage: "Escenario",
  workshop: "Taller",
  service: "Servicio",
  sponsor: "Sponsors",
  food: "Comida",
  entrance: "Acceso",
  restroom: "Baños",
};
