"use client";

import React, { useState, useMemo, FormEvent, ChangeEvent } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { tokens } from "@/components/theme/tokens";
import type { FlyerBulkHashCheckResponse } from "@/lib/api/flyers";

type ImagePreview = {
  file: File;
  preview: string;
};

export type DuplicateFlyerPrompt = {
  flyer_hash: string;
  existing_flyer: { id: number; title: string; is_archived: boolean } | null;
};

export type BulkDuplicateFlyerPrompt = Pick<
  FlyerBulkHashCheckResponse,
  "matches_in_db" | "duplicates_in_request"
>;

type CreateFlyerFormProps = {
  onSubmit: (formData: FormData) => Promise<void>;
  onCancel: () => void;
  isLoading?: boolean;
  duplicatePrompt?: DuplicateFlyerPrompt | null;
  bulkDuplicatePrompt?: BulkDuplicateFlyerPrompt | null;
  onConfirmDuplicate?: () => void | Promise<void>;
  onDismissDuplicate?: () => void;
};

export function CreateFlyerForm({
  onSubmit,
  onCancel,
  isLoading,
  duplicatePrompt = null,
  bulkDuplicatePrompt = null,
  onConfirmDuplicate,
  onDismissDuplicate,
}: CreateFlyerFormProps) {
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [error, setError] = useState<string | null>(null);

  const handleImageChange = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const fileArray = Array.from(files);
    const newImages: ImagePreview[] = [];

    // Process files sequentially to avoid race conditions
    for (const file of fileArray) {
      try {
        const preview = await readFileAsDataURL(file);
        if (preview) {
          newImages.push({ file, preview });
        }
      } catch (err) {
        console.error(`Failed to read file ${file.name}:`, err);
      }
    }

    if (newImages.length > 0) {
      setImages((prev) => [...prev, ...newImages]);
      setError(null);
    } else {
      setError("No valid images were found in the selected files");
    }

    // Reset input to allow selecting the same file again
    e.target.value = "";
  };

  const readFileAsDataURL = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        resolve(reader.result as string);
      };
      reader.onerror = () => {
        reject(new Error(`Failed to read file: ${file.name}`));
      };
      reader.readAsDataURL(file);
    });
  };

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError(null);

    if (images.length === 0) {
      setError("Please select at least one image");
      return;
    }

    const formData = new FormData();
    
    // Append all images with the same field name for bulk upload
    images.forEach((img) => {
      formData.append("images", img.file);
    });

    await onSubmit(formData);
  }

  const duplicateActive = Boolean(duplicatePrompt || bulkDuplicatePrompt);

  const bulkDuplicateFilenames = useMemo(() => {
    if (!bulkDuplicatePrompt) return new Set<string>();
    const names = new Set<string>();
    for (const m of bulkDuplicatePrompt.matches_in_db) {
      for (const f of m.filenames) names.add(f);
    }
    for (const d of bulkDuplicatePrompt.duplicates_in_request) {
      for (const f of d.filenames) names.add(f);
    }
    return names;
  }, [bulkDuplicatePrompt]);

  const removeImage = (index: number) => {
    const removed = images[index];
    const shouldResetBulkDuplicate =
      Boolean(bulkDuplicatePrompt && removed && bulkDuplicateFilenames.has(removed.file.name));
    const shouldResetSingleDuplicate = Boolean(duplicatePrompt && removed);

    if (shouldResetBulkDuplicate || shouldResetSingleDuplicate) {
      onDismissDuplicate?.();
    }

    setImages((prev) => prev.filter((_, i) => i !== index));
    setError(null);
  };

  const clearAllImages = () => {
    if (bulkDuplicatePrompt || duplicatePrompt) {
      onDismissDuplicate?.();
    }
    setImages([]);
    setError(null);
  };

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
    <form onSubmit={handleSubmit} noValidate>
      <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
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
            {images.length > 0 && (
              <span
                style={{
                  fontSize: "14px",
                  fontWeight: 400,
                  color: tokens.accent,
                  marginLeft: "auto",
                }}
              >
                {images.length} image{images.length !== 1 ? "s" : ""} selected
              </span>
            )}
          </h2>
          <FormField 
            label="Flyer Images" 
            required 
            hint="Upload one or more image files (JPG, PNG, etc.). You can select multiple files at once."
          >
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
                id="images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleImageChange}
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
              
              {/* File list summary */}
              {images.length > 0 && (
                <div
                  style={{
                    marginTop: "16px",
                    padding: "12px",
                    backgroundColor: tokens.bgElevated,
                    border: `1px solid ${tokens.accent}40`,
                    borderRadius: "8px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                    <svg
                      width="18"
                      height="18"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      style={{ flexShrink: 0, color: tokens.accent }}
                    >
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14,2 14,8 20,8" />
                    </svg>
                    <span style={{ fontSize: "14px", color: tokens.textPrimary }}>
                      {images.length} image{images.length !== 1 ? "s" : ""} ready to upload
                    </span>
                    <span style={{ fontSize: "12px", color: tokens.textMuted }}>
                      ({(images.reduce((sum, img) => sum + img.file.size, 0) / 1024 / 1024).toFixed(2)} MB total)
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={clearAllImages}
                    disabled={isLoading}
                    style={{
                      padding: "6px 12px",
                      backgroundColor: "transparent",
                      color: tokens.textMuted,
                      border: `1px solid ${tokens.border}`,
                      borderRadius: "6px",
                      cursor: isLoading ? "not-allowed" : "pointer",
                      fontSize: "12px",
                      transition: "all 0.2s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.color = tokens.danger;
                      e.currentTarget.style.borderColor = tokens.danger;
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.color = tokens.textMuted;
                      e.currentTarget.style.borderColor = tokens.border;
                    }}
                  >
                    Clear All
                  </button>
                </div>
              )}

              {/* Image preview grid */}
              {images.length > 0 && (
                <div
                  style={{
                    marginTop: "20px",
                    display: "grid",
                    gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
                    gap: "16px",
                  }}
                >
                  {images.map((img, index) => {
                    const isBulkDup =
                      Boolean(bulkDuplicatePrompt) &&
                      bulkDuplicateFilenames.has(img.file.name);
                    return (
                    <div
                      key={index}
                      style={{
                        position: "relative",
                        borderRadius: "12px",
                        overflow: "hidden",
                        border: isBulkDup
                          ? `2px solid ${tokens.danger}`
                          : `1px solid ${tokens.border}`,
                        backgroundColor: tokens.bgHover,
                      }}
                    >
                      <img
                        src={img.preview}
                        alt={`Preview ${index + 1}`}
                        style={{
                          width: "100%",
                          height: "120px",
                          objectFit: "cover",
                        }}
                      />
                      <div
                        style={{
                          padding: "8px",
                          fontSize: "12px",
                          color: tokens.textMuted,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          whiteSpace: "nowrap",
                        }}
                      >
                        {img.file.name}
                      </div>
                      <button
                        type="button"
                        onClick={() => removeImage(index)}
                        disabled={isLoading}
                        style={{
                          position: "absolute",
                          top: "6px",
                          right: "6px",
                          width: "24px",
                          height: "24px",
                          borderRadius: "50%",
                          backgroundColor: `${tokens.danger}dd`,
                          color: "white",
                          border: "none",
                          cursor: isLoading ? "not-allowed" : "pointer",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                          fontSize: "14px",
                          fontWeight: "bold",
                          transition: "all 0.2s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.backgroundColor = tokens.danger;
                          e.currentTarget.style.transform = "scale(1.1)";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.backgroundColor = `${tokens.danger}dd`;
                          e.currentTarget.style.transform = "scale(1)";
                        }}
                      >
                        ×
                      </button>
                    </div>
                    );
                  })}
                </div>
              )}
            </div>
          </FormField>
        </Card>

        {(duplicatePrompt || bulkDuplicatePrompt) && onConfirmDuplicate && onDismissDuplicate && (
          <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="duplicate-flyer-title"
            style={{
              padding: "20px",
              backgroundColor: `${tokens.warning}18`,
              border: `1px solid ${tokens.warning}55`,
              borderRadius: "12px",
              color: tokens.textPrimary,
              fontSize: "14px",
            }}
          >
            <h2
              id="duplicate-flyer-title"
              style={{
                fontSize: "16px",
                fontWeight: 600,
                margin: "0 0 10px 0",
                color: tokens.textPrimary,
              }}
            >
              {bulkDuplicatePrompt ? "Possible duplicate images" : "Possible duplicate image"}
            </h2>
            <p style={{ margin: "0 0 16px 0", lineHeight: 1.5, color: tokens.textSecondary }}>
              {duplicatePrompt?.existing_flyer ? (
                <>
                  You already have a flyer that matches this image:{" "}
                  <strong style={{ color: tokens.textPrimary }}>
                    {duplicatePrompt.existing_flyer.title}
                  </strong>{" "}
                  (id {duplicatePrompt.existing_flyer.id}
                  {duplicatePrompt.existing_flyer.is_archived ? ", archived" : ""}). Uploading again
                  will create another flyer record.
                </>
              ) : bulkDuplicatePrompt ? (
                <>
                  <span style={{ display: "block", marginBottom: "12px" }}>
                    We found issues with this bulk upload. Files below are outlined in red in the
                    preview grid. You can remove them and try again, or upload anyway.
                  </span>
                  {bulkDuplicatePrompt.matches_in_db.length > 0 && (
                    <span style={{ display: "block", marginBottom: "10px" }}>
                      <strong style={{ color: tokens.textPrimary }}>
                        Already in your library
                      </strong>
                      <ul
                        style={{
                          margin: "8px 0 0 0",
                          paddingLeft: "20px",
                          color: tokens.textSecondary,
                        }}
                      >
                        {bulkDuplicatePrompt.matches_in_db.flatMap((row) =>
                          row.filenames.map((name) => (
                            <li key={`${row.flyer_hash}-${name}`} style={{ marginBottom: "4px" }}>
                              <span style={{ color: tokens.textPrimary }}>{name}</span>
                              {" — same image as "}
                              <strong style={{ color: tokens.textPrimary }}>
                                {row.existing_flyer_title ?? "Untitled"}
                              </strong>
                              {" (id "}
                              {row.existing_flyer_id}
                              {row.existing_flyer_is_archived ? ", archived" : ""}
                              {")"}
                            </li>
                          ))
                        )}
                      </ul>
                    </span>
                  )}
                  {bulkDuplicatePrompt.duplicates_in_request.length > 0 && (
                    <span style={{ display: "block", marginBottom: "10px" }}>
                      <strong style={{ color: tokens.textPrimary }}>
                        Same image more than once in this upload
                      </strong>
                      <ul
                        style={{
                          margin: "8px 0 0 0",
                          paddingLeft: "20px",
                          color: tokens.textSecondary,
                        }}
                      >
                        {bulkDuplicatePrompt.duplicates_in_request.map((row) => (
                          <li key={row.flyer_hash} style={{ marginBottom: "4px" }}>
                            {row.filenames.join(", ")}
                            {" — same image appears "}
                            {row.filenames.length} times in this selection
                          </li>
                        ))}
                      </ul>
                    </span>
                  )}
                  <span style={{ display: "block", marginTop: "4px" }}>
                    Do you want to continue anyway?
                  </span>
                </>
              ) : (
                <>
                  This image matches a flyer already stored in the system. Uploading will create a new
                  flyer for your account.
                </>
              )}
            </p>
            <div style={{ display: "flex", gap: "12px", flexWrap: "wrap" }}>
              <Button
                type="button"
                onClick={() => void onConfirmDuplicate()}
                disabled={isLoading}
              >
                {isLoading ? "Uploading…" : "Upload anyway"}
              </Button>
              <Button type="button" variant="secondary" onClick={onDismissDuplicate} disabled={isLoading}>
                Cancel
              </Button>
            </div>
          </div>
        )}

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
          <Button
            type="submit"
            disabled={isLoading || images.length === 0 || duplicateActive}
            style={{ minWidth: "160px" }}
          >
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
                Extracting Information...
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
                Extract Information
              </span>
            )}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onCancel}
            disabled={isLoading || duplicateActive}
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
