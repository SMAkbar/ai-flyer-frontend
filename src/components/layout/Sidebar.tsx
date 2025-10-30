"use client";

import type { MouseEventHandler } from "react";
import Link from "next/link";

export type SidebarProps = {
  collapsed: boolean;
  onToggle: MouseEventHandler<HTMLButtonElement>;
};

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      className={
        "h-screen sticky top-0 border-r border-black/10 dark:border-white/10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60 " +
        (collapsed ? " w-16 " : " w-64 ")
      }
    >
      <div className="h-14 flex items-center gap-2 px-3">
        <button
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={onToggle}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition"
        >
          <span aria-hidden className="text-lg">≡</span>
        </button>
        {!collapsed && (
          <span className="font-semibold text-sm truncate">Navigation</span>
        )}
      </div>

      <nav className="px-2 py-2 space-y-1">
        <SidebarItem href="/dashboard" collapsed={collapsed} label="Dashboard" />
        <SidebarItem href="/team" collapsed={collapsed} label="Team" />
        <SidebarItem href="/" collapsed={collapsed} label="Home" />
      </nav>
    </aside>
  );
}

type SidebarItemProps = {
  href: string;
  label: string;
  collapsed: boolean;
};

function SidebarItem({ href, label, collapsed }: SidebarItemProps) {
  return (
    <Link
      href={href}
      className="flex items-center gap-3 rounded-md px-3 py-2 text-sm hover:bg-black/5 dark:hover:bg-white/5 transition"
    >
      <span aria-hidden className="text-base">▪︎</span>
      {!collapsed && <span className="truncate">{label}</span>}
    </Link>
  );
}


