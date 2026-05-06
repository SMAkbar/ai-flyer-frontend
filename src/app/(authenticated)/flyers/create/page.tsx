"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  CreateFlyerForm,
  type DuplicateFlyerPrompt,
  type BulkDuplicateFlyerPrompt,
} from "@/components/flyers/CreateFlyerForm";
import { flyersApi } from "@/lib/api/flyers";
import { tokens } from "@/components/theme/tokens";

export default function CreateFlyerPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [duplicatePrompt, setDuplicatePrompt] = useState<DuplicateFlyerPrompt | null>(null);
  const [bulkDuplicatePrompt, setBulkDuplicatePrompt] =
    useState<BulkDuplicateFlyerPrompt | null>(null);
  const [pendingSingleFile, setPendingSingleFile] = useState<File | null>(null);
  const [pendingBulkFiles, setPendingBulkFiles] = useState<File[] | null>(null);

  function buildBulkFormData(files: File[]): FormData {
    const fd = new FormData();
    files.forEach((file) => fd.append("images", file));
    return fd;
  }

  async function createSingleWithHash(file: File, flyer_hash: string): Promise<boolean> {
    const singleFormData = new FormData();
    singleFormData.append("image", file);
    singleFormData.append("flyer_hash", flyer_hash);
    const result = await flyersApi.create(singleFormData);
    if (result.ok) {
      setSuccessMessage("Flyer created successfully! Processing started.");
      setTimeout(() => {
        router.push("/flyers");
      }, 1500);
      return true;
    }
    setError(result.error.message || "Failed to create flyer");
    return false;
  }

  async function handleExtractInformation(formData: FormData) {
    setError(null);
    setSuccessMessage(null);

    const images = formData.getAll("images") as File[];

    if (images.length > 1) {
      setIsSubmitting(true);
      try {
        const duplicateCheck = await flyersApi.checkBulkImageHashes(images);
        if (!duplicateCheck.ok) {
          setError(duplicateCheck.error.message || "Could not verify bulk upload");
          return;
        }
        if (duplicateCheck.data.has_duplicates) {
          const matchesInDbCount = duplicateCheck.data.matches_in_db.reduce(
            (acc, item) => acc + item.filenames.length,
            0
          );
          const duplicatesInRequestCount = duplicateCheck.data.duplicates_in_request.reduce(
            (acc, item) => acc + item.filenames.length,
            0
          );
          setBulkDuplicatePrompt({
            matches_in_db_count: matchesInDbCount,
            duplicates_in_request_count: duplicatesInRequestCount,
          });
          setPendingBulkFiles(images);
          return;
        }

        const result = await flyersApi.createBulk(buildBulkFormData(images));
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
      } catch {
        setError("An unexpected error occurred");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    const file = images[0];
    setBulkDuplicatePrompt(null);
    setPendingBulkFiles(null);
    setIsSubmitting(true);
    try {
      const check = await flyersApi.checkImageHash(file);
      if (!check.ok) {
        setError(check.error.message || "Could not verify image");
        return;
      }
      if (check.data.is_duplicate) {
        setDuplicatePrompt({
          flyer_hash: check.data.flyer_hash,
          existing_flyer: check.data.existing_flyer,
        });
        setPendingSingleFile(file);
        return;
      }
      await createSingleWithHash(file, check.data.flyer_hash);
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleConfirmDuplicate() {
    if (pendingSingleFile && duplicatePrompt) {
      const file = pendingSingleFile;
      const hash = duplicatePrompt.flyer_hash;
      setDuplicatePrompt(null);
      setPendingSingleFile(null);
      setIsSubmitting(true);
      setError(null);
      try {
        await createSingleWithHash(file, hash);
      } catch {
        setError("An unexpected error occurred");
      } finally {
        setIsSubmitting(false);
      }
      return;
    }

    if (pendingBulkFiles && bulkDuplicatePrompt) {
      setBulkDuplicatePrompt(null);
      const files = pendingBulkFiles;
      setPendingBulkFiles(null);
      setIsSubmitting(true);
      setError(null);
      try {
        const result = await flyersApi.createBulk(buildBulkFormData(files), true);
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
      } catch {
        setError("An unexpected error occurred");
      } finally {
        setIsSubmitting(false);
      }
    }
  }

  function handleDismissDuplicate() {
    setDuplicatePrompt(null);
    setPendingSingleFile(null);
    setBulkDuplicatePrompt(null);
    setPendingBulkFiles(null);
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
          Upload one or more images and we&apos;ll automatically extract event information from your flyers
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
        onSubmit={handleExtractInformation}
        onCancel={() => router.back()}
        isLoading={isSubmitting}
        duplicatePrompt={duplicatePrompt}
        bulkDuplicatePrompt={bulkDuplicatePrompt}
        onConfirmDuplicate={() => void handleConfirmDuplicate()}
        onDismissDuplicate={handleDismissDuplicate}
      />
    </div>
  );
}
