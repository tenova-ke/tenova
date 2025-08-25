"use client";

import { usePathname } from "next/navigation";
import { ReactNode } from "react";

export default function SiteShell({
  children,
  navbar,
  footer,
}: {
  children: ReactNode;
  navbar?: ReactNode;
  footer?: ReactNode;
}) {
  const pathname = usePathname();
  const hideChrome = pathname?.startsWith("/music"); // hide on music pages

  if (hideChrome) {
    // music pages manage their own spacing; no global paddings here
    return <main className="min-h-[100svh]">{children}</main>;
  }

  return (
    <>
      {navbar}
      <main className="pt-20 pb-16 px-4 md:px-10 min-h-[100svh]">{children}</main>
      {footer}
    </>
  );
}
