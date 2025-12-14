import { cn } from '@/lib/utils';
import { AlertnessStatus } from '@/types';

interface StatusCardProps {
  status: AlertnessStatus;
  className?: string;
}

const statusConfig: Record<AlertnessStatus, { label: string; color: string; bgColor: string }> = {
  good: { label: 'Good', color: 'text-success', bgColor: 'bg-success/10' },
  fair: { label: 'Fair', color: 'text-warning', bgColor: 'bg-warning/10' },
  poor: { label: 'Poor', color: 'text-alert-danger', bgColor: 'bg-alert-danger/10' },
  critical: { label: 'Critical', color: 'text-alert-danger', bgColor: 'bg-alert-danger/20' },
};

export function StatusCard({ status, className }: StatusCardProps) {
  const config = statusConfig[status];
  
  return (
    <div className={cn('rounded-2xl bg-card p-6 shadow-md', className)}>
      <p className="text-lg text-muted-foreground">Alertness:</p>
      <div className="mt-2 flex items-center gap-3">
        <div className={cn('h-3 w-3 rounded-full', config.bgColor)}>
          <div className={cn('h-3 w-3 rounded-full animate-pulse', config.color.replace('text-', 'bg-'))} />
        </div>
        <p className={cn('text-4xl font-bold', config.color)}>{config.label}</p>
      </div>
    </div>
  );
}
