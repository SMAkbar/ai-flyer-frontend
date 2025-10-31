"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CreateFlyerForm } from "@/components/flyers/CreateFlyerForm";
import { flyersApi } from "@/lib/api/flyers";

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
      const result = await flyersApi.create(formData);

      if (result.ok) {
        setSuccessMessage("Flyer created successfully!");
        setTimeout(() => {
          router.push("/dashboard");
        }, 1500);
      } else {
        setError(result.error.message || "Failed to create flyer");
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
    <div className="max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-semibold">Create Flyer</h1>
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-800 dark:text-red-200">
          {error}
        </div>
      )}

      {successMessage && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-md text-green-800 dark:text-green-200">
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

