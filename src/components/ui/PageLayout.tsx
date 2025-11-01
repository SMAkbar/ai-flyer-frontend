'use client';
import React from 'react';
import { Container } from './Container';
import { LoadingSpinner } from './LoadingSpinner';
import { Alert } from './Alert';
import { Button } from './Button';

export type PageLayoutProps = {
  children: React.ReactNode;
  isLoading?: boolean;
  loadingMessage?: string;
  error?: string | null;
  onRetry?: () => void;
  maxWidth?: string;
};

export function PageLayout({
  children,
  isLoading = false,
  loadingMessage,
  error,
  onRetry,
  maxWidth,
}: PageLayoutProps) {
  if (isLoading) {
    return (
      <Container maxWidth={maxWidth}>
        <LoadingSpinner message={loadingMessage} fullHeight />
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth={maxWidth}>
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: '400px',
            gap: '16px',
          }}
        >
          <Alert variant="error">{error}</Alert>
          {onRetry && <Button onClick={onRetry}>Retry</Button>}
        </div>
      </Container>
    );
  }

  return <Container maxWidth={maxWidth}>{children}</Container>;
}

