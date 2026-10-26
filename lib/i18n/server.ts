import "server-only";
import { cookies, headers } from "next/headers";
import {
  LOCALE_COOKIE,
  isLocale,
  localeFromAcceptLanguage,
  type Locale,
} from "./config";
import { dictionaries } from "./dictionaries";

/** Cookie si la persona ya eligió; si no, el idioma de su teléfono. */
export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const chosen = store.get(LOCALE_COOKIE)?.value;
  if (isLocale(chosen)) return chosen;
  return localeFromAcceptLanguage((await headers()).get("accept-language"));
}

export async function getDictionary() {
  return dictionaries[await getLocale()];
}
