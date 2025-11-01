'use client';
import React from 'react';
import { tokens } from '@/components/theme/tokens';

export type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: React.ReactNode;
};

export function PageHeader({ title, subtitle, action }: PageHeaderProps) {
  return (
    <div
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        gap: '24px',
        marginBottom: '32px',
        flexWrap: 'wrap',
      }}
    >
      <div style={{ flex: 1, minWidth: '300px' }}>
        <h1
          style={{
            fontSize: '40px',
            fontWeight: 700,
            color: tokens.textPrimary,
            marginBottom: subtitle ? '12px' : 0,
            letterSpacing: '-0.02em',
            lineHeight: 1.2,
          }}
        >
          {title}
        </h1>
        {subtitle && (
          <p
            style={{
              color: tokens.textSecondary,
              fontSize: '16px',
              lineHeight: 1.5,
              margin: 0,
            }}
          >
            {subtitle}
          </p>
        )}
      </div>
      {action && <div>{action}</div>}
    </div>
  );
}

