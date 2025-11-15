"use client";

import React, { useState, useEffect, useRef } from "react";
import { Input } from "./Input";
import { tokens } from "../theme/tokens";

type DateTimePickerProps = {
  value: string; // ISO datetime string
  onChange: (isoString: string) => void;
  disabled?: boolean;
  min?: string; // ISO datetime string for minimum date/time
};

export function DateTimePicker({
  value,
  onChange,
  disabled = false,
  min,
}: DateTimePickerProps) {
  // Parse the ISO datetime string into date and time parts
  const getDateValue = (isoString: string): string => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      // Convert to local date string in YYYY-MM-DD format
      const year = date.getFullYear();
      const month = String(date.getMonth() + 1).padStart(2, "0");
      const day = String(date.getDate()).padStart(2, "0");
      return `${year}-${month}-${day}`;
    } catch {
      return "";
    }
  };

  const getTimeValue = (isoString: string): string => {
    if (!isoString) return "";
    try {
      const date = new Date(isoString);
      // Convert to local time string in HH:MM format
      const hours = String(date.getHours()).padStart(2, "0");
      const minutes = String(date.getMinutes()).padStart(2, "0");
      return `${hours}:${minutes}`;
    } catch {
      return "";
    }
  };

  const [dateValue, setDateValue] = useState<string>(getDateValue(value));
  const [timeValue, setTimeValue] = useState<string>(getTimeValue(value));
  const dateInputRef = useRef<HTMLInputElement>(null);
  const timeInputRef = useRef<HTMLInputElement>(null);

  // Update local state when value prop changes
  useEffect(() => {
    setDateValue(getDateValue(value));
    setTimeValue(getTimeValue(value));
  }, [value]);

  // Handle date input click - open calendar picker
  const handleDateInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    if (dateInputRef.current && !disabled) {
      // Try to use showPicker() immediately (requires user gesture)
      if (typeof dateInputRef.current.showPicker === "function") {
        try {
          dateInputRef.current.showPicker();
        } catch {
          // If showPicker fails, the native input will handle the click
        }
      }
      // If showPicker is not available, native input will handle the click
    }
  };

  // Handle date input focus - open calendar picker
  const handleDateInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Open picker when focused via keyboard (Tab key)
    if (dateInputRef.current && !disabled) {
      // Small delay to ensure focus is set and avoid conflicts
      setTimeout(() => {
        if (dateInputRef.current && document.activeElement === dateInputRef.current) {
          openDatePicker();
        }
      }, 100);
    }
  };

  const openDatePicker = () => {
    if (dateInputRef.current && !disabled) {
      // Try to use showPicker() if available (modern browsers)
      if (typeof dateInputRef.current.showPicker === "function") {
        try {
          const result = dateInputRef.current.showPicker() as unknown;
          // showPicker() may return a Promise in some browsers
          if (result && typeof result === "object" && "catch" in result) {
            (result as Promise<void>).catch(() => {
              // Fallback if showPicker fails - do nothing, let native behavior handle it
            });
          }
        } catch {
          // If showPicker throws, let native behavior handle it
        }
      }
      // If showPicker is not available, native input will handle click/focus
    }
  };

  // Handle time input click - open time picker
  const handleTimeInputClick = (e: React.MouseEvent<HTMLInputElement>) => {
    if (timeInputRef.current && !disabled) {
      // Try to use showPicker() immediately (requires user gesture)
      if (typeof timeInputRef.current.showPicker === "function") {
        try {
          timeInputRef.current.showPicker();
        } catch {
          // If showPicker fails, the native input will handle the click
        }
      }
      // If showPicker is not available, native input will handle the click
    }
  };

  // Handle time input focus - open time picker
  const handleTimeInputFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    // Open picker when focused via keyboard (Tab key)
    if (timeInputRef.current && !disabled) {
      // Small delay to ensure focus is set and avoid conflicts
      setTimeout(() => {
        if (timeInputRef.current && document.activeElement === timeInputRef.current) {
          openTimePicker();
        }
      }, 100);
    }
  };

  const openTimePicker = () => {
    if (timeInputRef.current && !disabled) {
      // Try to use showPicker() if available (modern browsers)
      if (typeof timeInputRef.current.showPicker === "function") {
        try {
          const result = timeInputRef.current.showPicker() as unknown;
          // showPicker() may return a Promise in some browsers
          if (result && typeof result === "object" && "catch" in result) {
            (result as Promise<void>).catch(() => {
              // Fallback if showPicker fails - do nothing, let native behavior handle it
            });
          }
        } catch {
          // If showPicker throws, let native behavior handle it
        }
      }
      // If showPicker is not available, native input will handle click/focus
    }
  };

  // Prevent keyboard input - only allow navigation keys
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
    // Prevent all other keyboard input (numbers, letters, etc.)
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newDate = e.target.value;
    if (newDate) {
      setDateValue(newDate);
      handleDateTimeChange(newDate, timeValue);
    }
  };

  const handleTimeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = e.target.value;
    if (newTime) {
      setTimeValue(newTime);
      handleDateTimeChange(dateValue, newTime);
    }
  };

  const handleDateTimeChange = (newDate: string, newTime: string) => {
    if (newDate && newTime) {
      // Combine date and time into a single datetime
      const combined = `${newDate}T${newTime}`;
      const date = new Date(combined);
      
      // Validate that the datetime is not in the past
      if (min && date < new Date(min)) {
        // If the combined datetime is in the past, adjust to minimum
        const minDateObj = new Date(min);
        const minDateStr = getDateValue(min);
        const minTimeStr = getTimeValue(min);
        setDateValue(minDateStr);
        setTimeValue(minTimeStr);
        onChange(minDateObj.toISOString());
      } else {
        onChange(date.toISOString());
      }
    } else if (newDate) {
      // If only date is set, use current time or minimum time if date is today
      const today = getDateValue(new Date().toISOString());
      if (newDate === today && min) {
        // If selecting today, use minimum time
        const minTimeStr = getTimeValue(min);
        setTimeValue(minTimeStr);
        const date = new Date(`${newDate}T${minTimeStr}`);
        onChange(date.toISOString());
      } else {
        // Use current time
        const currentTime = getTimeValue(new Date().toISOString());
        setTimeValue(currentTime);
        const date = new Date(`${newDate}T${currentTime}`);
        onChange(date.toISOString());
      }
    } else if (newTime) {
      // If only time is set, use today's date
      const today = getDateValue(new Date().toISOString());
      setDateValue(today);
      const date = new Date(`${today}T${newTime}`);
      
      // Validate that the datetime is not in the past
      if (min && date < new Date(min)) {
        // If the time is in the past, adjust to minimum
        const minDateObj = new Date(min);
        const minDateStr = getDateValue(min);
        const minTimeStr = getTimeValue(min);
        setDateValue(minDateStr);
        setTimeValue(minTimeStr);
        onChange(minDateObj.toISOString());
      } else {
        onChange(date.toISOString());
      }
    }
  };

  // Get minimum date and time from min prop
  const minDate = min ? getDateValue(min) : undefined;
  const minTime = min && dateValue === minDate ? getTimeValue(min) : undefined;

  return (
    <div
      style={{
        display: "flex",
        gap: "12px",
        alignItems: "flex-start",
      }}
    >
      <div style={{ flex: 1 }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: 500,
            color: tokens.textSecondary,
            marginBottom: "6px",
          }}
        >
          Date
        </label>
        <Input
          ref={dateInputRef}
          type="date"
          value={dateValue}
          onChange={handleDateChange}
          onClick={handleDateInputClick}
          onFocus={handleDateInputFocus}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          min={minDate}
          style={{
            width: "100%",
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        />
      </div>
      <div style={{ flex: 1 }}>
        <label
          style={{
            display: "block",
            fontSize: "12px",
            fontWeight: 500,
            color: tokens.textSecondary,
            marginBottom: "6px",
          }}
        >
          Time
        </label>
        <Input
          ref={timeInputRef}
          type="time"
          value={timeValue}
          onChange={handleTimeChange}
          onClick={handleTimeInputClick}
          onFocus={handleTimeInputFocus}
          onKeyDown={handleKeyDown}
          disabled={disabled}
          min={minTime}
          style={{
            width: "100%",
            cursor: disabled ? "not-allowed" : "pointer",
          }}
        />
      </div>
    </div>
  );
}


