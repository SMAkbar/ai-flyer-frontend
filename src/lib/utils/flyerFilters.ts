import type { FlyerRead, ExtractionStatus } from "@/lib/api/flyers";

export type FilterStatus = "all" | ExtractionStatus | "posted" | "extracted";
export type SortOption = "latest" | "oldest" | "latest_event" | "oldest_event";

/**
 * Filters and sorts flyers based on status, search query, and sort option.
 * This function is shared between the flyers list page and the detail page
 * to ensure consistent filtering logic.
 */
export function filterAndSortFlyers(
  flyers: FlyerRead[],
  filterStatus: FilterStatus,
  searchQuery: string,
  sortOption: SortOption
): FlyerRead[] {
  let filtered = flyers;

  // Apply status filter
  if (filterStatus !== "all") {
    if (filterStatus === "posted") {
      // Show only posted flyers
      filtered = filtered.filter((flyer) => flyer.carousel_post_status === "posted");
    } else if (filterStatus === "extracted") {
      // Extracted: completed extraction, NOT posted and NOT failed (posting)
      filtered = filtered.filter(
        (flyer) =>
          flyer.extraction_status === "completed" &&
          flyer.carousel_post_status !== "posted" &&
          flyer.carousel_post_status !== "failed"
      );
    } else if (filterStatus === "failed") {
      // Failed: extraction failed OR posting failed
      filtered = filtered.filter(
        (flyer) =>
          flyer.extraction_status === "failed" ||
          flyer.carousel_post_status === "failed"
      );
    } else {
      // Other extraction statuses (pending, processing)
      filtered = filtered.filter((flyer) => flyer.extraction_status === filterStatus);
    }
  }

  // Apply search filter
  if (searchQuery.trim()) {
    const query = searchQuery.toLowerCase().trim();
    filtered = filtered.filter((flyer) => {
      const title = (flyer.title || "").toLowerCase();
      const description = (flyer.description || "").toLowerCase();
      return title.includes(query) || description.includes(query);
    });
  }

  if (sortOption === "latest_event" || sortOption === "oldest_event") {
    filtered = filtered.filter((flyer) => Boolean(flyer.event_date));
  }

  // Apply sorting
  const sorted = [...filtered].sort((a, b) => {
    if (sortOption === "latest") {
      return b.id - a.id; // Descending (newest first by created order)
    }
    if (sortOption === "oldest") {
      return a.id - b.id; // Ascending (oldest first by created order)
    }

    const aTime = new Date(a.event_date || 0).getTime();
    const bTime = new Date(b.event_date || 0).getTime();
    if (sortOption === "latest_event") {
      return bTime - aTime; // Newest event date first
    }
    return aTime - bTime; // Oldest event date first
  });

  return sorted;
}
