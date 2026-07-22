"use client";

import { Briefcase, GraduationCap, HelpCircle, LayoutDashboard, LineChart, NotebookText } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { ONBOARDING_TOUR_STEPS } from "@/lib/tours/onboarding-tour";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";
import { useTourStore } from "@/store/tour-store";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, match: (p: string) => p === "/" },
  { href: "/symbol/SPY", label: "Symbol View", icon: LineChart, match: (p: string) => p.startsWith("/symbol") },
  { href: "/positions", label: "Positions", icon: Briefcase, match: (p: string) => p.startsWith("/positions") },
  { href: "/journal", label: "Journal", icon: NotebookText, match: (p: string) => p.startsWith("/journal") },
  { href: "/learn", label: "Learn", icon: GraduationCap, match: (p: string) => p.startsWith("/learn") },
];

const RECENT_SEARCHES_KEY = "recent-symbol-searches";
const MAX_RECENT_SEARCHES = 5;

function loadRecentSearches(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const setActiveSymbol = useAppStore((s) => s.setActiveSymbol);
  const [query, setQuery] = useState("");
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const [showRecent, setShowRecent] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setRecentSearches(loadRecentSearches());
  }, []);

  function rememberSearch(symbol: string) {
    setRecentSearches((prev) => {
      const next = [symbol, ...prev.filter((s) => s !== symbol)].slice(0, MAX_RECENT_SEARCHES);
      window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
      return next;
    });
  }

  function goToSymbol(symbol: string) {
    setActiveSymbol(symbol);
    router.push(`/symbol/${symbol}`);
    rememberSearch(symbol);
    setQuery("");
    setShowRecent(false);
  }

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const symbol = query.trim().toUpperCase();
    if (!symbol) return;
    goToSymbol(symbol);
  }

  return (
    <nav className="border-b flex items-center gap-6 px-8 h-14 shrink-0">
      <span className="font-semibold text-sm tracking-tight">Options Sim</span>
      <div className="flex items-center gap-1">
        {links.map((link) => {
          const active = link.match(pathname);
          const Icon = link.icon;
          return (
            <Link key={link.href} href={link.href} className="relative px-3 py-1.5 rounded-md text-sm">
              {active && (
                <motion.div
                  layoutId="nav-active-pill"
                  className="absolute inset-0 bg-muted rounded-md"
                  transition={{ type: "spring", stiffness: 400, damping: 30 }}
                />
              )}
              <span
                className={cn(
                  "relative z-10 flex items-center gap-1.5 transition-colors",
                  active ? "text-foreground font-medium" : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Icon className="size-4" />
                {link.label}
              </span>
            </Link>
          );
        })}
      </div>
      <form onSubmit={handleSearch} className="ml-auto flex items-center gap-2">
        <div ref={searchContainerRef} className="relative" data-tour="nav-search">
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setShowRecent(true)}
            onBlur={() => setShowRecent(false)}
            placeholder="Symbol (e.g. AAPL)"
            className="h-8 w-40"
          />
          {showRecent && recentSearches.length > 0 && (
            <div className="absolute top-full mt-1 w-full z-50 rounded-lg bg-popover text-popover-foreground shadow-md ring-1 ring-foreground/10 p-1">
              <p className="px-2 py-1 text-xs text-muted-foreground">Recent</p>
              {recentSearches.map((symbol) => (
                <button
                  key={symbol}
                  type="button"
                  // fires before the input's onBlur closes the dropdown
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => goToSymbol(symbol)}
                  className="w-full text-left px-2 py-1 text-sm rounded-md hover:bg-muted"
                >
                  {symbol}
                </button>
              ))}
            </div>
          )}
        </div>
        <Button type="submit" size="sm" variant="secondary">
          Go
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <Button variant="ghost" size="icon-sm">
                <HelpCircle className="size-4" />
                <span className="sr-only">Help</span>
              </Button>
            }
          />
          <DropdownMenuContent align="end">
            <DropdownMenuItem
              onClick={() => useTourStore.getState().start("onboarding", ONBOARDING_TOUR_STEPS)}
            >
              <HelpCircle className="size-4" /> Take the product tour
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <ThemeToggle />
      </form>
    </nav>
  );
}
