import type { ReactNode } from "react";
import { CircleAlert, Info, Lightbulb, type LucideIcon, NotebookPen, TriangleAlert } from "lucide-react";
import { cn } from "@/lib/utils";

type CalloutType = "info" | "tip" | "warning" | "danger" | "note";

// Titles use the site's default language: MDX components don't receive the page locale.
const styles: Record<CalloutType, { border: string; bg: string; icon: LucideIcon; iconColor: string; title: string }> = {
  note: { border: "border-border", bg: "bg-muted/50", icon: NotebookPen, iconColor: "text-muted-foreground", title: "Заметка" },
  info: { border: "border-blue-500/50", bg: "bg-blue-500/5", icon: Info, iconColor: "text-blue-600 dark:text-blue-400", title: "Информация" },
  tip: { border: "border-green-500/50", bg: "bg-green-500/5", icon: Lightbulb, iconColor: "text-green-600 dark:text-green-400", title: "Совет" },
  warning: { border: "border-yellow-500/50", bg: "bg-yellow-500/5", icon: TriangleAlert, iconColor: "text-yellow-600 dark:text-yellow-400", title: "Внимание" },
  danger: { border: "border-red-500/50", bg: "bg-red-500/5", icon: CircleAlert, iconColor: "text-red-600 dark:text-red-400", title: "Осторожно" },
};

interface CalloutProps {
  type?: CalloutType;
  title?: string;
  children?: ReactNode;
}

export function Callout({ type = "note", title, children }: CalloutProps) {
  const s = styles[type] ?? styles.note;
  const Icon = s.icon;

  return (
    <div className={cn("my-6 rounded-lg border-l-4 p-4", s.border, s.bg)}>
      <div className="mb-2 flex items-center gap-2 text-sm font-semibold">
        <Icon className={cn("h-4 w-4 shrink-0", s.iconColor)} aria-hidden="true" />
        <span>{title ?? s.title}</span>
      </div>
      <div className="text-sm [&>p:not(:first-child)]:mt-2 [&>p]:mt-0">{children}</div>
    </div>
  );
}
