"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { tokens } from "@/components/theme/tokens";
import { ProfileIcon, LogoutIcon } from "@/components/icons";

type UserMenuProps = {
  userEmail?: string;
};

export function UserMenu({ userEmail }: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Close menu when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => {
        document.removeEventListener("mousedown", handleClickOutside);
      };
    }
  }, [isOpen]);

  // Close menu on Escape key
  useEffect(() => {
    function handleEscape(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setIsOpen(false);
      }
    }

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => {
        document.removeEventListener("keydown", handleEscape);
      };
    }
  }, [isOpen]);

  function handleLogout() {
    // Clear the token cookie
    document.cookie = "token=; Path=/; Expires=Thu, 01 Jan 1970 00:00:01 GMT;";
    router.push("/login");
  }

  const getInitials = (email: string) => {
    return email
      .split("@")[0]
      .split(".")
      .map((part) => part[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <div ref={menuRef} style={{ position: "relative" }}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        aria-label="User menu"
        aria-expanded={isOpen}
        style={{
          display: "inline-flex",
          alignItems: "center",
          justifyContent: "center",
          width: "40px",
          height: "40px",
          borderRadius: "10px",
          border: `1px solid ${isOpen ? tokens.accent : tokens.border}`,
          backgroundColor: isOpen ? `${tokens.accent}15` : "transparent",
          color: tokens.textPrimary,
          cursor: "pointer",
          transition: "all 0.2s ease",
          fontWeight: 600,
          fontSize: "14px",
        }}
        onMouseEnter={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = tokens.bgHover;
            e.currentTarget.style.borderColor = tokens.accent;
          }
        }}
        onMouseLeave={(e) => {
          if (!isOpen) {
            e.currentTarget.style.backgroundColor = "transparent";
            e.currentTarget.style.borderColor = tokens.border;
          }
        }}
      >
        {userEmail ? (
          <span>{getInitials(userEmail)}</span>
        ) : (
          <ProfileIcon size={20} color="currentColor" />
        )}
      </button>

      {isOpen && (
        <div
          style={{
            position: "absolute",
            right: 0,
            top: "calc(100% + 8px)",
            width: "240px",
            borderRadius: "12px",
            border: `1px solid ${tokens.border}`,
            backgroundColor: tokens.bgElevated,
            boxShadow: "0 8px 32px rgba(0, 0, 0, 0.4)",
            zIndex: 50,
            overflow: "hidden",
            animation: "slideDown 0.2s ease",
          }}
        >
          <div style={{ padding: "8px" }}>
            {userEmail && (
              <div
                style={{
                  padding: "12px 16px",
                  fontSize: "13px",
                  color: tokens.textSecondary,
                  borderBottom: `1px solid ${tokens.border}`,
                  marginBottom: "4px",
                  fontWeight: 500,
                }}
              >
                {userEmail}
              </div>
            )}
            <Link
              href="/profile"
              onClick={() => setIsOpen(false)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                padding: "12px 16px",
                fontSize: "14px",
                color: tokens.textPrimary,
                textDecoration: "none",
                borderRadius: "8px",
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = tokens.bgHover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <ProfileIcon size={18} color="currentColor" />
              Profile
            </Link>
            <button
              onClick={handleLogout}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                width: "100%",
                textAlign: "left",
                padding: "12px 16px",
                fontSize: "14px",
                color: tokens.danger,
                backgroundColor: "transparent",
                border: "none",
                borderRadius: "8px",
                cursor: "pointer",
                transition: "all 0.2s ease",
                fontFamily: "inherit",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = `${tokens.danger}15`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = "transparent";
              }}
            >
              <LogoutIcon size={18} color="currentColor" />
              Logout
            </button>
          </div>
        </div>
      )}

      <style jsx>{`
        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-8px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

