"use client";

import {
  ASYNC_STAIRS,
  VENUE_SURFACES,
  VENUE_VIEWBOX,
  VENUE_ZONES,
  ZONE_STYLES,
  type VenueZone,
} from "@/lib/venue";

type Props = {
  selectedId: string | null;
  onSelect: (zone: VenueZone) => void;
};

/** Los bloques muy verticales llevan la etiqueta girada, igual que el plano. */
function isVertical(z: VenueZone) {
  return z.h > z.w * 2;
}

/**
 * Encoge el texto para que quepa dentro del bloque. "The Playground" no cabe
 * en 136 unidades al mismo cuerpo que "WC", y un SVG no reflota solo.
 */
function fitSize(text: string, available: number, base: number) {
  return Math.min(base, ((available - 14) * 1.85) / Math.max(text.length, 1));
}

export function VenueSvg({ selectedId, onSelect }: Props) {
  return (
    <svg
      viewBox={`0 0 ${VENUE_VIEWBOX.width} ${VENUE_VIEWBOX.height}`}
      className="h-full w-full touch-none select-none"
      role="group"
      aria-label="Plano de Jardín Americana con los escenarios y servicios de JSConf México 2026"
    >
      {/* Predio */}
      <rect
        x={20}
        y={10}
        width={960}
        height={1723}
        rx={22}
        fill="#ffffff"
        stroke="#d9d9d2"
        strokeWidth={3}
      />

      {/* Superficies de contexto */}
      {VENUE_SURFACES.map((s) => (
        <g key={s.id}>
          <rect
            x={s.x}
            y={s.y}
            width={s.w}
            height={s.h}
            rx={14}
            fill={s.fill}
            stroke={s.stroke}
            strokeWidth={2}
          />
          <text
            x={s.x + 14}
            y={s.id === "acceso-vehicular" ? s.y + s.h - 16 : s.y + 30}
            className="fill-neutral-400"
            fontSize={21}
            fontWeight={500}
            letterSpacing={1}
          >
            {s.label}
          </text>
        </g>
      ))}

      {/* Rosa de los vientos: el norte del plano apunta hacia arriba */}
      <g transform="translate(58, 64)" aria-hidden>
        <circle r={30} fill="#ffffff" stroke="#d9d9d2" strokeWidth={2} />
        <path d="M0 -20 L9 10 L0 3 L-9 10 Z" fill="var(--color-js-plum)" />
        <text
          y={-24}
          textAnchor="middle"
          fontSize={15}
          fontWeight={700}
          className="fill-neutral-500"
        >
          N
        </text>
      </g>

      {/* Escaleras al ASYNC Stage — la flecha roja del plano original */}
      <g aria-hidden>
        <path
          d={`M ${ASYNC_STAIRS.x + ASYNC_STAIRS.w / 2 - 7} ${ASYNC_STAIRS.y}
              h 14
              v ${ASYNC_STAIRS.h - 34}
              h 13
              l -20 34
              l -20 -34
              h 13 Z`}
          fill="var(--color-js-red-500)"
        />
        <text
          x={ASYNC_STAIRS.x + ASYNC_STAIRS.w / 2}
          y={ASYNC_STAIRS.y - 14}
          textAnchor="middle"
          fontSize={19}
          fontWeight={700}
          className="fill-js-red-600"
        >
          ESCALERAS
        </text>
      </g>

      {/* Zonas */}
      {VENUE_ZONES.map((z) => {
        const style = ZONE_STYLES[z.kind];
        const selected = selectedId === z.id;
        const cx = z.x + z.w / 2;
        const cy = z.y + z.h / 2;
        const vertical = isVertical(z);

        return (
          <g
            key={z.id}
            role="button"
            tabIndex={0}
            aria-pressed={selected}
            className="cursor-pointer outline-none"
            onClick={() => onSelect(z)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === " ") {
                e.preventDefault();
                onSelect(z);
              }
            }}
          >
            <title>{z.name}</title>

            {selected && (
              <rect
                x={z.x - 10}
                y={z.y - 10}
                width={z.w + 20}
                height={z.h + 20}
                rx={(z.r ?? 10) + 8}
                fill="none"
                stroke="var(--color-js-indigo-500)"
                strokeWidth={6}
                strokeDasharray="14 10"
              />
            )}

            <rect
              x={z.x}
              y={z.y}
              width={z.w}
              height={z.h}
              rx={z.r ?? 10}
              fill={style.fill}
              stroke={style.stroke}
              strokeWidth={2.5}
            />

            <g
              transform={vertical ? `rotate(-90 ${cx} ${cy})` : undefined}
              pointerEvents="none"
            >
              {z.label.map((line, i) => {
                const first = i === 0 && z.label.length > 1;
                const total = z.label.length;
                const available = vertical ? z.h : z.w;
                const size = fitSize(line, available, first ? 17 : total > 1 ? 21 : 23);
                const offset = (i - (total - 1) / 2) * 26 + 7;
                return (
                  <text
                    key={line}
                    x={cx}
                    y={cy + offset}
                    textAnchor="middle"
                    fill={style.text}
                    fontSize={size}
                    fontWeight={first ? 600 : 700}
                    letterSpacing={first ? 1.6 : 0}
                    opacity={first ? 0.85 : 1}
                  >
                    {line}
                  </text>
                );
              })}
            </g>

            {/* Marca de planta alta: el ASYNC Stage no está a nivel de piso */}
            {z.level === "planta-alta" && (
              <g transform={`translate(${z.x + z.w - 22}, ${z.y + 22})`} pointerEvents="none">
                <circle r={17} fill="#ffffff" stroke={style.stroke} strokeWidth={2.5} />
                <path
                  d="M0 -8 L7 2 L2.5 2 L2.5 8 L-2.5 8 L-2.5 2 L-7 2 Z"
                  fill={style.stroke}
                />
              </g>
            )}
          </g>
        );
      })}
    </svg>
  );
}
