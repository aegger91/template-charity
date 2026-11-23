"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { ChevronDown, Globe, Menu } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { cn } from "@/lib/utils";
import { useClientValue } from "@/lib/use-client";

type Link_ = { label: string; href: string };
type NavEntry = Link_ & { children?: Link_[] };

type Props = {
  lang: string;
  dir: "ltr" | "rtl";
  homeHref: string;
  logo: ReactNode;
  drawerLogo: ReactNode;
  nav: NavEntry[];
  donate: Link_;
  languages: { code: string; label: string; dir: string }[];
  strings: { menu: string; mainNav: string; closeMenu: string; language: string };
};

function swapLanguage(pathname: string, code: string) {
  const parts = pathname.split("/");
  parts[1] = code;
  const next = parts.join("/");
  return next.endsWith("/") ? next : `${next}/`;
}

function isActive(pathname: string, href: string, homeHref: string) {
  if (href === homeHref) return pathname === homeHref || pathname === homeHref.slice(0, -1);
  return pathname.startsWith(href) || `${pathname}/`.startsWith(href);
}

function subscribeScroll(onChange: () => void) {
  window.addEventListener("scroll", onChange, { passive: true });
  return () => window.removeEventListener("scroll", onChange);
}

export function SiteHeader({ lang, dir, homeHref, logo, drawerLogo, nav, donate, languages, strings }: Props) {
  const pathname = usePathname() || homeHref;
  const condensed = useClientValue(() => window.scrollY > 32, false, subscribeScroll);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [drawerPath, setDrawerPath] = useState(pathname);
  if (drawerPath !== pathname) {
    setDrawerPath(pathname);
    setDrawerOpen(false);
  }

  const current = languages.find((l) => l.code === lang);

  return (
    <header
      data-header
      data-condensed={condensed || undefined}
      className={cn(
        // Fixed height: only paint changes on scroll so the bar never jitters or shifts layout.
        "sticky top-0 z-50 h-[var(--token-layout-headerHeight)] border-b",
        condensed
          ? "border-border/80 bg-surface/95 shadow-[0_8px_30px_-12px_rgba(9,62,75,0.25)] backdrop-blur-md"
          : "border-transparent bg-background",
      )}
      style={{ ["--logo-size" as string]: condensed ? "2.5rem" : "2.75rem" }}
    >
      <div className="container-site flex h-full items-center gap-3">
        <Link href={homeHref} className="min-w-0 shrink rounded-md focus-visible:ring-3 focus-visible:ring-ring/50 focus-visible:outline-none">
          {logo}
        </Link>

        <nav aria-label={strings.mainNav} className="ms-auto hidden xl:block">
          <ul className="flex items-center gap-0.5">
            {nav.map((item) =>
              item.children?.length ? (
                <DesktopDropdown key={item.label} item={item} pathname={pathname} homeHref={homeHref} />
              ) : (
                <li key={item.label}>
                  <Link
                    href={item.href}
                    aria-current={isActive(pathname, item.href, homeHref) ? "page" : undefined}
                    className="nav-link"
                  >
                    {item.label}
                  </Link>
                </li>
              ),
            )}
          </ul>
        </nav>

        <div className="ms-auto flex shrink-0 items-center gap-1.5 xl:ms-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="lg" className="hidden gap-1.5 px-2.5 text-ink-soft sm:inline-flex" aria-label={strings.language}>
                <Globe className="size-4" />
                <span className="text-sm">{current?.code.toUpperCase()}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="min-w-40">
              {languages.map((l) => (
                <DropdownMenuItem key={l.code} asChild>
                  <Link href={swapLanguage(pathname, l.code)} lang={l.code} dir={l.dir as "ltr" | "rtl"} aria-current={l.code === lang ? "true" : undefined} className="justify-between gap-6">
                    <span>{l.label}</span>
                    <span className="text-xs text-muted-foreground">{l.code.toUpperCase()}</span>
                  </Link>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <Button asChild className="h-10 max-w-[min(100%,11.5rem)] rounded-full bg-gold px-3 text-[0.9rem] leading-tight font-semibold whitespace-normal text-gold-ink shadow-[0_6px_18px_-8px_rgba(143,101,20,0.8)] hover:bg-gold/90 sm:max-w-none sm:px-5 sm:text-[0.95rem] sm:whitespace-nowrap">
            <Link href={donate.href} className="inline-flex items-center justify-center gap-1.5 text-center">
              <DonateMark />
              <span>{donate.label}</span>
            </Link>
          </Button>

          <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon-lg" className="size-10 xl:hidden" aria-label={strings.menu}>
                <Menu className="size-5" />
              </Button>
            </SheetTrigger>
            <SheetContent side={dir === "rtl" ? "left" : "right"} className="w-[min(88vw,24rem)] gap-0 overflow-y-auto p-0">
              <SheetHeader className="border-b p-5 pe-14">
                <SheetTitle className="sr-only">{strings.menu}</SheetTitle>
                {drawerLogo}
              </SheetHeader>
              <nav aria-label={strings.mainNav} className="px-3 py-2">
                <Accordion type="single" collapsible>
                  {nav.map((item) =>
                    item.children?.length ? (
                      <AccordionItem key={item.label} value={item.label} className="border-b-0">
                        <AccordionTrigger className="px-3 py-3 text-base font-semibold hover:no-underline">
                          {item.label}
                        </AccordionTrigger>
                        <AccordionContent className="pb-2 [&_a]:no-underline">
                          <ul className="ms-3 border-s border-gold/50 ps-2">
                            {item.children.map((c) => (
                              <li key={c.href + c.label}>
                                <Link href={c.href} className="block rounded-md px-3 py-2.5 text-[0.95rem] text-ink-soft hover:bg-muted" aria-current={pathname === c.href ? "page" : undefined}>
                                  {c.label}
                                </Link>
                              </li>
                            ))}
                          </ul>
                        </AccordionContent>
                      </AccordionItem>
                    ) : (
                      <Link key={item.label} href={item.href} className="block rounded-md px-3 py-3 text-base font-semibold hover:bg-muted">
                        {item.label}
                      </Link>
                    ),
                  )}
                </Accordion>
              </nav>
              <div className="mt-auto space-y-4 border-t p-5">
                <Button asChild className="h-12 w-full rounded-full bg-gold text-base font-semibold text-gold-ink hover:bg-gold/90">
                  <Link href={donate.href}>{donate.label}</Link>
                </Button>
                <div>
                  <p className="mb-2 text-xs font-semibold text-muted-foreground">{strings.language}</p>
                  <div className="flex flex-wrap gap-2">
                    {languages.map((l) => (
                      <Link
                        key={l.code}
                        href={swapLanguage(pathname, l.code)}
                        lang={l.code}
                        className={cn(
                          "rounded-full border px-3.5 py-1.5 text-sm",
                          l.code === lang ? "border-teal bg-teal text-white" : "bg-surface hover:bg-muted",
                        )}
                      >
                        {l.label}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );
}

function DonateMark() {
  return (
    <svg viewBox="0 0 16 16" className="size-3.5" aria-hidden="true">
      <path d="M8 1.5c1.6 2 2.6 3.6 2.6 5.2A2.6 2.6 0 0 1 8 9.3a2.6 2.6 0 0 1-2.6-2.6C5.4 5.1 6.4 3.5 8 1.5Z" fill="currentColor" />
      <rect x="6.6" y="9.8" width="2.8" height="4.7" rx="0.6" fill="currentColor" opacity="0.75" />
    </svg>
  );
}

function DesktopDropdown({ item, pathname, homeHref }: { item: NavEntry; pathname: string; homeHref: string }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLLIElement>(null);
  const timer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const active = item.children!.some((c) => isActive(pathname, c.href, homeHref)) || isActive(pathname, item.href, homeHref);

  useEffect(() => {
    if (!open) return;
    const onDoc = (e: PointerEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        ref.current?.querySelector("button")?.focus();
      }
    };
    document.addEventListener("pointerdown", onDoc);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("pointerdown", onDoc);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const [openPath, setOpenPath] = useState(pathname);
  if (openPath !== pathname) {
    setOpenPath(pathname);
    setOpen(false);
  }

  const enter = () => {
    if (timer.current) clearTimeout(timer.current);
    setOpen(true);
  };
  const leave = () => {
    timer.current = setTimeout(() => setOpen(false), 140);
  };

  return (
    <li
      ref={ref}
      className="relative"
      onPointerEnter={(e) => e.pointerType === "mouse" && enter()}
      onPointerLeave={(e) => e.pointerType === "mouse" && leave()}
      onBlur={(e) => {
        if (!ref.current?.contains(e.relatedTarget as Node)) setOpen(false);
      }}
    >
      <button
        type="button"
        aria-expanded={open}
        data-active={active || undefined}
        className="nav-link inline-flex items-center gap-1"
        onClick={() => setOpen((v) => !v)}
      >
        {item.label}
        <ChevronDown className={cn("size-3.5 opacity-60 transition-transform", open && "rotate-180")} />
      </button>
      <div
        className={cn(
          "absolute start-0 top-full z-50 pt-2 transition-[opacity,translate] duration-150",
          open ? "visible translate-y-0 opacity-100" : "invisible pointer-events-none -translate-y-1 opacity-0",
        )}
        hidden={!open}
        aria-hidden={!open}
      >
        <ul className="min-w-64 rounded-xl border bg-surface p-2 shadow-[0_20px_50px_-20px_rgba(9,62,75,0.35)]">
          {item.children!.map((c) => (
            <li key={c.href + c.label}>
              <Link
                href={c.href}
                aria-current={pathname === c.href ? "page" : undefined}
                className="block rounded-lg px-3.5 py-2.5 text-[0.95rem] text-ink-soft transition-colors hover:bg-teal-tint hover:text-teal-deep aria-[current=page]:font-semibold aria-[current=page]:text-teal-deep"
              >
                {c.label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </li>
  );
}
