"use client";

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import type { DayCellContentArg, EventHoveringArg } from "@fullcalendar/core";
import type { DateClickArg } from "@fullcalendar/interaction";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { DateTimePicker } from "@/components/ui/DateTimePicker";
import { LoadingSpinner } from "@/components/ui/LoadingSpinner";
import { tokens } from "@/components/theme/tokens";
import { instagramApi, type ScheduledPostSlot } from "@/lib/api/instagram";
import styles from "./InstaScheduleCal.module.css";

const MIN_SCHEDULE_LEAD_MS = 60_000;

export type InstaScheduleCalProps = {
  disabled?: boolean;
  /** ISO datetime from the posting form — shown on the calendar only after the editor is confirmed. */
  selectedScheduledAt?: string;
  /** Updates the same `scheduledAt` state as the Date & Time fields. */
  onSelectScheduledAt?: (iso: string) => void;
  /** Title for the confirmed draft event chip (e.g. flyer / “Carousel”). */
  selectionEventTitle?: string;
};

type SlotEventExtendedProps = {
  flyerName: string;
  timeslotIso: string;
};

type HoverSlotTooltipState = {
  left: number;
  top: number;
  title: string;
  dateTimeLabel: string;
};

type PendingScheduleEditorState = {
  left: number;
  top: number;
  /** Local draft as ISO — same shape as the main form `DateTimePicker`. */
  draftIso: string;
};

function toYMDLocal(d: Date): string {
  const y = d.getFullYear();
  const mo = String(d.getMonth() + 1).padStart(2, "0");
  const da = String(d.getDate()).padStart(2, "0");
  return `${y}-${mo}-${da}`;
}

function getTimeHHMMFromIso(iso: string | undefined): string {
  if (!iso) return "12:00";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "12:00";
  return `${String(d.getHours()).padStart(2, "0")}:${String(d.getMinutes()).padStart(2, "0")}`;
}

function getMinScheduleAfterNow(): Date {
  return new Date(Date.now() + MIN_SCHEDULE_LEAD_MS);
}

/** Build ISO from calendar day + HH:mm in local timezone (same as `DateTimePicker` combine path). */
function isoFromLocalDateAndHHMM(dateStr: string, hhmm: string): string {
  const d = new Date(`${dateStr}T${hhmm}`);
  if (Number.isNaN(d.getTime())) {
    return new Date(`${dateStr}T12:00`).toISOString();
  }
  return d.toISOString();
}

/** Same pattern as `ScheduledPostsCard` — local datetime, short month. */
function formatSlotDateTime(iso: string): string {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return iso;
  return date.toLocaleString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isPastCalendarDay(cellDate: Date): boolean {
  const cell = new Date(
    cellDate.getFullYear(),
    cellDate.getMonth(),
    cellDate.getDate()
  );
  const today = new Date();
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate()
  );
  return cell.getTime() < todayStart.getTime();
}

function layoutPopoverPosition(
  clientX: number,
  clientY: number,
  estWidth = 288,
  estHeight = 96
) {
  const offset = 14;
  if (typeof window === "undefined") {
    return { left: clientX + offset, top: clientY + offset };
  }
  let left = clientX + offset;
  let top = clientY + offset;
  left = Math.min(left, window.innerWidth - estWidth - 12);
  top = Math.min(top, window.innerHeight - estHeight - 12);
  left = Math.max(8, left);
  top = Math.max(8, top);
  return { left, top };
}

/**
 * Instagram schedule month view. Theme matches app tokens (Geist, dark surfaces, accent).
 */
