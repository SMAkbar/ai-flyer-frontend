'use client';
import React from 'react';
import { tokens } from '../theme/tokens';

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary';
};

export function Button({ variant = 'primary', style, onMouseEnter, onMouseLeave, ...rest }: ButtonProps) {
  const base: React.CSSProperties = {
    borderRadius: 8,
    cursor: 'pointer',
    fontWeight: 600,
    padding: '10px 16px',
  };

  const primary: React.CSSProperties = {
    backgroundColor: tokens.accent,
    color: tokens.textPrimary,
    border: 'none',
  };

  const secondary: React.CSSProperties = {
    backgroundColor: tokens.bgHover,
    color: tokens.textPrimary,
    border: `1px solid ${tokens.border}`,
  };

  const merged = { ...base, ...(variant === 'primary' ? primary : secondary), ...style } as React.CSSProperties;

  const handleEnter = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === 'primary') e.currentTarget.style.backgroundColor = tokens.accentHover;
    onMouseEnter?.(e);
  };
  const handleLeave = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (variant === 'primary') e.currentTarget.style.backgroundColor = tokens.accent;
    onMouseLeave?.(e);
  };

  return <button {...rest} style={merged} onMouseEnter={handleEnter} onMouseLeave={handleLeave} />;
}
