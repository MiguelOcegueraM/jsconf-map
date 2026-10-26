"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from "motion/react";
import { ChevronDown, Star, StarOff } from "lucide-react";
import type { Session, Stage } from "@/lib/types";
import {
  TONE_CARD,
  TONE_LABELS,
  TONE_PILL,
  formatRange,
  hasProvisionalTitle,
  sessionHeadline,
  sessionSpeakers,
  speakerDisplayName,
  toneOf,
  type SessionStatus,
} from "@/lib/agenda";
import { haptic } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils";
import { SessionDetail } from "./session-detail";

const THRESHOLD = 78;
const FLICK_VELOCITY = 520;

type Props = {
  session: Session;
  stage?: Stage;
  isFavorite: boolean;
  onAdd: () => void;
  onRemove: () => void;
  status?: SessionStatus;
  /** Abre el detalle desde fuera (deep link `#K-01`). */
  defaultExpanded?: boolean;
  /**
   * En Favoritos, quitar saca la celda de la lista. Sin esto la celda
   * regresaría al centro justo mientras se desmonta y el gesto se ve roto.
   */
  removeUnmounts?: boolean;
  /** La celda está saliendo: termina el gesto y colapsa su espacio. */
  isExiting?: boolean;
  /** Se llama al acabar la salida, para recién entonces quitarla de la lista. */
  onExited?: () => void;
};

const SPRING = { type: "spring", stiffness: 560, damping: 42 } as const;

function workshopNote(session: Session) {
  if (session.type !== "workshop") return null;
  const [sh, sm] = session.startTime.split(":").map(Number);
  const [eh, em] = session.endTime.split(":").map(Number);
  const total = eh * 60 + em - (sh * 60 + sm);
  const h = Math.floor(total / 60);
  const m = total % 60;
  return `Taller de ${[h ? `${h} h` : "", m ? `${m} min` : ""].filter(Boolean).join(" ")} · trae tu laptop`;
}

