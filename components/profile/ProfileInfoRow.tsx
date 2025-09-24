import { TUser } from "@/lib/schema";

export function InfoRow({
  label,
  value,
  icon,
}: {
  label: string;
  value: React.ReactNode;
  icon?: React.ReactNode;
  editableField?: "phone";
  user?: TUser;
}) {
  // Only phone is editable here, but this pattern allows others if needed
  return (
    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-1">
      <span
        className="flex items-center gap-2 text-sm font-medium"
        style={{ color: "var(--color-brand-600)" }}
      >
        {icon}
        {label}
      </span>
      <span className="text-sm font-semibold flex items-center gap-2">
        {value}
      </span>
    </div>
  );
}
