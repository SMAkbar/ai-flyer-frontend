'use client';
import React from 'react';
import { styles } from '../theme/tokens';

export function Section({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <section style={styles.section as React.CSSProperties}>
      <h2 style={{ margin: 0, fontSize: 20, lineHeight: 1.4, fontWeight: 600 }}>{title}</h2>
      {subtitle ? <p style={{ marginTop: 4, color: '#B3B3B3', fontSize: 14 }}>{subtitle}</p> : null}
      {children}
    </section>
  );
}
