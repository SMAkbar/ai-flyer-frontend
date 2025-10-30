"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";

export type ShellProps = {
  children: React.ReactNode;
};

export function Shell({ children }: ShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div className="min-h-screen flex bg-background text-foreground">
      <Sidebar
        collapsed={isCollapsed}
        onToggle={() => setIsCollapsed((prev) => !prev)}
      />
      <div className="flex-1 flex min-w-0">
        <div className="flex-1 flex flex-col min-w-0">
          <Header onToggleSidebar={() => setIsCollapsed((p) => !p)} />
          <main className="flex-1 min-w-0 p-4 md:p-6 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}


