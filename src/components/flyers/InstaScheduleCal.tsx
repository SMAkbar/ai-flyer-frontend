"use client";

import React, { useMemo } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Card } from "@/components/ui/Card";
import { tokens } from "@/components/theme/tokens";
import styles from "./InstaScheduleCal.module.css";

export type InstaScheduleCalProps = {
  disabled?: boolean;
};

/**
 * Instagram schedule month view. Theme matches app tokens (Geist, dark surfaces, accent).
 */
export function InstaScheduleCal({
  disabled = false,
}: InstaScheduleCalProps) {

  const themeVars = useMemo(() => {
    const accentSoft = "rgba(229, 9, 20, 0.14)";
    const accentTint = "rgba(229, 9, 20, 0.12)";
    const todayBg = "rgba(255, 255, 255, 0.04)";
    return {
      ["--insta-cal-accent-soft" as string]: accentSoft,
      ["--insta-cal-accent-tint" as string]: accentTint,
      ["--insta-cal-accent" as string]: tokens.accent,
      ["--insta-cal-today-bg" as string]: todayBg,
      ["--insta-cal-today-text" as string]: tokens.textSecondary,
      ["--fc-page-bg-color" as string]: tokens.bgBase,
      ["--fc-neutral-bg-color" as string]: tokens.bgElevated,
      ["--fc-neutral-text-color" as string]: tokens.textMuted,
      ["--fc-border-color" as string]: tokens.border,
      ["--fc-button-text-color" as string]: tokens.textPrimary,
      ["--fc-button-bg-color" as string]: tokens.bgElevated,
      ["--fc-button-border-color" as string]: tokens.border,
      ["--fc-button-hover-bg-color" as string]: tokens.bgHover,
      ["--fc-button-hover-border-color" as string]: tokens.border,
      ["--fc-button-active-bg-color" as string]: tokens.bgHover,
      ["--fc-button-active-border-color" as string]: tokens.accent,
      ["--fc-highlight-color" as string]: "rgba(229, 9, 20, 0.22)",
      ["--fc-today-bg-color" as string]: "transparent",
      ["--fc-now-indicator-color" as string]: tokens.accent,
    } as React.CSSProperties;
  }, []);

  return (
    <Card
      style={{
        padding: 16,
        backgroundColor: tokens.bgElevated,
        border: `1px solid ${tokens.border}`,
        borderRadius: 12,
        opacity: disabled ? 0.6 : 1,
        pointerEvents: disabled ? "none" : "auto",
      }}
    >
      <div className={styles.calWrap} style={{ ...themeVars, minHeight: 480 }}>
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "",
          }}
          events={[]}
          height="auto"
        />
      </div>
    </Card>
  );
}
