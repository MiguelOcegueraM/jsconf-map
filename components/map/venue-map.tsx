"use client";

import { useCallback, useEffect, useRef, useState } from "react";
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
import { PageHero } from "@/components/shell/page-hero";
import { useI18n } from "@/lib/i18n/client";
import { InstallGuide } from "./install-guide";
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
  const { t, locale } = useI18n();
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

  // `/?zona=stage-b` (el "Cómo llegar" de la agenda) abre directo esa zona.
  useEffect(() => {
    const id = new URLSearchParams(window.location.search).get("zona");
    const zone = id ? getZone(id) : undefined;
    if (!zone) return;
    // Un frame para que el TransformWrapper ya tenga medidas.
    const raf = requestAnimationFrame(() => jumpTo(zone));
    return () => cancelAnimationFrame(raf);
  }, [jumpTo]);

  return (
    <div className="flex flex-col">
      <PageHero title={t.map.title}>
        <strong className="font-bold">{t.map.venue}</strong> · {t.map.intro}
      </PageHero>

      {/* Accesos rápidos a los seis puntos que sí o sí vas a buscar */}
      <div className="flex gap-2 overflow-x-auto bg-white px-4 py-3 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
        {KEY_ZONES.map((z) => (
          <button
            key={z.id}
            type="button"
            onClick={() => jumpTo(z)}
            className={cn(
              "min-h-9 shrink-0 rounded-full border-2 border-js-indigo-900 px-3 text-[13px] font-bold whitespace-nowrap",
              "transition-transform active:scale-95",
              "focus-visible:outline-[3px] focus-visible:outline-offset-1 focus-visible:outline-js-yellow-500",
              ZONE_STYLES[z.kind].chip,
            )}
          >
            {z.name[locale]}
          </button>
        ))}
      </div>

      <div className="relative border-y-[3px] border-js-indigo-900 bg-js-haze">
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
      <InstallGuide />

      <ZoneSheet
        zone={selected}
        open={open}
        onOpenChange={setOpen}
        onJump={(id) => {
          const z = getZone(id);
          if (!z) return;
          // El panel tapa media pantalla: se baja para dejar ver la zona,
          // que queda centrada y marcada con su contorno punteado.
          setOpen(false);
          focus(z);
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
  const { t } = useI18n();
  const btn =
    "size-10 rounded-full border-2 border-js-indigo-900 bg-white text-js-indigo-900 shadow-[2px_2px_0_0_#101452] hover:bg-js-haze";

  return (
    <div className="absolute right-3 bottom-3 flex flex-col gap-2">
      <Dialog>
        <DialogTrigger
          render={<Button size="icon" variant="ghost" className={btn} />}
          aria-label={t.map.originalPlan}
        >
          <Layers className="size-4" />
        </DialogTrigger>
        <DialogContent className="max-h-[92dvh] gap-3 overflow-auto p-4 sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="font-heading">{t.map.originalPlanTitle}</DialogTitle>
            <DialogDescription>{t.map.originalPlanBody}</DialogDescription>
          </DialogHeader>
          <Image
            src="/plano-original.png"
            alt={t.map.originalPlanAlt}
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
        aria-label={t.map.zoomIn}
        onClick={() => apiRef.current?.zoomIn(0.5)}
      >
        <Plus className="size-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className={btn}
        aria-label={t.map.zoomOut}
        onClick={() => apiRef.current?.zoomOut(0.5)}
      >
        <Minus className="size-4" />
      </Button>
      <Button
        size="icon"
        variant="ghost"
        className={btn}
        aria-label={t.map.reset}
        onClick={() => apiRef.current?.resetTransform(300)}
      >
        <Maximize2 className="size-4" />
      </Button>
    </div>
  );
}

const LEGEND = ["stage", "workshop", "service", "sponsor", "entrance"] as const;

function MapLegend() {
  const { t } = useI18n();
  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 px-4 py-3">
      {LEGEND.map((kind) => (
        <span key={kind} className="flex items-center gap-1.5 text-xs font-medium text-js-indigo-900">
          <span
            className="size-3.5 rounded border-2 border-js-indigo-900"
            style={{ backgroundColor: ZONE_STYLES[kind].fill }}
            aria-hidden
          />
          {t.map.legend[kind]}
        </span>
      ))}
    </div>
  );
}
