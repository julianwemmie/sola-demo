import {
  LayoutGrid,
  Workflow,
  Play,
  History,
  Settings,
  HelpCircle,
  Zap,
} from 'lucide-react';

const topItems = [
  { icon: LayoutGrid, label: 'Dashboard', active: false },
  { icon: Workflow, label: 'Workflows', active: true },
  { icon: Play, label: 'Executions', active: false },
  { icon: Zap, label: 'Triggers', active: false },
  { icon: History, label: 'History', active: false },
];

const bottomItems = [
  { icon: Settings, label: 'Settings' },
  { icon: HelpCircle, label: 'Help' },
];

export function Sidebar() {
  return (
    <aside className="flex w-14 shrink-0 flex-col items-center border-r border-border bg-sidebar py-3">
      {/* Logo */}
      <div className="mb-4 flex h-8 w-8 items-center justify-center rounded-lg bg-sola-blue text-white">
        <Zap size={16} />
      </div>

      {/* Nav items */}
      <nav className="flex flex-1 flex-col items-center gap-1">
        {topItems.map((item) => (
          <SidebarButton key={item.label} {...item} />
        ))}
      </nav>

      {/* Bottom items */}
      <div className="flex flex-col items-center gap-1">
        {bottomItems.map((item) => (
          <SidebarButton key={item.label} icon={item.icon} label={item.label} active={false} />
        ))}
      </div>
    </aside>
  );
}

function SidebarButton({
  icon: Icon,
  label,
  active,
}: {
  icon: React.ComponentType<{ size?: number; className?: string }>;
  label: string;
  active: boolean;
}) {
  return (
    <button
      title={label}
      className={`
        flex h-10 w-10 items-center justify-center rounded-lg transition-colors
        ${active
          ? 'bg-accent text-sola-blue'
          : 'text-muted-foreground hover:bg-accent hover:text-foreground'
        }
      `}
    >
      <Icon size={18} />
    </button>
  );
}
