import type { Urgency } from "@/lib/reminders";
import { URGENCY_STYLES } from "./urgencyStyles";

export function UrgencyBadge({ urgency }: { urgency: Urgency }) {
  const style = URGENCY_STYLES[urgency];
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${style.badge}`}
    >
      {style.label}
    </span>
  );
}
