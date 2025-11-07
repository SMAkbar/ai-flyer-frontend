"use client";

import type { MouseEventHandler } from "react";
import Image from "next/image";
import { UserMenu } from "./UserMenu";
import { tokens } from "@/components/theme/tokens";
import { MenuIcon } from "@/components/icons";

export type HeaderProps = {
  onToggleSidebar: MouseEventHandler<HTMLButtonElement>;
  userEmail?: string;
};

export function Header({ onToggleSidebar, userEmail }: HeaderProps) {
  return (
    <header
      style={{
        height: "56px",
        position: "sticky",
        top: 0,
        zIndex: 10,
        backgroundColor: tokens.bgElevated,
        borderBottom: `1px solid ${tokens.border}`,
        backdropFilter: "blur(8px)",
        WebkitBackdropFilter: "blur(8px)",
      }}
    >
      <div
        style={{
          height: "100%",
          display: "flex",
          alignItems: "center",
          gap: "12px",
          padding: "0 20px",
        }}
      >
        <button
          aria-label="Toggle sidebar"
          onClick={onToggleSidebar}
          style={{
            display: "none",
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
          <MenuIcon size={20} color="currentColor" />
        </button>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <div
            style={{
              position: "relative",
              width: "36px",
              height: "36px",
              flexShrink: 0,
            }}
          >
            <Image
              src="/dub-events-logo.png"
              alt="Dub Events UK"
              fill
              style={{ objectFit: "contain" }}
              priority
            />
          </div>
          <div
            style={{
              display: "flex",
              flexDirection: "column",
              gap: "2px",
            }}
          >
            <div
              style={{
                fontSize: "16px",
                fontWeight: 700,
                color: tokens.textPrimary,
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              Dub Events Dashboard
            </div>
            <div
              style={{
                fontSize: "11px",
                fontWeight: 400,
                color: tokens.textSecondary,
                letterSpacing: "0.01em",
                lineHeight: 1.2,
              }}
            >
              Event Management & Automation
            </div>
          </div>
        </div>
        <div
          style={{
            marginLeft: "auto",
            display: "flex",
            alignItems: "center",
            gap: "8px",
          }}
        >
          <UserMenu userEmail={userEmail} />
        </div>
      </div>

      <style jsx>{`
        @media (max-width: 768px) {
          button {
            display: inline-flex !important;
          }
        }
      `}</style>
    </header>
  );
}


