import { cn, initials } from "@/lib/utils";

/**
 * Avatar for the signed-in user: their photo when `image` is set, otherwise
 * the first letters of their name (or the first letter of their email) in a
 * circle.
 */
export function UserAvatar({
  name,
  email,
  image,
  size = 32,
  className,
}: {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  size?: number;
  className?: string;
}) {
  const label =
    (name && initials(name)) || email?.[0]?.toUpperCase() || "?";

  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={name ?? email ?? "User"}
        className={cn("shrink-0 rounded-full object-cover", className)}
        style={{ width: size, height: size }}
      />
    );
  }

  return (
    <span
      aria-hidden
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full bg-surface-3 font-medium text-text",
        className,
      )}
      style={{ width: size, height: size, fontSize: Math.round(size * 0.36) }}
    >
      {label}
    </span>
  );
}
