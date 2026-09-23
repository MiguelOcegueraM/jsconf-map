"use client";

import { useCallback, useRef, useState } from "react";
import Image from "next/image";
import {
  TransformComponent,
  TransformWrapper,
  type ReactZoomPanPinchRef,
} from "react-zoom-pan-pinch";
import { Layers, Maximize2, Minus, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VenueSvg } from "./venue-svg";
import { ZoneSheet } from "./zone-sheet";
import {
  VENUE_VIEWBOX,
  VENUE_ZONES,
  ZONE_STYLES,
  getZone,
  type VenueZone,
} from "@/lib/venue";
import { cn } from "@/lib/utils";

const KEY_ZONES = VENUE_ZONES.filter((z) => z.key);

export function VenueMap() {
  const [selected, setSelected] = useState<VenueZone | null>(null);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const apiRef = useRef<ReactZoomPanPinchRef>(null);

  const select = useCallback((zone: VenueZone) => {
    setSelected(zone);
    setOpen(true);
  }, []);

  /**
   * Centra una zona. El SVG se dibuja con `preserveAspectRatio` dentro del
   * contenedor, así que primero reconstruimos dónde cayó el viewBox y luego
   * despejamos la traslación que deja el centro de la zona en medio de la
   * pantalla.
   */
  const focus = useCallback((zone: VenueZone, scale = 2.2) => {
    const box = wrapperRef.current?.getBoundingClientRect();
    if (!box) return;
    const { width: W, height: H } = box;
    const base = Math.min(W / VENUE_VIEWBOX.width, H / VENUE_VIEWBOX.height);
    const ox = (W - VENUE_VIEWBOX.width * base) / 2;
    const oy = (H - VENUE_VIEWBOX.height * base) / 2;
    const cx = ox + (zone.x + zone.w / 2) * base;
    const cy = oy + (zone.y + zone.h / 2) * base;
    apiRef.current?.setTransform(W / 2 - scale * cx, H / 2 - scale * cy, scale, 420);
  }, []);

  const jumpTo = useCallback(
    (zone: VenueZone) => {
      focus(zone);
      select(zone);
    },
    [focus, select],
  );

  return (
    <div className="flex flex-col">
      <div className="px-4 pt-4 pb-3">
        <h1 className="font-display text-2xl leading-tight text-js-plum">
          Jardín Americana
        </h1>
        <p className="mt-1 text-sm text-neutral-600">
          Av. Ignacio L. Vallarta 1305, Col. Americana. Toca cualquier zona para ver
          cómo llegar.
        </p>
      </div>

      {/* Accesos rápidos a los seis puntos que sí o sí vas a buscar */}
      <div className="flex gap-2 overflow-x-auto px-4 pb-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {KEY_ZONES.map((z) => (
          <button
            key={z.id}
            type="button"
            onClick={() => jumpTo(z)}
            className={cn(
              "min-h-9 shrink-0 rounded-full px-3 text-xs font-semibold whitespace-nowrap",
              "transition-transform active:scale-95",
              "focus-visible:ring-2 focus-visible:ring-js-indigo-500 focus-visible:outline-none",
              ZONE_STYLES[z.kind].chip,
            )}
          >
            {z.name}
          </button>
        ))}
      </div>

      <div className="relative border-y border-neutral-200 bg-neutral-100">
        <div ref={wrapperRef} className="h-[62dvh] max-h-[680px] min-h-[420px] w-full">
          <TransformWrapper
            ref={apiRef}
            minScale={1}
            maxScale={6}
            doubleClick={{ mode: "zoomIn", step: 0.9 }}
            wheel={{ step: 0.12 }}
            panning={{ velocityDisabled: true }}
          >
            <TransformComponent
              wrapperClass="!h-full !w-full"
              contentClass="!h-full !w-full"
            >
              <VenueSvg
                selectedId={selected?.id ?? null}
                onSelect={(z) => {
                  focus(z);
                  select(z);
                }}
              />
            </TransformComponent>
          </TransformWrapper>
        </div>

        <MapControls apiRef={apiRef} />
      </div>

      <MapLegend />

      <ZoneSheet
        zone={selected}
        open={open}
        onOpenChange={setOpen}
        onJump={(id) => {
          const z = getZone(id);
          if (z) jumpTo(z);
        }}
      />
    </div>
  );
}

function MapControls({
  apiRef,
}: {
  apiRef: React.RefObject<ReactZoomPanPinchRef | null>;
}) {
  const btn =
    "size-10 rounded-full bg-white/95 shadow-md border border-neutral-200 text-neutral-700 hover:bg-white";

  return (
    <div className="absolute right-3 bottom-3 flex flex-col gap-2">
      <Dialog>
        <DialogTrigger
          render={<Button size="icon" variant="ghost" className={btn} />}
          aria-label="Ver plano original"
        >
          <Layers className="size-4" />
        </DialogTrigger>
        <DialogContent className="max-h-[92dvh] gap-3 overflow-auto p-4 sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-heading">Plano arquitectónico original</DialogTitle>
            <DialogDescription>
              Planta del venue a escala 1:100, tal cual la entregó producción. La
              flecha roja marca las escaleras al escenario en terraza.
            </DialogDescription>
          </DialogHeader>
          <Image
            src="/plano-original.png"
            alt="Planta arquitectónica de Jardín Americana con la distribución de escenarios"
            width={1400}
            height={1812}
            className="h-auto w-full rounded-lg border border-neutral-200"
          />
        </DialogContent>
      </Dialog>

      <Button
        size="icon"
        variant="ghost"
        className={btn}
        aria-label="Acercar"
        onClick={() => apiRef.current?.zoomIn(0.5)}
      >
        <Plus className="size-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className={btn}
        aria-label="Alejar"
        onClick={() => apiRef.current?.zoomOut(0.5)}
      >
        <Minus className="size-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className={btn}
        aria-label="Ver todo el venue"
        onClick={() => apiRef.current?.resetTransform(300)}
      >
        <Maximize2 className="size-4" />
      </Button>
    </div>
  );
}

const LEGEND = [
  { kind: "stage", label: "Escenarios" },
  { kind: "workshop", label: "Workshops" },
  { kind: "service", label: "Servicios" },
  { kind: "sponsor", label: "Sponsors" },
  { kind: "food", label: "Comida" },
  { kind: "entrance", label: "Accesos" },
] as const;

function MapLegend() {
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
      {LEGEND.map(({ kind, label }) => (
        <span key={kind} className="flex items-center gap-1.5 text-xs text-neutral-600">
          <span
            className="size-3 rounded-[3px]"
            style={{ backgroundColor: ZONE_STYLES[kind].fill }}
            aria-hidden
          />
          {label}
        </span>
      ))}
    </div>
  );
}
