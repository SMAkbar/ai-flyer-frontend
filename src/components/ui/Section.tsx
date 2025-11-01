'use client';
import React from 'react';
import { tokens } from '../theme/tokens';

export function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section
      style={{
        backgroundColor: tokens.bgElevated,
        border: `1px solid ${tokens.border}`,
        borderRadius: '20px',
        padding: '32px',
        display: 'flex',
        flexDirection: 'column',
        gap: '24px',
      }}
    >
      <div>
        <h2
          style={{
            margin: 0,
            fontSize: '24px',
            lineHeight: 1.3,
            fontWeight: 700,
            color: tokens.textPrimary,
            letterSpacing: '-0.01em',
            marginBottom: subtitle ? '8px' : 0,
          }}
        >
          {title}
        </h2>
        {subtitle ? (
          <p
            style={{
              margin: 0,
              color: tokens.textSecondary,
              fontSize: '15px',
              lineHeight: 1.5,
            }}
          >
            {subtitle}
          </p>
        ) : null}
      </div>
      {children}
    </section>
  );
}
