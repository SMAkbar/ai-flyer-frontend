'use client';
import React from 'react';
import { tokens } from '@/components/theme/tokens';
import { Input } from './Input';

export type EditableFieldProps = {
  value: string | null;
  placeholder?: string;
  isEditing: boolean;
  editingValue: string;
  onEdit: () => void;
  onChange: (value: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
  disabled?: boolean;
};

export function EditableField({
  value,
  placeholder = 'Click to edit',
  isEditing,
  editingValue,
  onEdit,
  onChange,
  onSave,
  onCancel,
  onKeyDown,
  disabled = false,
}: EditableFieldProps) {
  if (isEditing) {
    return (
      <Input
        type="text"
        value={editingValue}
        onChange={(e) => onChange(e.target.value)}
        onBlur={onSave}
        onKeyDown={(e) => {
          if (onKeyDown) {
            onKeyDown(e);
          } else {
            if (e.key === 'Enter') {
              onSave();
            } else if (e.key === 'Escape') {
              onCancel();
            }
          }
        }}
        disabled={disabled}
        autoFocus
        style={{
          fontSize: '16px',
          fontWeight: 500,
          padding: '8px 12px',
          backgroundColor: tokens.bgElevated,
        }}
      />
    );
  }

  return (
    <div
      onClick={onEdit}
      style={{
        fontSize: '16px',
        color: tokens.textPrimary,
        fontWeight: 500,
        padding: '8px 12px',
        backgroundColor: tokens.bgElevated,
        border: `1px solid ${tokens.border}`,
        borderRadius: '8px',
        cursor: 'text',
        minHeight: '24px',
      }}
    >
      {value || placeholder}
    </div>
  );
}

