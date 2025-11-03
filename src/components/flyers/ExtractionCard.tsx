'use client';
import React from 'react';
import { Card } from '@/components/ui/Card';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { FieldLabel } from '@/components/ui/FieldLabel';
import { EditableField } from '@/components/ui/EditableField';
import { LoadingSpinner } from '@/components/ui/LoadingSpinner';
import { Alert } from '@/components/ui/Alert';
import { tokens } from '@/components/theme/tokens';
import { CubeIcon, CheckIcon, WarningIcon, ClockIcon } from '@/components/icons';

export type ExtractionData = {
  status: 'completed' | 'processing' | 'failed' | 'pending';
  event_date_time?: string | null;
  location_town_city?: string | null;
  event_title?: string | null;
  venue_name?: string | null;
  performers_djs_soundsystems?: string | null;
  confidence_level?: string | null; // DEPRECATED: Use field_confidence_levels
  field_confidence_levels?: Record<string, string | null> | null; // Per-field confidence levels
  error_message?: string | null;
};

export type ExtractionCardProps = {
  extraction: ExtractionData | null;
  editingField: string | null;
  editingValue: string;
  isUpdating: boolean;
  onFieldEdit: (fieldName: string, currentValue: string | null) => void;
  onFieldChange: (value: string) => void;
  onFieldSave: (fieldName: string) => void;
  onFieldCancel: () => void;
};

// Helper function to get confidence status for a field
function getFieldConfidenceStatus(
  fieldValue: string | null | undefined,
  confidenceLevel: string | null | undefined
): 'red' | 'yellow' | 'green' | 'none' {
  // Red: No data or confidence < 50%
  if (!fieldValue || fieldValue.trim() === '') {
    return 'red';
  }

  // No confidence level provided - default to yellow (needs review)
  if (!confidenceLevel) {
    return 'yellow';
  }

  try {
    const confidence = parseFloat(confidenceLevel);
    // Normalize if percentage format (e.g., 85 instead of 0.85)
    const normalized = confidence > 1.0 ? confidence / 100.0 : confidence;

    // Red: confidence < 50%
    if (normalized < 0.5) {
      return 'red';
    }
    // Yellow: 50% <= confidence < 90%
    if (normalized < 0.9) {
      return 'yellow';
    }
    // Green: confidence >= 90%
    return 'green';
  } catch {
    // Invalid confidence format - default to yellow
    return 'yellow';
  }
}

// Helper function to format confidence percentage
function formatConfidence(confidenceLevel: string | null | undefined): string {
  if (!confidenceLevel) return 'N/A';
  try {
    const confidence = parseFloat(confidenceLevel);
    const normalized = confidence > 1.0 ? confidence / 100.0 : confidence;
    return `${Math.round(normalized * 100)}%`;
  } catch {
    return 'N/A';
  }
}

// Helper component for confidence badge
function ConfidenceBadge({
  status,
  confidence,
}: {
  status: 'red' | 'yellow' | 'green' | 'none';
  confidence: string | null | undefined;
}) {
  if (status === 'none') return null;

  const colors = {
    red: {
      bg: `${tokens.danger}15`,
      border: `${tokens.danger}40`,
      text: tokens.danger,
      icon: WarningIcon,
      label: 'Needs Review',
    },
    yellow: {
      bg: `${tokens.warning}15`,
      border: `${tokens.warning}40`,
      text: tokens.warning,
      icon: WarningIcon,
      label: 'Please Review',
    },
    green: {
      bg: `${tokens.success}15`,
      border: `${tokens.success}40`,
      text: tokens.success,
      icon: CheckIcon,
      label: 'High Confidence',
    },
  };

  const color = colors[status];
  const Icon = color.icon;

  return (
    <div
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '6px',
        padding: '6px 12px',
        borderRadius: '6px',
        backgroundColor: color.bg,
        border: `1px solid ${color.border}`,
        fontSize: '13px',
        fontWeight: 500,
        marginLeft: '8px',
      }}
      title={color.label}
    >
      <Icon size={14} color={color.text} />
      <span style={{ color: color.text }}>
        {confidence ? formatConfidence(confidence) : color.label}
      </span>
    </div>
  );
}

