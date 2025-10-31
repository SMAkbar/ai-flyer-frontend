"use client";

import type { MouseEventHandler } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { tokens } from "@/components/theme/tokens";

export type SidebarProps = {
  collapsed: boolean;
  onToggle: MouseEventHandler<HTMLButtonElement>;
};

const navItems = [
  { href: "/dashboard", label: "Dashboard", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { href: "/flyers", label: "Flyers", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { href: "/team", label: "Team", icon: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" },
  { href: "/profile", label: "Profile", icon: "M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" },
];

export function Sidebar({ collapsed, onToggle }: SidebarProps) {
  return (
    <aside
      style={{
        height: "100vh",
        position: "sticky",
        top: 0,
        width: collapsed ? "72px" : "260px",
        backgroundColor: tokens.bgElevated,
        borderRight: `1px solid ${tokens.border}`,
        display: "flex",
        flexDirection: "column",
        transition: "width 0.2s ease",
      }}
    >
      <div
        style={{
          height: "56px",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "0 16px",
          borderBottom: `1px solid ${tokens.border}`,
        }}
      >
        <button
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          onClick={onToggle}
          style={{
            display: "inline-flex",
            alignItems: "center",
            justifyContent: "center",
            width: "36px",
            height: "36px",
            borderRadius: "8px",
            border: `1px solid ${tokens.border}`,
            backgroundColor: "transparent",
            color: tokens.textSecondary,
            cursor: "pointer",
            transition: "all 0.2s ease",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = tokens.bgHover;
            e.currentTarget.style.borderColor = tokens.accent;
            e.currentTarget.style.color = tokens.textPrimary;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.borderColor = tokens.border;
            e.currentTarget.style.color = tokens.textSecondary;
          }}
        >
          <svg
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            {collapsed ? (
              <path d="M4 6h12M4 12h12M4 18h12" />
            ) : (
              <path d="M6 18L14 10L6 2" />
            )}
          </svg>
        </button>
        {!collapsed && (
          <span
            style={{
              fontSize: "16px",
              fontWeight: 600,
              color: tokens.textPrimary,
              letterSpacing: "-0.01em",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Navigation
          </span>
        )}
      </div>

      <nav
        style={{
          flex: 1,
          padding: "12px",
          display: "flex",
          flexDirection: "column",
          gap: "4px",
          overflowY: "auto",
        }}
      >
        {navItems.map((item) => (
          <SidebarItem
            key={item.href}
            href={item.href}
            label={item.label}
            icon={item.icon}
            collapsed={collapsed}
          />
        ))}
      </nav>
    </aside>
  );
}

type SidebarItemProps = {
  href: string;
  label: string;
  icon: string;
  collapsed: boolean;
};

function SidebarItem({ href, label, icon, collapsed }: SidebarItemProps) {
  const pathname = usePathname();
  const isActive = pathname === href || (href !== "/dashboard" && pathname?.startsWith(href));

  return (
    <Link
      href={href}
      style={{
        display: "flex",
        alignItems: "center",
        gap: collapsed ? "0" : "12px",
        padding: collapsed ? "12px" : "12px 16px",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: isActive ? 600 : 400,
        color: isActive ? tokens.accent : tokens.textSecondary,
        backgroundColor: isActive ? `${tokens.accent}15` : "transparent",
        border: isActive ? `1px solid ${tokens.accent}40` : "1px solid transparent",
        textDecoration: "none",
        transition: "all 0.2s ease",
        justifyContent: collapsed ? "center" : "flex-start",
        position: "relative",
      }}
      onMouseEnter={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = tokens.bgHover;
          e.currentTarget.style.color = tokens.textPrimary;
        }
      }}
      onMouseLeave={(e) => {
        if (!isActive) {
          e.currentTarget.style.backgroundColor = "transparent";
          e.currentTarget.style.color = tokens.textSecondary;
        }
      }}
      title={collapsed ? label : undefined}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        style={{ flexShrink: 0 }}
      >
        <path d={icon} />
      </svg>
      {!collapsed && (
        <span
          style={{
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {label}
        </span>
      )}
      {isActive && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: "50%",
            transform: "translateY(-50%)",
            width: "3px",
            height: "24px",
            backgroundColor: tokens.accent,
            borderRadius: "0 2px 2px 0",
          }}
        />
      )}
    </Link>
  );
}


