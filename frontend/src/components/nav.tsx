"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { useAppStore } from "@/store/app-store";

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

  const links = [
    { href: "/", label: "Dashboard" },
    { href: "/symbol/SPY", label: "Symbol View" },
  ];

  return (
    <nav className="border-b flex items-center gap-6 px-8 h-14 shrink-0">
      <span className="font-semibold text-sm tracking-tight">Options Sim</span>
      <div className="flex items-center gap-4">
        {links.map((link) => (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "text-sm text-muted-foreground hover:text-foreground transition-colors",
              pathname === link.href && "text-foreground font-medium"
            )}
          >
            {link.label}
          </Link>
        ))}
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
      </form>
    </nav>
  );
}
