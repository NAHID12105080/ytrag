"use client";

import {
  Database,
  History,
  Home,
  Info,
  MessageSquare,
  Settings,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ComponentType } from "react";

import { cn } from "@/lib/utils";
import { NAV_LINKS } from "@/lib/constants";

const ICONS: Record<string, ComponentType<{ className?: string }>> = {
  "/": Home,
  "/chat": MessageSquare,
  "/upload": Upload,
  "/knowledge-base": Database,
  "/history": History,
  "/settings": Settings,
  "/about": Info,
};

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="hidden w-56 shrink-0 border-r border-border md:flex md:flex-col md:gap-1 md:p-4">
      {NAV_LINKS.map((link) => {
        const Icon = ICONS[link.href] ?? Home;
        const active =
          link.href === "/" ? pathname === "/" : pathname.startsWith(link.href);

        return (
          <Link
            key={link.href}
            href={link.href}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
              active
                ? "bg-secondary text-secondary-foreground"
                : "text-muted-foreground hover:bg-secondary/60 hover:text-foreground",
            )}
          >
            <Icon className="size-4" />
            {link.label}
          </Link>
        );
      })}
    </aside>
  );
}
