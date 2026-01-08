"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { PostStatusBadge } from "@/components/flyers/PostStatusBadge";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { tokens } from "@/components/theme/tokens";
import { ImageIcon, ExternalLinkIcon, ClockIcon, TrashIcon, WarningIcon } from "@/components/icons";
import { flyersApi } from "@/lib/api/flyers";
import type { FlyerRead, ExtractionStatus } from "@/lib/api/flyers";
import type { PostStatus } from "@/lib/api/instagram";
import type { FilterStatus, SortOption } from "@/lib/utils/flyerFilters";

type FlyerCardProps = {
  flyer: FlyerRead;
  onDelete?: () => void;
  filterStatus?: FilterStatus;
  searchQuery?: string;
  sortOption?: SortOption;
};

export function FlyerCard({ flyer, onDelete, filterStatus = "all", searchQuery = "", sortOption = "latest" }: FlyerCardProps) {
  const router = useRouter();
  const [isHovered, setIsHovered] = useState(false);
  const [imageError, setImageError] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const handleClick = () => {
    const params = new URLSearchParams();
    if (filterStatus !== "all") {
      params.set("filter", filterStatus);
    }
    if (searchQuery.trim()) {
      params.set("search", searchQuery);
    }
    if (sortOption !== "latest") {
      params.set("sort", sortOption);
    }
    const queryString = params.toString();
    const url = queryString ? `/flyers/${flyer.id}?${queryString}` : `/flyers/${flyer.id}`;
    router.push(url);
  };

  const handleDeleteClick = (e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card click navigation
    setShowDeleteModal(true);
  };

  const handleDeleteConfirm = async () => {
    setIsDeleting(true);
    try {
      const result = await flyersApi.delete(flyer.id);
      if (result.ok) {
        setShowDeleteModal(false);
        onDelete?.();
      } else {
        // Show error in modal or use a toast notification
        alert(result.error.message || "Failed to delete flyer");
      }
    } catch (err) {
      alert("An unexpected error occurred");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <Card
      hoverElevate
      onClick={handleClick}
      style={{
        cursor: "pointer",
        backgroundColor: tokens.bgElevated,
        border: `1px solid ${tokens.border}`,
        borderRadius: "16px",
        padding: 0,
        overflow: "hidden",
        transition: "all 0.2s ease",
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div
        style={{
          position: "relative",
          width: "100%",
          aspectRatio: "3/4",
          overflow: "hidden",
          backgroundColor: tokens.bgHover,
        }}
      >
        {!imageError ? (
          <img
            src={flyer.cloudfront_url}
            alt={flyer.title}
            onError={() => setImageError(true)}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              transition: "transform 0.3s ease",
              transform: isHovered ? "scale(1.05)" : "scale(1)",
            }}
          />
        ) : (
          <div
            style={{
              width: "100%",
              height: "100%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              backgroundColor: tokens.bgHover,
            }}
            >
              <ImageIcon size={48} color={tokens.textMuted} strokeWidth="1.5" />
            </div>
        )}
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "12px",
            backgroundColor: `${tokens.bgBase}e6`,
            backdropFilter: "blur(8px)",
            borderRadius: "8px",
            padding: "6px 10px",
            border: `1px solid ${tokens.border}`,
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.2s ease",
            pointerEvents: "none",
          }}
        >
          <span
            style={{
              fontSize: "12px",
              fontWeight: 600,
              color: tokens.textPrimary,
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <ExternalLinkIcon size={14} color="currentColor" />
            View Details
          </span>
        </div>
        {/* Delete Button */}
        <button
          onClick={handleDeleteClick}
          disabled={isDeleting}
          style={{
            position: "absolute",
            top: "12px",
            left: "12px",
            backgroundColor: `${tokens.danger}e6`,
            backdropFilter: "blur(8px)",
            borderRadius: "8px",
            padding: "8px",
            border: `1px solid ${tokens.danger}80`,
            cursor: isDeleting ? "not-allowed" : "pointer",
            opacity: isHovered ? 1 : 0,
            transition: "opacity 0.2s ease, background-color 0.2s ease",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            pointerEvents: isHovered ? "auto" : "none",
          }}
          onMouseEnter={(e) => {
            if (!isDeleting) {
              e.currentTarget.style.backgroundColor = tokens.danger;
            }
          }}
          onMouseLeave={(e) => {
            if (!isDeleting) {
              e.currentTarget.style.backgroundColor = `${tokens.danger}e6`;
            }
          }}
          aria-label={`Delete ${flyer.title}`}
        >
          <TrashIcon 
            size={16} 
            color="white" 
            strokeWidth={2.5}
          />
        </button>
      </div>
      <div style={{ padding: "20px" }}>
        <h3
          style={{
            margin: 0,
            marginBottom: "8px",
            fontSize: "18px",
            fontWeight: 600,
            color: tokens.textPrimary,
            letterSpacing: "-0.01em",
            lineHeight: 1.3,
          }}
        >
          {flyer.title}
        </h3>
        {flyer.description && (
          <p
            style={{
              margin: 0,
              marginBottom: "12px",
              fontSize: "14px",
              color: tokens.textSecondary,
              lineHeight: 1.5,
              display: "-webkit-box",
              WebkitLineClamp: 2,
              WebkitBoxOrient: "vertical",
              overflow: "hidden",
            }}
          >
            {flyer.description}
          </p>
        )}
        {/* Status Badges */}
        {(flyer.extraction_status || flyer.carousel_post_status) && (
          <div
            style={{
              display: "flex",
              flexWrap: "wrap",
              gap: "8px",
              marginBottom: "12px",
            }}
          >
            {flyer.extraction_status && (
              <StatusBadge
                status={flyer.extraction_status as "pending" | "processing" | "completed" | "failed"}
                label={
                  flyer.extraction_status === "processing"
                    ? "Extracting..."
                    : flyer.extraction_status === "completed"
                    ? "Extracted"
                    : flyer.extraction_status === "failed"
                    ? "Extraction Failed"
                    : "Pending Extraction"
                }
              />
            )}
            {flyer.carousel_post_status && (
              <PostStatusBadge status={flyer.carousel_post_status as PostStatus} />
            )}
          </div>
        )}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "8px",
            fontSize: "12px",
            color: tokens.textMuted,
            paddingTop: "12px",
            borderTop: `1px solid ${tokens.border}`,
          }}
        >
          <ClockIcon size={14} color="currentColor" />
          {formatDate(flyer.created_at)}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => !isDeleting && setShowDeleteModal(false)}
        title="Delete Flyer"
        maxWidth="480px"
      >
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            gap: "24px",
          }}
        >
          {/* Warning Icon and Message */}
          <div
            style={{
              display: "flex",
              gap: "16px",
              alignItems: "flex-start",
            }}
          >
            <div
              style={{
                flexShrink: 0,
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                backgroundColor: `${tokens.danger}20`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <WarningIcon size={24} color={tokens.danger} />
            </div>
            <div style={{ flex: 1 }}>
              <p
                style={{
                  margin: 0,
                  marginBottom: "8px",
                  fontSize: "16px",
                  fontWeight: 600,
                  color: tokens.textPrimary,
                }}
              >
                Are you sure you want to delete this flyer?
              </p>
              <p
                style={{
                  margin: 0,
                  fontSize: "14px",
                  color: tokens.textSecondary,
                  lineHeight: 1.5,
                }}
              >
                This will permanently delete "{flyer.title}". This action cannot be undone.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div
            style={{
              display: "flex",
              gap: "12px",
              justifyContent: "flex-end",
            }}
          >
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="primary"
              onClick={handleDeleteConfirm}
              disabled={isDeleting}
              style={{
                backgroundColor: tokens.danger,
                color: "white",
              }}
              onMouseEnter={(e) => {
                if (!isDeleting) {
                  e.currentTarget.style.backgroundColor = "#DC2626";
                }
              }}
              onMouseLeave={(e) => {
                if (!isDeleting) {
                  e.currentTarget.style.backgroundColor = tokens.danger;
                }
              }}
            >
              {isDeleting ? "Deleting..." : "Delete"}
            </Button>
          </div>
        </div>
      </Modal>
    </Card>
  );
}

