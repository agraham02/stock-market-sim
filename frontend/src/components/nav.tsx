"use client";

import { Briefcase, GraduationCap, LayoutDashboard, LineChart, NotebookText } from "lucide-react";
import { motion } from "motion/react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ThemeToggle } from "@/components/theme-toggle";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

const links = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard, match: (p: string) => p === "/" },
  { href: "/symbol/SPY", label: "Symbol View", icon: LineChart, match: (p: string) => p.startsWith("/symbol") },
  { href: "/positions", label: "Positions", icon: Briefcase, match: (p: string) => p.startsWith("/positions") },
  { href: "/journal", label: "Journal", icon: NotebookText, match: (p: string) => p.startsWith("/journal") },
  { href: "/learn", label: "Learn", icon: GraduationCap, match: (p: string) => p.startsWith("/learn") },
];

export function Nav() {
  const pathname = usePathname();
  const router = useRouter();
  const setActiveSymbol = useAppStore((s) => s.setActiveSymbol);
  const [query, setQuery] = useState("");

  function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    const symbol = query.trim().toUpperCase();
    if (!symbol) return;
    setActiveSymbol(symbol);
    router.push(`/symbol/${symbol}`);
    setQuery("");
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
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Symbol (e.g. AAPL)"
          className="h-8 w-40"
        />
        <Button type="submit" size="sm" variant="secondary">
          Go
        </Button>
        <ThemeToggle />
      </form>
    </nav>
  );
}
