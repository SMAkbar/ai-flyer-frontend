'use client';
import React from 'react';
import { tokens } from '../theme/tokens';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export function Input(props: InputProps) {
  const style: React.CSSProperties = {
    width: '100%',
    backgroundColor: tokens.bgHover,
    color: tokens.textPrimary,
    border: `1px solid ${tokens.border}`,
    borderRadius: 8,
    padding: '10px 12px',
    outline: 'none',
  };
  return <input {...props} style={{ ...style, ...props.style }} />;
}
