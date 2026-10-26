/**
 * Cabecera de cada pantalla, como el hero de /agenda en jsconf.mx: banda
 * lavanda, título en Chango con la sombra amarilla y una bajada corta.
 */
export function PageHero({
  title,
  children,
  aside,
}: {
  title: string;
  children?: React.ReactNode;
  aside?: React.ReactNode;
}) {
  return (
    <section className="border-b-[3px] border-js-indigo-900 bg-js-lavender px-4 pt-6 pb-5">
      <div className="flex items-end justify-between gap-3">
        <h1 className="font-display typography-shadow text-[34px] leading-[1.1] text-js-indigo-900">
          {title}
        </h1>
        {aside}
      </div>
      {children && <div className="mt-2 text-[15px] leading-snug text-js-indigo-900">{children}</div>}
    </section>
  );
}
