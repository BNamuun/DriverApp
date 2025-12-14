import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface DashboardTileProps {
  icon: LucideIcon;
  label: string;
  onClick?: () => void;
  className?: string;
  badge?: string;
}

export function DashboardTile({ icon: Icon, label, onClick, className, badge }: DashboardTileProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'relative flex flex-col items-center justify-center gap-2 rounded-2xl bg-card p-6 shadow-sm transition-all hover:shadow-md active:scale-[0.98] touch-target',
        className
      )}
    >
      <Icon className="h-8 w-8 text-muted-foreground" />
      <span className="text-sm font-medium text-foreground">{label}</span>
      {badge && (
        <span className="absolute right-3 top-3 flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-bold text-primary-foreground">
          {badge}
        </span>
      )}
    </button>
  );
}