export function ExtractionCard({
  extraction,
  editingField,
  editingValue,
  isUpdating,
  onFieldEdit,
  onFieldChange,
  onFieldSave,
  onFieldCancel,
}: ExtractionCardProps) {
  if (!extraction) {
    return (
      <Card
        style={{
          backgroundColor: tokens.bgElevated,
          border: `1px solid ${tokens.border}`,
          borderRadius: '16px',
          padding: '28px',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: tokens.textSecondary,
            fontSize: '15px',
          }}
        >
          <ClockIcon size={20} color="currentColor" />
          No extracted information available yet. Extraction may still be processing.
        </div>
      </Card>
    );
  }

  return (
    <Card
      style={{
        backgroundColor: tokens.bgElevated,
        border: `1px solid ${tokens.border}`,
        borderRadius: '16px',
        padding: '28px',
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <h2
          style={{
            fontSize: '20px',
            fontWeight: 600,
            color: tokens.textPrimary,
            margin: 0,
            letterSpacing: '-0.01em',
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <CubeIcon size={20} color="currentColor" />
          Extracted Information
        </h2>
        <StatusBadge status={extraction.status} />
      </div>

      {extraction.status === 'completed' ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FieldLabel>Event Date/Time</FieldLabel>
              <ConfidenceBadge
                status={getFieldConfidenceStatus(
                  extraction.event_date_time,
                  extraction.field_confidence_levels?.event_date_time
                )}
                confidence={extraction.field_confidence_levels?.event_date_time}
              />
            </div>
            <EditableField
              value={extraction.event_date_time}
              isEditing={editingField === 'event_date_time'}
              editingValue={editingValue}
              onEdit={() => onFieldEdit('event_date_time', extraction.event_date_time)}
              onChange={onFieldChange}
              onSave={() => onFieldSave('event_date_time')}
              onCancel={onFieldCancel}
              disabled={isUpdating}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FieldLabel>Location</FieldLabel>
              <ConfidenceBadge
                status={getFieldConfidenceStatus(
                  extraction.location_town_city,
                  extraction.field_confidence_levels?.location_town_city
                )}
                confidence={extraction.field_confidence_levels?.location_town_city}
              />
            </div>
            <EditableField
              value={extraction.location_town_city}
              isEditing={editingField === 'location_town_city'}
              editingValue={editingValue}
              onEdit={() => onFieldEdit('location_town_city', extraction.location_town_city)}
              onChange={onFieldChange}
              onSave={() => onFieldSave('location_town_city')}
              onCancel={onFieldCancel}
              disabled={isUpdating}
            />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FieldLabel>Event Title</FieldLabel>
              <ConfidenceBadge
                status={getFieldConfidenceStatus(
                  extraction.event_title,
                  extraction.field_confidence_levels?.event_title
                )}
                confidence={extraction.field_confidence_levels?.event_title}
              />
            </div>
            <EditableField
              value={extraction.event_title}
              isEditing={editingField === 'event_title'}
              editingValue={editingValue}
              onEdit={() => onFieldEdit('event_title', extraction.event_title)}
              onChange={onFieldChange}
              onSave={() => onFieldSave('event_title')}
              onCancel={onFieldCancel}
              disabled={isUpdating}
            />
          </div>

          {extraction.venue_name && (
            <div>
              <div
                style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}
              >
                <FieldLabel>Venue</FieldLabel>
                <ConfidenceBadge
                  status={getFieldConfidenceStatus(
                    extraction.venue_name,
                    extraction.field_confidence_levels?.venue_name
                  )}
                  confidence={extraction.field_confidence_levels?.venue_name}
                />
              </div>
              <div
                style={{
                  fontSize: '16px',
                  color: tokens.textPrimary,
                  fontWeight: 500,
                  padding: '8px 12px',
                  backgroundColor: tokens.bgElevated,
                  border: `1px solid ${tokens.border}`,
                  borderRadius: '8px',
                }}
              >
                {extraction.venue_name}
              </div>
            </div>
          )}

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <FieldLabel>Performers/DJs/Soundsystems</FieldLabel>
              <ConfidenceBadge
                status={getFieldConfidenceStatus(
                  extraction.performers_djs_soundsystems,
                  extraction.field_confidence_levels?.performers_djs_soundsystems
                )}
                confidence={extraction.field_confidence_levels?.performers_djs_soundsystems}
              />
            </div>
            <EditableField
              value={extraction.performers_djs_soundsystems}
              isEditing={editingField === 'performers_djs_soundsystems'}
              editingValue={editingValue}
              onEdit={() =>
                onFieldEdit('performers_djs_soundsystems', extraction.performers_djs_soundsystems)
              }
              onChange={onFieldChange}
              onSave={() => onFieldSave('performers_djs_soundsystems')}
              onCancel={onFieldCancel}
              disabled={isUpdating}
            />
          </div>
        </div>
      ) : extraction.status === 'processing' ? (
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            color: tokens.textSecondary,
            padding: '16px',
            backgroundColor: tokens.bgHover,
            borderRadius: '12px',
            border: `1px solid ${tokens.border}`,
          }}
        >
          <LoadingSpinner message="Extracting information from flyer image..." size={20} />
        </div>
      ) : extraction.status === 'failed' ? (
        <Alert variant="error">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <WarningIcon size={18} />
            <span style={{ fontWeight: 600 }}>Extraction failed</span>
          </div>
          {extraction.error_message && (
            <p style={{ margin: '8px 0 0 0', fontSize: '14px' }}>{extraction.error_message}</p>
          )}
        </Alert>
      ) : (
        <div
          style={{
            padding: '16px',
            backgroundColor: tokens.bgHover,
            borderRadius: '12px',
            border: `1px solid ${tokens.border}`,
            color: tokens.textSecondary,
            fontSize: '15px',
          }}
        >
          Extraction not yet started
        </div>
      )}
    </Card>
  );
}

