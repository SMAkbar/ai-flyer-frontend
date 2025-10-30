export const tokens = {
  bgBase: "#141414",
  bgElevated: "#1A1A1A",
  bgHover: "#1F1F1F",
  textPrimary: "#E6E6E6",
  textSecondary: "#B3B3B3",
  textMuted: "#8C8C8C",
  border: "#2A2A2A",
  accent: "#E50914",
  accentHover: "#F6121D",
  success: "#22C55E",
  warning: "#F59E0B",
  danger: "#EF4444",
} as const;

export type Tokens = typeof tokens;

export const styles = {
  section: {
    backgroundColor: tokens.bgElevated,
    border: `1px solid ${tokens.border}`,
    borderRadius: 12,
    padding: 24,
  },
  card: {
    backgroundColor: tokens.bgHover,
    border: `1px solid ${tokens.border}`,
    borderRadius: 12,
    padding: 16,
  },
} as const;
