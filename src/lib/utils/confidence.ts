/**
 * Utility functions for confidence level checking and normalization.
 */

/**
 * Normalize confidence level to 0.0-1.0 format.
 * 
 * The confidence_level can be stored as:
 * - "0.90" (0.0-1.0 format)
 * - "90" (0-100 percentage format)
 */
export function normalizeConfidence(confidenceLevel: string | null | undefined): number | null {
  if (!confidenceLevel) {
    return null;
  }

  try {
    const confidence = parseFloat(confidenceLevel);
    
    // If > 1.0, assume it's percentage format (0-100) and normalize to 0.0-1.0
    if (confidence > 1.0) {
      return confidence / 100.0;
    }
    
    // Already in 0.0-1.0 format
    return confidence;
  } catch {
    // Invalid format, return null
    return null;
  }
}

/**
 * Check if all fields with data have confidence > 90% (0.90).
 * 
 * This matches the backend logic in `should_generate_images()`.
 * 
 * @param fieldConfidenceLevels - Dict mapping field names to their confidence level strings
 * @param fieldValues - Dict mapping field names to their values (to check which fields have data)
 * @returns True if all fields with data have confidence > 90%, False otherwise
 */
export function shouldAutoGenerateImages(
  fieldConfidenceLevels: Record<string, string | null> | null | undefined,
  fieldValues: {
    event_date_time?: string | null;
    location_town_city?: string | null;
    event_title?: string | null;
    performers_djs_soundsystems?: string | null;
    venue_name?: string | null;
  }
): boolean {
  // Use per-field confidence if available
  if (fieldConfidenceLevels) {
    // List of fields to check (only those with data)
    const fieldsToCheck = [
      "event_date_time",
      "location_town_city",
      "event_title",
      "performers_djs_soundsystems",
      "venue_name",
    ] as const;

    // Check each field that has data
    for (const fieldName of fieldsToCheck) {
      const fieldValue = fieldValues[fieldName];

      // Skip fields with no data
      if (!fieldValue || fieldValue.trim() === "") {
        continue;
      }

      // Get confidence for this field
      const fieldConfidence = fieldConfidenceLevels[fieldName];
      if (!fieldConfidence) {
        // Field has data but no confidence - don't auto-generate
        return false;
      }

      // Normalize and check confidence
      const normalized = normalizeConfidence(fieldConfidence);
      if (normalized === null || normalized <= 0.90) {
        // Field has data but confidence is <= 90% - don't auto-generate
        return false;
      }
    }

    // All fields with data have confidence > 90%
    return true;
  }

  // Default to False if no confidence data available
  return false;
}