export function SessionCard({
  session,
  stage,
  isFavorite,
  onAdd,
  onRemove,
  status = "upcoming",
  defaultExpanded = false,
  removeUnmounts = false,
  isExiting = false,
  onExited,
}: Props) {
  const [expanded, setExpanded] = useState(defaultExpanded);
  const reduced = useReducedMotion();
  const x = useMotionValue(0);
  /** Evita disparar la vibración en cada píxel mientras se arrastra. */
  const buzzed = useRef(false);
  const wrapperRef = useRef<HTMLDivElement>(null);

  /** Al salir, la celda termina de irse por la izquierda en vez de rebotar. */
  useEffect(() => {
    if (!isExiting) return;
    const width = wrapperRef.current?.offsetWidth ?? 360;
    animate(x, -(width + 24), reduced ? { duration: 0 } : { duration: 0.18, ease: "easeIn" });
  }, [isExiting, reduced, x]);

  // Un deep link puede abrirla después del primer render: se ajusta el
  // estado durante el render en vez de con un efecto.
  const [prevDefault, setPrevDefault] = useState(defaultExpanded);
  if (defaultExpanded !== prevDefault) {
    setPrevDefault(defaultExpanded);
    if (defaultExpanded) setExpanded(true);
  }

  function settle() {
    animate(x, 0, reduced ? { duration: 0 } : SPRING);
  }

  const addOpacity = useTransform(x, [12, THRESHOLD], [0, 1]);
  const removeOpacity = useTransform(x, [-THRESHOLD, -12], [1, 0]);

  function handleDrag(_: unknown, info: PanInfo) {
    const past = Math.abs(info.offset.x) >= THRESHOLD;
    if (past && !buzzed.current) {
      buzzed.current = true;
      haptic();
    } else if (!past) {
      buzzed.current = false;
    }
  }

  function handleDragEnd(_: unknown, info: PanInfo) {
    buzzed.current = false;
    const { offset, velocity } = info;
    const right = offset.x > THRESHOLD || (offset.x > 28 && velocity.x > FLICK_VELOCITY);
    const left = offset.x < -THRESHOLD || (offset.x < -28 && velocity.x < -FLICK_VELOCITY);
    if (right) {
      onAdd();
      settle();
    } else if (left) {
      onRemove();
      // Si la celda desaparece de la lista, dejamos que siga su camino: el
      // rebote al centro es justo lo que hacía ver rota la animación.
      if (!removeUnmounts) settle();
    } else {
      settle();
    }
  }

  const headline = sessionHeadline(session);
  const provisional = hasProvisionalTitle(session);
  const tone = toneOf(session);
  const speakers = sessionSpeakers(session);
  const isKeynote = session.type === "keynote";
  const photo = isKeynote ? speakers[0]?.photoUrl : null;
  const note = workshopNote(session);
  const panelId = `detalle-${session.id}`;

  return (
    <motion.div
      ref={wrapperRef}
      id={session.id}
      data-session={session.id}
      // pr/pb dejan ver la sombra desplazada de la tarjeta dentro del recorte.
      className="relative scroll-mt-48 overflow-hidden pr-1 pb-1"
      initial={false}
      animate={isExiting ? { height: 0, opacity: 0 } : { height: "auto", opacity: 1 }}
      transition={reduced ? { duration: 0 } : { duration: 0.22, ease: "easeInOut" }}
      onAnimationComplete={() => {
        if (isExiting) onExited?.();
      }}
    >
      {/* Pistas que se revelan bajo la celda al arrastrar */}
      <motion.div
        style={{ opacity: addOpacity }}
        className="radius-card absolute inset-0 right-1 bottom-1 flex items-center justify-start bg-js-yellow-500 pl-5"
        aria-hidden
      >
        <span className="flex items-center gap-2 text-sm font-bold text-js-indigo-900">
          <Star className="size-5 fill-current" />
          Guardar
        </span>
      </motion.div>
      <motion.div
        style={{ opacity: removeOpacity }}
        className="radius-card absolute inset-0 right-1 bottom-1 flex items-center justify-end bg-js-red-500 pr-5"
        aria-hidden
      >
        <span className="flex items-center gap-2 text-sm font-bold text-white">
          Quitar
          <StarOff className="size-5" />
        </span>
      </motion.div>

      <motion.article
        drag="x"
        style={{ x }}
        dragDirectionLock
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.5}
        onDrag={handleDrag}
        onDragEnd={handleDragEnd}
        className={cn(
          "radius-card relative touch-pan-y border-[3px] border-js-indigo-900 text-js-indigo-900",
          TONE_CARD[tone],
          status === "past" && "opacity-60",
        )}
      >
        <div className="flex items-start gap-2 px-3.5 pt-3">
          <span className="flex min-w-0 flex-1 flex-wrap items-center gap-1.5">
            {stage && (
              <span className="rounded-full bg-js-indigo-900 px-2 py-px text-[11px] font-bold text-white">
                {stage.name}
              </span>
            )}
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[11px] font-bold tracking-wide uppercase",
                TONE_PILL[tone],
              )}
            >
              {TONE_LABELS[tone]}
            </span>
            {session.language && (
              <span
                className="rounded-full border-2 border-js-indigo-900 px-1.5 text-[11px] font-bold"
                title={session.language === "en" ? "En inglés" : "En español"}
              >
                {session.language.toUpperCase()}
              </span>
            )}
            {status === "live" ? (
              <span className="flex items-center gap-1 rounded-full bg-js-red-600 px-2 py-px text-[11px] font-bold text-white">
                <span className="size-1.5 animate-pulse rounded-full bg-white" aria-hidden />
                En vivo
              </span>
            ) : (
              <span className="text-xs font-semibold text-js-slate tabular-nums">
                {formatRange(session)}
              </span>
            )}
          </span>

          {/* El swipe es el gesto principal, pero nunca el único camino. */}
          <button
            type="button"
            onClick={() => {
              haptic();
              if (isFavorite) onRemove();
              else onAdd();
            }}
            aria-pressed={isFavorite}
            aria-label={
              isFavorite
                ? `Quitar «${headline}» de favoritos`
                : `Guardar «${headline}» en favoritos`
            }
            className={cn(
              "-mt-1.5 -mr-1.5 grid size-11 shrink-0 place-items-center rounded-full",
              "transition-colors focus-visible:outline-[3px] focus-visible:outline-js-yellow-500",
              isFavorite
                ? "text-js-yellow-600 hover:bg-js-yellow-100"
                : "text-js-slate-light hover:bg-js-haze hover:text-js-indigo-900",
            )}
          >
            <Star className={cn("size-5", isFavorite && "fill-current")} />
          </button>
        </div>

        <button
          type="button"
          aria-expanded={expanded}
          aria-controls={panelId}
          onClick={() => setExpanded((v) => !v)}
          className="flex w-full flex-col gap-1.5 px-3.5 pt-1.5 pb-3 text-left focus-visible:outline-none"
        >
          <span className="flex items-center gap-3.5">
            {photo && (
              <Image
                src={photo}
                alt=""
                width={64}
                height={64}
                sizes="64px"
                className="radius-card size-16 shrink-0 border-[3px] border-js-indigo-900 object-cover object-top"
              />
            )}
            <span className="flex min-w-0 flex-col gap-1">
              <span
                className={cn(
                  "leading-snug font-bold",
                  isKeynote ? "text-xl" : "text-[15px]",
                )}
              >
                {headline}
              </span>
              {speakers.length > 0 && !provisional && (
                <span className="text-[13px]">
                  <span className="font-semibold">
                    {speakers.map(speakerDisplayName).join(", ")}
                  </span>
                  {speakers.length === 1 && speakers[0].company && ` · ${speakers[0].company}`}
                </span>
              )}
              {provisional && (
                <span className="text-xs text-js-slate italic">Título por confirmar</span>
              )}
            </span>
          </span>
          {session.sponsor && (
            <span className="text-xs font-semibold">Presentada por {session.sponsor}</span>
          )}
          {note && <span className="text-xs font-semibold text-js-blue-900">{note}</span>}
          <span className="flex items-center gap-1.5 text-[13px] font-bold text-js-indigo-500">
            {expanded ? "Ocultar detalle" : "Ver detalle"}
            <ChevronDown
              className={cn("size-3.5 transition-transform", expanded && "rotate-180")}
              strokeWidth={2.5}
              aria-hidden
            />
          </span>
        </button>

        {expanded && (
          <div id={panelId} className="mx-3.5 border-t-2 border-js-indigo-900 pt-3 pb-4">
            <SessionDetail session={session} stage={stage} />
          </div>
        )}
      </motion.article>
    </motion.div>
  );
}
