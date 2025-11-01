import type { IconProps } from "./types";

export function MenuIcon({
  size = 24,
  color = "currentColor",
  strokeWidth = 2,
  className,
  style,
}: IconProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 20 20"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M4 6h12M4 12h12M4 18h12" />
    </svg>
  );
}

