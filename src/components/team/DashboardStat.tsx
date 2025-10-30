'use client';
import React from 'react';
import { styles, tokens } from '../theme/tokens';
import { Icon } from '../ui/Icon';

const icons = {
  check: "M9 16.17 4.83 12 3.41 13.41 9 19l12-12-1.41-1.41z",
  alert: "M1 21h22L12 2 1 21Zm12-3h-2v-2h2v2Zm0-4h-2v-4h2v4Z",
};

export function DashboardStat({ label, value, trend, color }: { label: string; value: string; trend?: 'up' | 'down'; color?: string }) {
  return (
    <div style={{ ...(styles.card as React.CSSProperties), display: 'flex', flexDirection: 'column', gap: 8 }}>
      <div style={{ color: tokens.textSecondary, fontSize: 12 }}>{label}</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <div style={{ fontSize: 24, fontWeight: 700, color: color ?? tokens.textPrimary }}>{value}</div>
        {trend === 'up' && <Icon path={icons.check} size={18} color={tokens.success} />}
        {trend === 'down' && <Icon path={icons.alert} size={18} color={tokens.danger} />}
      </div>
    </div>
  );
}
