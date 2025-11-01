'use client';
import React from 'react';

export type ContainerProps = {
  children: React.ReactNode;
  maxWidth?: string;
  width?: string;
  style?: React.CSSProperties;
};

export function Container({ 
  children, 
  maxWidth = '1600px',
  width = '90%',
  style,
}: ContainerProps) {
  return (
    <div
      style={{
        width,
        maxWidth,
        margin: '0 auto',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

