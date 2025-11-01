import type { IconProps } from "./types";

export function LoaderIcon({
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
      className={className}
      style={{ ...style, animation: "spin 1s linear infinite" }}
    >
      <circle
        cx="10"
        cy="10"
        r="7"
        stroke={color}
        strokeWidth={strokeWidth}
        strokeDasharray="44"
        strokeDashoffset="33"
        strokeLinecap="round"
      />
    </svg>
  );
}

