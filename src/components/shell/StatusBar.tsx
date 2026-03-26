import { CheckCircle2 } from 'lucide-react';

export function StatusBar() {
  return (
    <footer className="flex h-7 shrink-0 items-center justify-between border-t border-border bg-card px-4 text-[11px] text-muted-foreground">
      <div className="flex items-center gap-3">
        <span className="flex items-center gap-1">
          <CheckCircle2 size={11} className="text-sola-green" />
          All steps passing
        </span>
        <span className="text-border">|</span>
        <span>Last run: 2 min ago</span>
      </div>
      <div className="flex items-center gap-3">
        <span>v2.4.1</span>
        <span className="text-border">|</span>
        <span>6 nodes</span>
      </div>
    </footer>
  );
}
