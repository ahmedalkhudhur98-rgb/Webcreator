export default function Avatar({
  initials,
  color,
  size = "md",
  title,
}: {
  initials: string;
  color: string;
  size?: "sm" | "md" | "lg";
  title?: string;
}) {
  const sizes = {
    sm: "h-6 w-6 text-[10px]",
    md: "h-9 w-9 text-xs",
    lg: "h-16 w-16 text-xl",
  };
  return (
    <span
      title={title}
      className={`inline-flex items-center justify-center rounded-full font-semibold tracking-wide text-ink-950 ring-1 ring-white/10 ${sizes[size]}`}
      style={{ background: `linear-gradient(135deg, ${color}, ${color}99)`, color: "#0c0b08" }}
    >
      {initials}
    </span>
  );
}
