'use client';
import React from 'react';
import { useRouter } from 'next/navigation';
import { Button } from './Button';
import { ArrowLeftIcon } from '@/components/icons';

export type BackButtonProps = {
  onClick?: () => void;
  label?: string;
};

export function BackButton({ onClick, label = 'Back' }: BackButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    if (onClick) {
      onClick();
    } else {
      router.back();
    }
  };

  return (
    <Button
      variant="secondary"
      onClick={handleClick}
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
      }}
    >
      <ArrowLeftIcon size={20} color="currentColor" />
      <span>{label}</span>
    </Button>
  );
}

