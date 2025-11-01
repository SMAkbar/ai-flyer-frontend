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
  confidence_level?: string | null;
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
            <FieldLabel>Event Date/Time</FieldLabel>
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
            <FieldLabel>Location</FieldLabel>
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
            <FieldLabel>Event Title</FieldLabel>
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
              <FieldLabel>Venue</FieldLabel>
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
            <FieldLabel>Performers/DJs/Soundsystems</FieldLabel>
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

          {extraction.confidence_level && (
            <div>
              <FieldLabel>Confidence Level</FieldLabel>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '8px 14px',
                  borderRadius: '8px',
                  backgroundColor: `${tokens.success}15`,
                  border: `1px solid ${tokens.success}40`,
                }}
              >
                <div
                  style={{
                    fontSize: '18px',
                    fontWeight: 700,
                    color: tokens.success,
                  }}
                >
                  {Math.round(parseFloat(extraction.confidence_level) * 100)}%
                </div>
                <CheckIcon size={16} color={tokens.success} />
              </div>
            </div>
          )}
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

