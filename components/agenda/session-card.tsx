"use client";

import { useEffect, useRef } from "react";
import {
  animate,
  motion,
  useMotionValue,
  useReducedMotion,
  useTransform,
  type PanInfo,
} from "motion/react";
import { Star, StarOff } from "lucide-react";
import type { Session, Stage } from "@/lib/db/schema";
import {
  SESSION_TYPE_LABELS,
  hasProvisionalTitle,
  sessionHeadline,
  stageAccent,
} from "@/lib/agenda";
import { haptic } from "@/hooks/use-favorites";
import { cn } from "@/lib/utils";

const THRESHOLD = 78;
const FLICK_VELOCITY = 520;

type Props = {
  session: Session;
  stage?: Stage;
  isFavorite: boolean;
  onAdd: () => void;
  onRemove: () => void;
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

export function SessionCard({
  session,
  stage,
  isFavorite,
  onAdd,
  onRemove,
  removeUnmounts = false,
  isExiting = false,
  onExited,
}: Props) {
  const accent = stageAccent(session.stageId);
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

  return (
    <motion.div
      ref={wrapperRef}
      className="relative overflow-hidden rounded-2xl"
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
        className="absolute inset-0 flex items-center justify-start bg-js-yellow-500 pl-5"
        aria-hidden
      >
        <span className="flex items-center gap-2 text-sm font-bold text-js-yellow-900">
          <Star className="size-5 fill-current" />
          Guardar
        </span>
      </motion.div>
      <motion.div
        style={{ opacity: removeOpacity }}
        className="absolute inset-0 flex items-center justify-end bg-js-red-500 pr-5"
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
          "relative flex touch-pan-y gap-3 rounded-2xl border bg-white p-3.5",
          "border-neutral-200 shadow-[0_1px_2px_rgba(0,0,0,0.04)]",
          isFavorite && "border-js-yellow-400 bg-js-yellow-50/60",
        )}
      >
        <span className={cn("w-1.5 shrink-0 rounded-full", accent.bar)} aria-hidden />

        <div className="min-w-0 flex-1">
          <p className="font-heading text-[15px] leading-snug text-js-plum">{headline}</p>

          {session.speakerRole && (
            <p className="mt-0.5 truncate text-xs text-neutral-500">{session.speakerRole}</p>
          )}
          {provisional && (
            <p className="mt-0.5 text-xs text-neutral-400 italic">Título por confirmar</p>
          )}
          {session.description && !provisional && (
            <p className="mt-1 line-clamp-2 text-xs text-neutral-500">{session.description}</p>
          )}

          <div className="mt-2 flex flex-wrap items-center gap-1.5">
            <span className="font-mono text-xs font-semibold text-neutral-700 tabular-nums">
              {session.startTime}–{session.endTime}
            </span>
            {stage && (
              <span
                className={cn(
                  "rounded-full border px-2 py-0.5 text-[11px] font-semibold",
                  accent.chip,
                )}
              >
                {stage.name}
              </span>
            )}
            {session.track && (
              <span className="rounded-full bg-neutral-100 px-2 py-0.5 text-[11px] text-neutral-600">
                {session.track}
              </span>
            )}
            {session.type === "workshop" && (
              <span className="rounded-full bg-js-indigo-50 px-2 py-0.5 text-[11px] font-semibold text-js-indigo-700">
                {SESSION_TYPE_LABELS.workshop}
              </span>
            )}
          </div>
        </div>

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
            "-m-1 grid size-11 shrink-0 place-items-center self-start rounded-full",
            "transition-colors focus-visible:ring-2 focus-visible:ring-js-indigo-500 focus-visible:outline-none",
            isFavorite
              ? "text-js-yellow-600 hover:bg-js-yellow-100"
              : "text-neutral-300 hover:bg-neutral-100 hover:text-neutral-500",
          )}
        >
          <Star className={cn("size-5", isFavorite && "fill-current")} />
        </button>
      </motion.article>
    </motion.div>
  );
}
