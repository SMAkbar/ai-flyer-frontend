"use client";

type AvatarPreviewProps = {
  avatarUrl: string | null;
  name?: string | null;
  size?: number;
};

export function AvatarPreview({ avatarUrl, name, size = 80 }: AvatarPreviewProps) {
  const initials = name
    ?.split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={name || "Avatar"}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          objectFit: "cover",
        }}
        onError={(e) => {
          // Fallback to initials if image fails to load
          const target = e.currentTarget;
          target.style.display = "none";
          if (target.nextElementSibling) {
            (target.nextElementSibling as HTMLElement).style.display = "flex";
          }
        }}
      />
    );
  }

  return (
    <div
      className="flex items-center justify-center bg-gray-300 dark:bg-gray-700 text-gray-700 dark:text-gray-300 font-semibold"
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
      }}
    >
      {initials}
    </div>
  );
}

