"use client";

import React, { useState, FormEvent, ChangeEvent } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Textarea } from "@/components/ui/Textarea";
import { tokens } from "@/components/theme/tokens";

type CreateFlyerFormProps = {
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
};

export function CreateFlyerForm({ onSubmit, onCancel, isLoading }: CreateFlyerFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (!file.type.startsWith("image/")) {
        setError("Please select an image file");
        return;
      }
      setImage(file);
      setError(null);

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (!title.trim()) {
      setError("Title is required");
      return;
    }

    if (!image) {
      setError("Please select an image");
      return;
    }

    const formData = new FormData();
    formData.append("title", title);
    formData.append("image", image);
    if (description.trim()) {
      formData.append("description", description);
    }

    await onSubmit(formData);
  }

  function FormField({
    label,
    children,
    hint,
    required,
  }: {
    label: string;
    children: React.ReactNode;
    hint?: string;
    required?: boolean;
  }) {
    return (
      <div style={{ marginBottom: "24px" }}>
        <label
          style={{
            display: "block",
            fontSize: "14px",
            fontWeight: 500,
            color: tokens.textPrimary,
            marginBottom: "8px",
          }}
        >
          {label}
          {required && (
            <span style={{ color: tokens.danger, marginLeft: "4px" }}>*</span>
          )}
        </label>
        {children}
        {hint && (
          <div
            style={{
              fontSize: "12px",
              color: tokens.textMuted,
              marginTop: "6px",
            }}
          >
            {hint}
          </div>
        )}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit}>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
        {/* Basic Information */}
        <Card
          style={{
            backgroundColor: tokens.bgElevated,
            border: `1px solid ${tokens.border}`,
            borderRadius: "16px",
            padding: "32px",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: tokens.textPrimary,
              marginBottom: "24px",
              letterSpacing: "-0.01em",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
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
            >
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14,2 14,8 20,8" />
              <line x1="16" y1="13" x2="8" y2="13" />
              <line x1="16" y1="17" x2="8" y2="17" />
              <polyline points="10,9 9,9 8,9" />
            </svg>
            Flyer Details
          </h2>
          <FormField label="Title" required>
            <Input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter flyer title"
              required
              disabled={isLoading}
            />
          </FormField>
          <FormField label="Description" hint="Optional description for your flyer">
            <Textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter flyer description (optional)"
              rows={4}
              disabled={isLoading}
            />
          </FormField>
        </Card>

        {/* Image Upload */}
        <Card
          style={{
            backgroundColor: tokens.bgElevated,
            border: `1px solid ${tokens.border}`,
            borderRadius: "16px",
            padding: "32px",
          }}
        >
          <h2
            style={{
              fontSize: "18px",
              fontWeight: 600,
              color: tokens.textPrimary,
              marginBottom: "24px",
              letterSpacing: "-0.01em",
              display: "flex",
              alignItems: "center",
              gap: "10px",
            }}
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
            >
              <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
              <circle cx="8.5" cy="8.5" r="1.5" />
              <polyline points="21,15 16,10 5,21" />
            </svg>
            Image Upload
          </h2>
          <FormField label="Flyer Image" required hint="Upload an image file (JPG, PNG, etc.)">
            <div
              style={{
                position: "relative",
                border: `2px dashed ${tokens.border}`,
                borderRadius: "12px",
                padding: "24px",
                backgroundColor: tokens.bgHover,
                transition: "all 0.2s ease",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = tokens.accent;
                e.currentTarget.style.backgroundColor = `${tokens.accent}10`;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = tokens.border;
                e.currentTarget.style.backgroundColor = tokens.bgHover;
              }}
            >
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
                disabled={isLoading}
                style={{
                  width: "100%",
                  padding: "12px",
                  backgroundColor: tokens.bgElevated,
                  color: tokens.textPrimary,
                  border: `1px solid ${tokens.border}`,
                  borderRadius: "8px",
                  cursor: isLoading ? "not-allowed" : "pointer",
                  fontSize: "14px",
                }}
              />
              {imagePreview && (
                <div
                  style={{
                    marginTop: "20px",
                    borderRadius: "12px",
                    overflow: "hidden",
                    border: `1px solid ${tokens.border}`,
                  }}
                >
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      width: "100%",
                      maxHeight: "400px",
                      objectFit: "contain",
                      backgroundColor: tokens.bgHover,
                    }}
                  />
                </div>
              )}
            </div>
          </FormField>
        </Card>

        {error && (
          <div
            style={{
              padding: "16px",
              backgroundColor: `${tokens.danger}15`,
              border: `1px solid ${tokens.danger}40`,
              borderRadius: "12px",
              color: tokens.danger,
              fontSize: "14px",
              display: "flex",
              alignItems: "center",
              gap: "12px",
            }}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 20 20"
              fill="none"
              style={{ flexShrink: 0 }}
            >
              <path
                d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                fill="currentColor"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Form Actions */}
        <div
          style={{
            display: "flex",
            gap: "12px",
            paddingTop: "8px",
            flexWrap: "wrap",
          }}
        >
          <Button type="submit" disabled={isLoading} style={{ minWidth: "160px" }}>
            {isLoading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "8px" }}>
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  style={{ animation: "spin 1s linear infinite" }}
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeDasharray="37.7"
                    strokeDashoffset="28.3"
                    strokeLinecap="round"
                  />
                </svg>
                Uploading...
              </span>
            ) : (
              <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4" />
                  <polyline points="17,8 12,3 7,8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
                Create Flyer
              </span>
            )}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading}
            style={{ minWidth: "120px" }}
          >
            Cancel
          </Button>
        </div>

        <style jsx>{`
          @keyframes spin {
            from {
              transform: rotate(0deg);
            }
            to {
              transform: rotate(360deg);
            }
          }
        `}</style>
      </div>
    </form>
  );
}

