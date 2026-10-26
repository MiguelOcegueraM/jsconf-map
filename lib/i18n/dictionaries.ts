import type { Locale } from "./config";
import es from "./es";
import en from "./en";

/** El tipo de `es` con los literales abiertos a `string`: `en` debe calzar en él. */
type Widen<T> = T extends string
  ? string
  : T extends (...args: infer A) => string
    ? (...args: A) => string
    : { [K in keyof T]: Widen<T[K]> };

export type Dictionary = Widen<typeof es>;

export const dictionaries: Record<Locale, Dictionary> = { es, en };
