import { type ReactNode } from "react";

type CalloutType = "info" | "tip" | "warning" | "danger" | "note";

const styles: Record<CalloutType, { border: string; bg: string; icon: string; title: string }> = {
  note: {
    border: "border-border",
    bg: "bg-muted/50",
    icon: "📝",
    title: "Note",
  },
  info: {
    border: "border-blue-500/50",
    bg: "bg-blue-500/5",
    icon: "ℹ️",
    title: "Info",
  },
  tip: {
    border: "border-green-500/50",
    bg: "bg-green-500/5",
    icon: "💡",
    title: "Tip",
  },
  warning: {
    border: "border-yellow-500/50",
    bg: "bg-yellow-500/5",
    icon: "⚠️",
    title: "Warning",
  },
  danger: {
    border: "border-red-500/50",
    bg: "bg-red-500/5",
    icon: "🚨",
    title: "Danger",
  },
};

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children?: ReactNode;
}

export function Callout({ type = "note", title, children }: CalloutProps) {
  const s = styles[type] ?? styles.note;

  return (
    <div className={`my-6 rounded-lg border-l-4 ${s.border} ${s.bg} p-4`}>
      <div className="flex items-center gap-2 font-semibold text-sm mb-2">
        <span>{s.icon}</span>
        <span>{title ?? s.title}</span>
      </div>
      <div className="text-sm [&>p]:mt-0 [&>p:not(:first-child)]:mt-2">{children}</div>
    </div>
  );
}