export function InstaScheduleCal({
  disabled = false,
  selectedScheduledAt,
  onSelectScheduledAt,
  selectionEventTitle = "Your scheduled time",
}: InstaScheduleCalProps) {
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [scheduledSlots, setScheduledSlots] = useState<ScheduledPostSlot[]>([]);
  const [hoverTooltip, setHoverTooltip] = useState<HoverSlotTooltipState | null>(
    null
  );
  const [pendingScheduleEditor, setPendingScheduleEditor] =
    useState<PendingScheduleEditorState | null>(null);
  const [scheduleEditorError, setScheduleEditorError] = useState<string | null>(
    null
  );
  const slotsRequestIdRef = useRef(0);

  useEffect(() => {
    if (disabled) {
      setScheduledSlots([]);
      setSlotsLoading(false);
      return;
    }

    const requestId = ++slotsRequestIdRef.current;
    setSlotsLoading(true);

    const now = new Date();
    const rangeStart = new Date(now);
    rangeStart.setDate(rangeStart.getDate() - 14);
    const rangeEnd = new Date(now);
    rangeEnd.setMonth(rangeEnd.getMonth() + 1);

    void (async () => {
      const res = await instagramApi.getScheduledSlotsInRange(
        rangeStart.toISOString(),
        rangeEnd.toISOString()
      );

      if (slotsRequestIdRef.current !== requestId) return;

      setSlotsLoading(false);
      if (res.ok) {
        setScheduledSlots(res.data.slots);
      } else {
        setScheduledSlots([]);
      }
    })();
  }, [disabled]);

  useEffect(() => {
    setHoverTooltip(null);
  }, [scheduledSlots]);

  useEffect(() => {
    if (!hoverTooltip && !pendingScheduleEditor) return;
    const onScrollOrResize = () => {
      setHoverTooltip(null);
      setPendingScheduleEditor(null);
      setScheduleEditorError(null);
    };
    window.addEventListener("scroll", onScrollOrResize, true);
    window.addEventListener("resize", onScrollOrResize);
    return () => {
      window.removeEventListener("scroll", onScrollOrResize, true);
      window.removeEventListener("resize", onScrollOrResize);
    };
  }, [hoverTooltip, pendingScheduleEditor]);

  useEffect(() => {
    if (!pendingScheduleEditor) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setPendingScheduleEditor(null);
        setScheduleEditorError(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [pendingScheduleEditor]);

  const closeScheduleEditor = useCallback(() => {
    setPendingScheduleEditor(null);
    setScheduleEditorError(null);
  }, []);

  const handleEventMouseEnter = useCallback((arg: EventHoveringArg) => {
    const ep = arg.event.extendedProps as Partial<SlotEventExtendedProps>;
    if (typeof ep.flyerName !== "string" || typeof ep.timeslotIso !== "string") {
      return;
    }
    const { left, top } = layoutPopoverPosition(
      arg.jsEvent.clientX,
      arg.jsEvent.clientY
    );
    setHoverTooltip({
      left,
      top,
      title: ep.flyerName,
      dateTimeLabel: formatSlotDateTime(ep.timeslotIso),
    });
  }, []);

  const handleEventMouseLeave = useCallback(() => {
    setHoverTooltip(null);
  }, []);

  const handleDateClick = useCallback(
    (arg: DateClickArg) => {
      if (disabled || !onSelectScheduledAt) return;
      if (isPastCalendarDay(arg.date)) return;
      setHoverTooltip(null);
      const dateStr = toYMDLocal(arg.date);
      const hhmm = getTimeHHMMFromIso(selectedScheduledAt);
      const draftIso = isoFromLocalDateAndHHMM(dateStr, hhmm);
      const { left, top } = layoutPopoverPosition(
        arg.jsEvent.clientX,
        arg.jsEvent.clientY,
        320,
        260
      );
      setScheduleEditorError(null);
      setPendingScheduleEditor({ left, top, draftIso });
    },
    [disabled, onSelectScheduledAt, selectedScheduledAt]
  );

  const handleDraftPickerChange = useCallback((iso: string) => {
    setScheduleEditorError(null);
    setPendingScheduleEditor((prev) =>
      prev ? { ...prev, draftIso: iso } : null
    );
  }, []);

  const handleConfirmScheduleSlot = useCallback(() => {
    if (!pendingScheduleEditor || !onSelectScheduledAt) return;
    const d = new Date(pendingScheduleEditor.draftIso);
    if (Number.isNaN(d.getTime())) {
      setScheduleEditorError("Invalid date or time.");
      return;
    }
    const minDt = getMinScheduleAfterNow();
    if (d.getTime() <= minDt.getTime()) {
      setScheduleEditorError(
        "Choose a time after the current moment (at least one minute ahead)."
      );
      return;
    }
    onSelectScheduledAt(d.toISOString());
    closeScheduleEditor();
  }, [pendingScheduleEditor, onSelectScheduledAt, closeScheduleEditor]);

  const scheduleEditorMinIso = useMemo(() => {
    if (!pendingScheduleEditor) return undefined;
    return new Date(Date.now() + MIN_SCHEDULE_LEAD_MS).toISOString();
  }, [pendingScheduleEditor?.draftIso]);

  const dayCellClassNames = useCallback(
    (arg: DayCellContentArg) => {
      if (disabled || !onSelectScheduledAt) return [];
      return isPastCalendarDay(arg.date)
        ? [styles.dayCellPast]
        : [styles.dayCellSelectable];
    },
    [disabled, onSelectScheduledAt]
  );

  const navigationValidRange = useMemo(() => {
    const now = new Date();
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 2, 1);
    return { start, end };
  }, []);

  const calendarEvents = useMemo(() => {
    const apiEvents = scheduledSlots.map((slot, index) => ({
      id: `scheduled-slot-${slot.timeslot}-${index}`,
      title: slot.flyer_name,
      start: slot.timeslot,
      allDay: false,
      editable: false,
      startEditable: false,
      durationEditable: false,
      classNames: [styles.slotEvent],
      extendedProps: {
        flyerName: slot.flyer_name,
        timeslotIso: slot.timeslot,
      } satisfies SlotEventExtendedProps,
    }));

    if (
      !onSelectScheduledAt ||
      !selectedScheduledAt ||
      Number.isNaN(new Date(selectedScheduledAt).getTime())
    ) {
      return apiEvents;
    }

    const draft = {
      id: "draft-user-scheduled-at",
      title: selectionEventTitle,
      start: selectedScheduledAt,
      allDay: false,
      editable: false,
      startEditable: false,
      durationEditable: false,
      classNames: [styles.selectionEvent],
      extendedProps: {
        flyerName: selectionEventTitle,
        timeslotIso: selectedScheduledAt,
      } satisfies SlotEventExtendedProps,
    };

    return [...apiEvents, draft];
  }, [
    onSelectScheduledAt,
    scheduledSlots,
    selectedScheduledAt,
    selectionEventTitle,
  ]);

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
      ["--insta-cal-slot-bg" as string]: "#2E2E2E",
      ["--insta-cal-slot-border" as string]: tokens.border,
      ["--insta-cal-slot-text" as string]: "#FFFFFF",
      ["--insta-cal-selection-text" as string]: tokens.textPrimary,
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
        {slotsLoading ? (
          <div className={styles.loadingOverlay} aria-busy="true" aria-live="polite">
            <LoadingSpinner message="Loading schedule…" size={22} />
          </div>
        ) : null}
        <FullCalendar
          plugins={[dayGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          validRange={navigationValidRange}
          headerToolbar={{
            left: "prev,next today",
            center: "title",
            right: "",
          }}
          events={calendarEvents}
          editable={false}
          selectable={false}
          eventStartEditable={false}
          eventDurationEditable={false}
          dayMaxEvents={4}
          moreLinkClick="popover"
          height="auto"
          dateClick={handleDateClick}
          dayCellClassNames={dayCellClassNames}
          eventMouseEnter={handleEventMouseEnter}
          eventMouseLeave={handleEventMouseLeave}
        />
      </div>
      {typeof document !== "undefined" &&
        hoverTooltip &&
        createPortal(
          <div
            role="tooltip"
            className={styles.slotPopover}
            style={{
              left: hoverTooltip.left,
              top: hoverTooltip.top,
              backgroundColor: tokens.bgElevated,
              borderColor: tokens.border,
            }}
          >
            <div
              className={styles.slotPopoverTitle}
              style={{ color: tokens.textPrimary }}
            >
              {hoverTooltip.title}
            </div>
            <div
              className={styles.slotPopoverMeta}
              style={{ color: tokens.textSecondary }}
            >
              {hoverTooltip.dateTimeLabel}
            </div>
          </div>,
          document.body
        )}
      {typeof document !== "undefined" &&
        pendingScheduleEditor &&
        createPortal(
          <>
            <div
              className={styles.scheduleBackdrop}
              aria-hidden
              onClick={closeScheduleEditor}
            />
            <div
              role="dialog"
              aria-modal="true"
              aria-labelledby="insta-schedule-editor-title"
              className={styles.scheduleEditorPopover}
              style={{
                left: pendingScheduleEditor.left,
                top: pendingScheduleEditor.top,
                backgroundColor: tokens.bgElevated,
                borderColor: tokens.border,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3
                id="insta-schedule-editor-title"
                className={styles.scheduleEditorTitle}
                style={{ color: tokens.textPrimary }}
              >
                Schedule post
              </h3>
              <p
                className={styles.scheduleEditorSubtitle}
                style={{ color: tokens.textSecondary }}
              >
                {selectionEventTitle}
              </p>

              <div style={{ marginBottom: 4, width: "100%" }}>
                <DateTimePicker
                  value={pendingScheduleEditor.draftIso}
                  onChange={handleDraftPickerChange}
                  min={scheduleEditorMinIso}
                  dateFieldDisabled
                  autoFocusTime={!!pendingScheduleEditor}
                  fieldLayout="stacked"
                />
              </div>

              {scheduleEditorError ? (
                <p
                  role="alert"
                  className={styles.scheduleEditorError}
                  style={{ color: tokens.danger }}
                >
                  {scheduleEditorError}
                </p>
              ) : null}

              <div style={{ marginTop: "15px "}} className={styles.scheduleEditorActions}>
                <Button type="button" variant="secondary" onClick={closeScheduleEditor}>
                  Cancel
                </Button>
                <Button type="button" variant="primary" onClick={handleConfirmScheduleSlot}>
                  Confirm
                </Button>
              </div>
            </div>
          </>,
          document.body
        )}
    </Card>
  );
}
