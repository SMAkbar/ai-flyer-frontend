'use client';
import React, { useState, forwardRef } from 'react';
import { tokens } from '../theme/tokens';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(props, ref) {
  const [isFocused, setIsFocused] = useState(false);

  const baseStyle: React.CSSProperties = {
    width: '100%',
    backgroundColor: tokens.bgHover,
    color: tokens.textPrimary,
    borderWidth: '1px',
    borderStyle: 'solid',
    borderColor: tokens.border,
    borderRadius: 8,
    padding: '12px 16px',
    outline: 'none',
    fontSize: '15px',
    lineHeight: '1.5',
    transition: 'all 0.2s ease',
    fontFamily: 'inherit',
  };

  const focusedStyle: React.CSSProperties = isFocused
    ? {
        borderColor: tokens.accent,
        boxShadow: `0 0 0 3px ${tokens.accent}20`,
        backgroundColor: tokens.bgElevated,
      }
    : {};

  return (
    <input
      {...props}
      ref={ref}
      style={{ ...baseStyle, ...focusedStyle, ...props.style }}
      onFocus={(e) => {
        setIsFocused(true);
        props.onFocus?.(e);
      }}
      onBlur={(e) => {
        setIsFocused(false);
        props.onBlur?.(e);
      }}
      placeholder={props.placeholder ? props.placeholder : undefined}
    />
  );
});
