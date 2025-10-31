"use client";

import { useState } from "react";
import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import { tokens } from "@/components/theme/tokens";

export type ShellProps = {
  children: React.ReactNode;
};

export function Shell({ children }: ShellProps) {
  const [isCollapsed, setIsCollapsed] = useState(false);

  return (
    <div
      style={{
        minHeight: "100vh",
        display: "flex",
        backgroundColor: tokens.bgBase,
        color: tokens.textPrimary,
      }}
    >
      <Sidebar
        collapsed={isCollapsed}
        onToggle={() => setIsCollapsed((prev) => !prev)}
      />
      <div style={{ flex: 1, display: "flex", minWidth: 0 }}>
        <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
          <Header onToggleSidebar={() => setIsCollapsed((p) => !p)} />
          <main
            style={{
              flex: 1,
              minWidth: 0,
              padding: "24px",
              overflowY: "auto",
            }}
          >
            {children}
          </main>
        </div>
      </div>
    </div>
  );
}


