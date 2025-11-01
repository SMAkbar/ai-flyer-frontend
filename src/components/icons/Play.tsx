import type { IconProps } from "./types";

export function PlayIcon({
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
      viewBox="0 0 24 24"
      fill="none"
      stroke={color}
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
      style={style}
    >
      <path d="M8 5v14l11-7L8 5Z" />
    </svg>
  );
}

