"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { tokens } from "@/components/theme/tokens";
import type { EventCategory, FlyerUpdate } from "@/lib/api/flyers";

const CATEGORY_OPTIONS: Array<{ value: EventCategory; label: string }> = [
  { value: "Reggae", label: "Reggae" },
  { value: "Dub", label: "Dub" },
];

type FlyerEventDetailsCardProps = {
  eventCategory: EventCategory | null;
  eventTicketLink: string | null;
  isSaving: boolean;
  onSave: (data: FlyerUpdate) => Promise<boolean>;
};

export function FlyerEventDetailsCard({
  eventCategory,
  eventTicketLink,
  isSaving,
  onSave,
}: FlyerEventDetailsCardProps) {
  const [category, setCategory] = useState<EventCategory | "">(eventCategory ?? "");
  const [ticketLink, setTicketLink] = useState(eventTicketLink ?? "");

  useEffect(() => {
    setCategory(eventCategory ?? "");
    setTicketLink(eventTicketLink ?? "");
  }, [eventCategory, eventTicketLink]);

  const normalizedTicketLink = ticketLink.trim();
  const originalTicketLink = (eventTicketLink ?? "").trim();
  const hasChanges =
    (category || null) !== (eventCategory ?? null) ||
    normalizedTicketLink !== originalTicketLink;

  async function handleSave() {
    const update: FlyerUpdate = {};

    if ((category || null) !== (eventCategory ?? null)) {
      update.event_category = category ? category : null;
    }
    if (normalizedTicketLink !== originalTicketLink) {
      update.event_ticket_link = normalizedTicketLink || null;
    }

    if (Object.keys(update).length === 0) {
      return;
    }

    await onSave(update);
  }

  return (
    <Card
      style={{
        backgroundColor: tokens.bgElevated,
        border: `1px solid ${tokens.border}`,
        borderRadius: "16px",
        padding: "24px",
      }}
    >
      <h2
        style={{
          fontSize: "18px",
          fontWeight: 600,
          color: tokens.textPrimary,
          margin: "0 0 4px 0",
        }}
      >
        Event Details
      </h2>
      <p
        style={{
          fontSize: "14px",
          color: tokens.textSecondary,
          margin: "0 0 20px 0",
        }}
      >
        Optional fields used when posting to WordPress. Not filled by extraction.
      </p>

      <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            htmlFor="event-category"
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: tokens.textSecondary,
            }}
          >
            Event Category
          </label>
          <select
            id="event-category"
            value={category}
            onChange={(e) =>
              setCategory(e.target.value as EventCategory | "")
            }
            style={{
              padding: "10px 32px 10px 14px",
              fontSize: "14px",
              backgroundColor: tokens.bgHover,
              color: tokens.textPrimary,
              border: `1px solid ${tokens.border}`,
              borderRadius: "8px",
              outline: "none",
              cursor: "pointer",
              appearance: "none",
              backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 24 24' fill='none' stroke='%23888' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
              backgroundRepeat: "no-repeat",
              backgroundPosition: "right 12px center",
            }}
          >
            <option value="">Select category</option>
            {CATEGORY_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <label
            htmlFor="event-ticket-link"
            style={{
              fontSize: "13px",
              fontWeight: 600,
              color: tokens.textSecondary,
            }}
          >
            Event Ticket Link
          </label>
          <Input
            id="event-ticket-link"
            type="url"
            placeholder="https://..."
            value={ticketLink}
            onChange={(e) => setTicketLink(e.target.value)}
          />
        </div>

        <div style={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="secondary"
            onClick={handleSave}
            disabled={!hasChanges || isSaving}
          >
            {isSaving ? "Saving..." : "Save Event Details"}
          </Button>
        </div>
      </div>
    </Card>
  );
}
