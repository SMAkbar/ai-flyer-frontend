"use client";

import type { MouseEventHandler } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { tokens } from "@/components/theme/tokens";
import {
  DashboardIcon,
  FlyersIcon,
  ProfileIcon,
  ThemeIcon,
  MenuIcon,
  ChevronLeftIcon,
  ClockIcon,
  type IconProps,
} from "@/components/icons";

export type SidebarProps = {
  collapsed: boolean;
  onToggle: MouseEventHandler<HTMLButtonElement>;
};

type NavItemIcon = React.ComponentType<IconProps>;

const navItems: Array<{ href: string; label: string; Icon: NavItemIcon }> = [
  { href: "/dashboard", label: "Dashboard", Icon: DashboardIcon },
  { href: "/flyers", label: "Flyers", Icon: FlyersIcon },
  { href: "/schedules", label: "Schedules", Icon: ClockIcon },
  { href: "/profile", label: "Profile", Icon: ProfileIcon },
];

const themeItem = {
  href: "/theme",
  label: "Theme",
  Icon: ThemeIcon,
};

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
          gap: collapsed ? "0" : "12px",
          padding: collapsed ? "0 8px" : "0 16px",
          borderBottom: `1px solid ${tokens.border}`,
          justifyContent: collapsed ? "center" : "flex-start",
        }}
      >
        {!collapsed && (
          <button
            aria-label="Collapse sidebar"
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
              flexShrink: 0,
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
            <ChevronLeftIcon size={20} color="currentColor" />
          </button>
        )}
        {collapsed ? (
          <button
            aria-label="Expand sidebar"
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
              flexShrink: 0,
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
            <MenuIcon size={20} color="currentColor" />
          </button>
        ) : null}
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
            Icon={item.Icon}
            collapsed={collapsed}
          />
        ))}
        <div style={{ marginTop: "auto", paddingTop: "4px" }}>
          <SidebarItem
            href={themeItem.href}
            label={themeItem.label}
            Icon={themeItem.Icon}
            collapsed={collapsed}
          />
        </div>
      </nav>
    </aside>
  );
}

type SidebarItemProps = {
  href: string;
  label: string;
  Icon: NavItemIcon;
  collapsed: boolean;
};

function SidebarItem({ href, label, Icon, collapsed }: SidebarItemProps) {
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
      <Icon size={20} color="currentColor" style={{ flexShrink: 0 }} />
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


