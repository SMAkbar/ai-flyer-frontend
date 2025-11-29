"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateFlyerForm } from "@/components/flyers/CreateFlyerForm";
import { flyersApi } from "@/lib/api/flyers";
import { tokens } from "@/components/theme/tokens";

export default function CreateFlyerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  async function handleSubmit(formData: FormData) {
    setIsSubmitting(true);
    setError(null);
    setSuccessMessage(null);

    try {
      // Get all images from the form data
      const images = formData.getAll("images");
      
      if (images.length === 1) {
        // Single image: use the single endpoint
        const singleFormData = new FormData();
        singleFormData.append("image", images[0]);
        
        const result = await flyersApi.create(singleFormData);

        if (result.ok) {
          setSuccessMessage("Flyer created successfully! Processing started.");
          setTimeout(() => {
            router.push("/flyers");
          }, 1500);
        } else {
          setError(result.error.message || "Failed to create flyer");
        }
      } else {
        // Multiple images: use the bulk endpoint
        const result = await flyersApi.createBulk(formData);

        if (result.ok) {
          setSuccessMessage(
            `${result.data.flyers.length} flyers uploaded successfully! Processing started in background.`
          );
          setTimeout(() => {
            router.push("/flyers");
          }, 1500);
        } else {
          setError(result.error.message || "Failed to upload flyers");
        }
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  function handleCancel() {
    router.back();
  }

  return (
    <div
      style={{
        width: "90%",
        maxWidth: "900px",
        margin: "0 auto",
      }}
    >
      <div style={{ marginBottom: "32px" }}>
        <h1
          style={{
            fontSize: "32px",
            fontWeight: 700,
            color: tokens.textPrimary,
            marginBottom: "8px",
            letterSpacing: "-0.02em",
          }}
        >
          Create Flyers
        </h1>
        <p
          style={{
            fontSize: "15px",
            color: tokens.textSecondary,
            margin: 0,
          }}
        >
          Upload one or more images and we'll automatically extract event information from your flyers
        </p>
      </div>

      {error && (
        <div
          style={{
            marginBottom: "24px",
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

      {successMessage && (
        <div
          style={{
            marginBottom: "24px",
            padding: "16px",
            backgroundColor: `${tokens.success}15`,
            border: `1px solid ${tokens.success}40`,
            borderRadius: "12px",
            color: tokens.success,
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
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293l-3 3a1 1 0 01-1.414 0l-1.5-1.5a1 1 0 011.414-1.414L10 9.586l2.793-2.793a1 1 0 011.414 1.414z"
              fill="currentColor"
            />
          </svg>
          {successMessage}
        </div>
      )}

      <CreateFlyerForm
        onSubmit={handleSubmit}
        onCancel={handleCancel}
        isLoading={isSubmitting}
      />
    </div>
  );
}
