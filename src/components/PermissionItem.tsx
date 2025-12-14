import { LucideIcon, Check, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PermissionItemProps {
  icon: LucideIcon;
  title: string;
  description: string;
  granted: boolean;
  required?: boolean;
  onRequest: () => void;
}

export function PermissionItem({ 
  icon: Icon, 
  title, 
  description, 
  granted, 
  required = false,
  onRequest 
}: PermissionItemProps) {
  return (
    <button
      onClick={onRequest}
      disabled={granted}
      className={cn(
        'flex w-full items-center gap-4 rounded-2xl p-4 text-left transition-all',
        granted ? 'bg-success/10' : 'bg-card hover:bg-accent'
      )}
    >
      <div className={cn(
        'flex h-12 w-12 items-center justify-center rounded-xl',
        granted ? 'bg-success/20' : 'bg-secondary'
      )}>
        <Icon className={cn('h-6 w-6', granted ? 'text-success' : 'text-foreground')} />
      </div>
      
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <p className="font-semibold">{title}</p>
          {required && !granted && (
            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
              Required
            </span>
          )}
        </div>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
      
      <div className={cn(
        'flex h-8 w-8 items-center justify-center rounded-full',
        granted ? 'bg-success text-success-foreground' : 'bg-secondary'
      )}>
        {granted ? <Check className="h-4 w-4" /> : <X className="h-4 w-4 text-muted-foreground" />}
      </div>
    </button>
  );
}
