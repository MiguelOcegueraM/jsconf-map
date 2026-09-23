"use client";

import { useActionState } from "react";
import Link from "next/link";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { deleteSession, saveSession, type ActionState } from "@/lib/actions";
import type { Session, Stage } from "@/lib/db/schema";
import { SESSION_TYPE_LABELS } from "@/lib/agenda";
import { DAYS, DAY_LABELS } from "@/lib/seed-data";

const TYPES = Object.keys(SESSION_TYPE_LABELS) as (keyof typeof SESSION_TYPE_LABELS)[];

export function SessionForm({
  session,
  stages,
}: {
  session: Session | null;
  stages: Stage[];
}) {
  const [state, action, pending] = useActionState<ActionState, FormData>(
    saveSession,
    undefined,
  );

  // Tras un error de validación mandan los valores que venían del formulario;
  // en la primera carga, los de la sesión que se está editando.
  const sent = state?.values;
  const field = (name: keyof Session, fallback = "") =>
    sent?.[name] ?? (session?.[name] as string | null) ?? fallback;

  return (
    <form
      action={action}
      // Remontar tras un error garantiza que los nuevos defaultValue se apliquen
      // aunque React ya haya disparado su reset del formulario.
      key={sent ? JSON.stringify(sent) : "initial"}
      className="mt-6 flex flex-col gap-4"
    >
      {session && <input type="hidden" name="id" value={session.id} />}

      <div className="grid grid-cols-2 gap-3">
        <Field label="Día" htmlFor="day">
          <Select id="day" name="day" defaultValue={field("day", DAYS[0])}>
            {DAYS.map((d) => (
              <option key={d} value={d}>
                {DAY_LABELS[d].long}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Tipo" htmlFor="type">
          <Select id="type" name="type" defaultValue={field("type", "talk")}>
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {SESSION_TYPE_LABELS[t]}
              </option>
            ))}
          </Select>
        </Field>

        <Field label="Inicio" htmlFor="startTime">
          <Input
            id="startTime"
            name="startTime"
            type="time"
            required
            className="h-11"
            defaultValue={field("startTime", "10:00")}
          />
        </Field>

        <Field label="Fin" htmlFor="endTime">
          <Input
            id="endTime"
            name="endTime"
            type="time"
            required
            className="h-11"
            defaultValue={field("endTime", "10:40")}
          />
        </Field>
      </div>

      <Field
        label="Escenario"
        htmlFor="stageId"
        hint="Déjalo en «Sin escenario» para actividades generales como la comida: ocupan todo el ancho de la agenda."
      >
        <Select id="stageId" name="stageId" defaultValue={field("stageId", "none")}>
          <option value="none">Sin escenario (actividad general)</option>
          {stages.map((s) => (
            <option key={s.id} value={s.id}>
              {s.name}
            </option>
          ))}
        </Select>
      </Field>

      <Field
        label="Título"
        htmlFor="title"
        hint="Si lo dejas vacío, la app muestra el nombre del speaker con la nota «título por confirmar»."
      >
        <Input id="title" name="title" className="h-11" defaultValue={field("title")} />
      </Field>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Speaker" htmlFor="speakerName">
          <Input
            id="speakerName"
            name="speakerName"
            className="h-11"
            defaultValue={field("speakerName")}
          />
        </Field>
        <Field label="Cargo y empresa" htmlFor="speakerRole">
          <Input
            id="speakerRole"
            name="speakerRole"
            className="h-11"
            defaultValue={field("speakerRole")}
          />
        </Field>
        <Field label="Track" htmlFor="track">
          <Input id="track" name="track" className="h-11" defaultValue={field("track")} />
        </Field>
        <Field label="Ubicación (actividades generales)" htmlFor="locationNote">
          <Input
            id="locationNote"
            name="locationNote"
            className="h-11"
            defaultValue={field("locationNote")}
          />
        </Field>
      </div>

      <Field label="Descripción" htmlFor="description">
        <Textarea
          id="description"
          name="description"
          rows={3}
          defaultValue={field("description")}
        />
      </Field>

      {state?.error && (
        <p role="alert" className="text-sm font-medium text-js-red-600">
          {state.error}
        </p>
      )}

      <div className="mt-2 flex gap-2">
        <Button type="submit" disabled={pending} className="h-11 flex-1">
          {pending ? "Guardando…" : session ? "Guardar cambios" : "Crear sesión"}
        </Button>
        <Button
          variant="outline"
          className="h-11"
          nativeButton={false}
          render={<Link href="/admin" />}
        >
          Cancelar
        </Button>
      </div>

      {session && <DeleteButton id={session.id} />}
    </form>
  );
}

function DeleteButton({ id }: { id: string }) {
  return (
    <Dialog>
      <DialogTrigger
        render={<Button variant="destructive" className="mt-2 h-11 w-full" />}
      >
        <Trash2 className="size-4" />
        Eliminar sesión
      </DialogTrigger>
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>¿Eliminar esta sesión?</DialogTitle>
          <DialogDescription>
            Desaparecerá de la agenda pública. Quien la tuviera en favoritos dejará de
            verla. No se puede deshacer.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <DialogClose render={<Button variant="outline" />}>Cancelar</DialogClose>
          {/* Un form anidado no es válido: este vive fuera gracias al portal del diálogo. */}
          <form action={deleteSession}>
            <input type="hidden" name="id" value={id} />
            <Button type="submit" variant="destructive">
              Sí, eliminar
            </Button>
          </form>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
      {hint && <p className="text-xs text-neutral-500">{hint}</p>}
    </div>
  );
}

/** Un `<select>` nativo: en móvil abre la rueda del sistema, que gana a cualquier combo custom. */
function Select(props: React.ComponentProps<"select">) {
  return (
    <select
      {...props}
      className="h-11 w-full rounded-lg border border-neutral-300 bg-white px-3 text-sm focus-visible:ring-2 focus-visible:ring-js-indigo-500 focus-visible:outline-none"
    />
  );
}
