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
import { Button } from "@/components/ui/button";
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
                  "w-fit rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase",
                  ZONE_STYLES[zone.kind].chip,
                )}
              >
                {KIND_LABELS[zone.kind]}
              </span>
              <SheetTitle className="font-heading text-2xl text-js-plum">
                {zone.name}
              </SheetTitle>
              <SheetDescription className="text-sm text-neutral-600">
                {zone.description}
              </SheetDescription>
            </SheetHeader>

            {zone.level === "planta-alta" && (
              <p className="mt-4 flex items-start gap-2 rounded-xl border border-js-red-200 bg-js-red-50 p-3 text-sm font-medium text-js-red-800">
                <MoveUp className="mt-0.5 size-4 shrink-0" aria-hidden />
                Está en planta alta. Súbete por las escaleras marcadas en rojo en el
                mapa.
              </p>
            )}

            {zone.howTo && (
              <p className="mt-3 flex items-start gap-2 rounded-xl bg-neutral-100 p-3 text-sm text-neutral-700">
                <Footprints className="mt-0.5 size-4 shrink-0 text-neutral-500" aria-hidden />
                {zone.howTo}
              </p>
            )}

            <div className="mt-5 flex flex-col gap-2">
              {stageId && (
                <Button
                  className="min-h-11 w-full"
                  nativeButton={false}
                  render={<Link href={`/agenda?escenario=${stageId}`} />}
                >
                  Ver la agenda de este escenario
                  <ArrowUpRight className="size-4" />
                </Button>
              )}
              <Button
                variant="outline"
                className="min-h-11 w-full"
                onClick={() => onJump(zone.id)}
              >
                <Info className="size-4" />
                Centrar en el mapa
              </Button>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

const KIND_LABELS: Record<VenueZone["kind"], string> = {
  stage: "Escenario",
  workshop: "Workshop",
  service: "Servicio",
  sponsor: "Sponsors",
  food: "Comida",
  entrance: "Acceso",
  restroom: "Baños",
};
