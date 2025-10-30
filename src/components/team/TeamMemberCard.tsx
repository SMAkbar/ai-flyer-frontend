'use client';
import React from 'react';
import { styles, tokens } from '../theme/tokens';
import { Icon } from '../ui/Icon';

const icons = {
  user: "M12 12c2.761 0 5-2.239 5-5s-2.239-5-5-5-5 2.239-5 5 2.239 5 5 5Zm0 2c-4.418 0-8 2.239-8 5v3h16v-3c0-2.761-3.582-5-8-5Z",
};

export function TeamMemberCard({ name, role }: { name: string; role: string }) {
  const pill: React.CSSProperties = {
    display: 'inline-block',
    padding: '6px 10px',
    borderRadius: 999,
    border: `1px solid ${tokens.border}`,
    backgroundColor: tokens.bgElevated,
    color: tokens.textSecondary,
    fontSize: 12,
  };

  return (
    <div style={styles.card as React.CSSProperties}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div style={{ width: 40, height: 40, borderRadius: 8, background: tokens.bgElevated, display: 'grid', placeItems: 'center', border: `1px solid ${tokens.border}` }}>
          <Icon path={icons.user} size={20} color={tokens.textSecondary} />
        </div>
        <div>
          <div style={{ fontWeight: 600 }}>{name}</div>
          <div style={{ color: tokens.textSecondary, fontSize: 13 }}>{role}</div>
        </div>
      </div>
      <div style={{ marginTop: 12, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        <span style={pill}>@{name.toLowerCase().replace(/\s+/g, '')}</span>
        <span style={pill}>{role}</span>
      </div>
    </div>
  );
}
