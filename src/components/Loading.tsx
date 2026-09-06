import { Loader2 } from "lucide-react";
import { FileQuestion } from "lucide-react";

export function Loading({ message = "Loading..." }: { message?: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex items-center gap-2 text-xs text-white/30">
        <Loader2 className="size-4 animate-spin" />
        {message}
      </div>
    </div>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
}: {
  icon?: React.ReactNode;
  title: string;
  description?: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      {icon && <div className="mb-3 text-white/15">{icon}</div>}
      <p className="text-xs text-white/40">{title}</p>
      {description && <p className="mt-1 text-[11px] text-white/20">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function UploadPrompt({ navigate }: { navigate: (to: string) => void }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <div className="mb-3 flex size-8 items-center justify-center rounded-xl bg-cyan-500/10">
        <FileQuestion className="size-4 text-cyan-400/40" />
      </div>
      <p className="text-sm font-medium text-white/60">Upload data to get started</p>
      <p className="mt-1 text-[11px] text-white/30">Investigation records generate entities, relationships, timeline and alerts.</p>
      <button
        onClick={() => navigate("/app/upload")}
        className="mt-4 flex items-center gap-1.5 rounded-lg bg-cyan-600 px-4 py-2 text-[11px] font-medium text-white hover:bg-cyan-500"
      >
        <FileQuestion className="size-3" /> Upload data
      </button>
    </div>
  );
}
