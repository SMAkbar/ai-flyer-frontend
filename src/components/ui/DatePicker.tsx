"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "./Input";
import { tokens } from "../theme/tokens";

type DatePickerProps = {
  value: string | null;  // ISO date string (YYYY-MM-DD) or null
  onChange: (isoDateString: string | null) => void;
  disabled?: boolean;
  placeholder?: string;
  min?: string;
  clearable?: boolean;
  style?: React.CSSProperties;
};

/**
 * Format a date object to a localized display string (e.g., "15 January 2025")
 */
function formatDateForDisplay(dateStr: string | null): string {
  if (!dateStr) return "";
  try {
    const date = new Date(dateStr + "T00:00:00");  // Parse as local date
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  } catch {
    return "";
  }
}

/**
 * DatePicker component for selecting dates.
 * Shows a calendar picker when clicked, with a formatted date display.
 */
export function DatePicker({
  value,
  onChange,
  disabled = false,
  placeholder = "Select date",
  min,
  clearable = false,
  style,
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dateInputRef = useRef<HTMLInputElement>(null);
  const displayInputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  // Display formatted date (e.g., "15 January 2025")
  const displayValue = formatDateForDisplay(value);
  const showClear = clearable && Boolean(value) && !disabled;

  const handleClear = (e: React.MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();
    onChange(null);
    setIsOpen(false);
  };
  
  // Handle native date input change
  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    if (newValue) {
      onChange(newValue);  // Already in YYYY-MM-DD format
    } else {
      onChange(null);
    }
    setIsOpen(false);
  };
  
  // Open date picker when clicking on display input
  const handleDisplayClick = () => {
    if (disabled) return;
    
    if (dateInputRef.current) {
      // Focus and open the native date picker
      dateInputRef.current.focus();
      if (typeof dateInputRef.current.showPicker === "function") {
        try {
          dateInputRef.current.showPicker();
        } catch {
          // If showPicker fails, clicking the input will handle it
        }
      }
    }
    setIsOpen(true);
  };
  
  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Allow Tab, Escape, Enter, and Arrow keys for navigation
    if (
      e.key === "Tab" ||
      e.key === "Escape" ||
      e.key === "Enter" ||
      e.key.startsWith("Arrow") ||
      e.key === "Home" ||
      e.key === "End"
    ) {
      return;
    }
    // Prevent direct typing - only allow picker selection
    e.preventDefault();
    e.stopPropagation();
  };
  
  // Close picker when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  return (
    <div ref={containerRef} style={{ position: "relative", ...style }}>
      {/* Display input (shows formatted date) */}
      <Input
        ref={displayInputRef}
        type="text"
        value={displayValue}
        onClick={handleDisplayClick}
        onKeyDown={handleKeyDown}
        readOnly
        disabled={disabled}
        placeholder={placeholder}
        style={{
          cursor: disabled ? "not-allowed" : "pointer",
          backgroundColor: tokens.bgElevated,
          paddingRight: showClear ? "36px" : undefined,
        }}
      />

      {showClear && (
        <button
          type="button"
          onClick={handleClear}
          aria-label="Clear date"
          style={{
            position: "absolute",
            right: "10px",
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "20px",
            height: "20px",
            padding: 0,
            border: "none",
            borderRadius: "999px",
            background: "transparent",
            color: tokens.textMuted,
            cursor: "pointer",
            zIndex: 2,
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = tokens.textPrimary;
            e.currentTarget.style.backgroundColor = `${tokens.textMuted}20`;
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = tokens.textMuted;
            e.currentTarget.style.backgroundColor = "transparent";
          }}
        >
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M3 3L9 9M9 3L3 9"
              stroke="currentColor"
              strokeWidth="1.75"
              strokeLinecap="round"
            />
          </svg>
        </button>
      )}
      
      {/* Hidden native date input for picker functionality */}
      <input
        ref={dateInputRef}
        type="date"
        value={value || ""}
        min={min}
        onChange={handleDateChange}
        onBlur={() => setIsOpen(false)}
        disabled={disabled}
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          width: showClear ? "calc(100% - 36px)" : "100%",
          height: "100%",
          opacity: 0,
          cursor: disabled ? "not-allowed" : "pointer",
          pointerEvents: isOpen ? "auto" : "none",
        }}
        tabIndex={-1}
      />
    </div>
  );
}
