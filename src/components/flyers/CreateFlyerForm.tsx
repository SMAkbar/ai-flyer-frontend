"use client";

import { useState, FormEvent, ChangeEvent } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

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

  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Basic Information */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Flyer Details</h2>
            <div className="mb-4">
              <label htmlFor="title" className="block text-xs opacity-70 mb-1">
                Title *
              </label>
              <Input
                id="title"
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Enter flyer title"
                required
              />
            </div>
            <div className="mb-4">
              <label htmlFor="description" className="block text-xs opacity-70 mb-1">
                Description
              </label>
              <textarea
                id="description"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Enter flyer description (optional)"
                rows={4}
                style={{
                  width: "100%",
                  backgroundColor: "#1F1F1F",
                  color: "#E6E6E6",
                  border: "1px solid #2A2A2A",
                  borderRadius: 8,
                  padding: "10px 12px",
                  outline: "none",
                }}
              />
            </div>
          </div>
        </Card>

        {/* Image Upload */}
        <Card>
          <div className="p-6">
            <h2 className="text-lg font-semibold mb-4">Image</h2>
            <div className="mb-4">
              <label htmlFor="image" className="block text-xs opacity-70 mb-1">
                Image *
              </label>
              <input
                id="image"
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                required
                style={{
                  width: "100%",
                  padding: "8px",
                  backgroundColor: "#1F1F1F",
                  color: "#E6E6E6",
                  border: "1px solid #2A2A2A",
                  borderRadius: 8,
                  cursor: "pointer",
                }}
              />
              {imagePreview && (
                <div className="mt-4">
                  <img
                    src={imagePreview}
                    alt="Preview"
                    style={{
                      maxWidth: "100%",
                      maxHeight: 300,
                      borderRadius: 8,
                      border: "1px solid #2A2A2A",
                    }}
                  />
                </div>
              )}
            </div>
          </div>
        </Card>

        {error && (
          <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-red-800 dark:text-red-200">
            {error}
          </div>
        )}

        {/* Form Actions */}
        <div className="flex gap-3">
          <Button type="submit" disabled={isLoading}>
            {isLoading ? "Uploading..." : "Create Flyer"}
          </Button>
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isLoading}>
            Cancel
          </Button>
        </div>
      </div>
    </form>
  );
}

