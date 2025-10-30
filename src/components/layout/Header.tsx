"use client";

import type { MouseEventHandler } from "react";

export type HeaderProps = {
  onToggleSidebar: MouseEventHandler<HTMLButtonElement>;
};

export function Header({ onToggleSidebar }: HeaderProps) {
  return (
    <header className="h-14 sticky top-0 z-10 border-b border-black/10 dark:border-white/10 bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="h-full flex items-center gap-3 px-4">
        <button
          aria-label="Toggle sidebar"
          onClick={onToggleSidebar}
          className="inline-flex h-9 w-9 items-center justify-center rounded-md border border-black/10 dark:border-white/10 hover:bg-black/5 dark:hover:bg-white/5 transition md:hidden"
        >
          <span aria-hidden className="text-lg">≡</span>
        </button>
        <div className="font-semibold text-sm">App</div>
        <div className="ml-auto flex items-center gap-2">
          <div className="text-xs opacity-70">Signed in</div>
        </div>
      </div>
    </header>
  );
}


