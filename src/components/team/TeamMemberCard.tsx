'use client';
import React, { useState } from 'react';
import { tokens } from '../theme/tokens';
import { Card } from '../ui/Card';

export function TeamMemberCard({ name, role }: { name: string; role: string }) {
  const [isHovered, setIsHovered] = useState(false);

  const getInitials = (fullName: string) => {
    return fullName
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const initials = getInitials(name);
  const username = name.toLowerCase().replace(/\s+/g, '');

  return (
    <Card
      hoverElevate
      style={{
        backgroundColor: tokens.bgElevated,
        border: `1px solid ${tokens.border}`,
        borderRadius: '16px',
        padding: '24px',
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '14px',
              background: `linear-gradient(135deg, ${tokens.accent}20 0%, ${tokens.accentHover}20 100%)`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              border: `2px solid ${tokens.accent}40`,
              fontSize: '24px',
              fontWeight: 700,
              color: tokens.accent,
              flexShrink: 0,
              transition: 'all 0.2s ease',
              transform: isHovered ? 'scale(1.05)' : 'scale(1)',
            }}
          >
            {initials}
          </div>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div
              style={{
                fontWeight: 600,
                fontSize: '17px',
                color: tokens.textPrimary,
                marginBottom: '4px',
                letterSpacing: '-0.01em',
              }}
            >
              {name}
            </div>
            <div
              style={{
                color: tokens.textSecondary,
                fontSize: '14px',
                lineHeight: 1.4,
              }}
            >
              {role}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', paddingTop: '8px', borderTop: `1px solid ${tokens.border}` }}>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: `1px solid ${tokens.border}`,
              backgroundColor: tokens.bgHover,
              color: tokens.textSecondary,
              fontSize: '12px',
              fontWeight: 500,
              transition: 'all 0.2s ease',
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            @{username}
          </span>
          <span
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '6px 12px',
              borderRadius: '8px',
              border: `1px solid ${tokens.border}`,
              backgroundColor: tokens.bgHover,
              color: tokens.textSecondary,
              fontSize: '12px',
              fontWeight: 500,
            }}
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
              <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
            </svg>
            {role}
          </span>
        </div>
      </div>
    </Card>
  );
}
