"use client";

import { usePathname } from "next/navigation";
import { NavPill } from "./nav-pill";

/** El back office no lleva el shell de asistente. */
export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return <>{children}</>;

  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-2xl flex-col bg-white shadow-sm">
      <header className="safe-top sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur-md">
        <div className="flex items-center justify-between px-4 pt-3 pb-2">
          <p className="font-display text-base leading-none tracking-tight text-js-plum">
            JSConf<span className="text-js-red-500">MX</span>
          </p>
          <p className="font-heading text-[11px] tracking-widest text-neutral-500 uppercase">
            29–30 oct · Guadalajara
          </p>
        </div>
        <div className="px-3 pb-3">
          <NavPill />
        </div>
      </header>

      <main className="safe-bottom flex-1">{children}</main>
    </div>
  );
}
