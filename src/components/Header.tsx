import { ArrowLeft, Settings } from 'lucide-react';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';

interface HeaderProps {
  title?: string;
  showBack?: boolean;
  showSettings?: boolean;
  onBack?: () => void;
  onSettings?: () => void;
  className?: string;
  dark?: boolean;
}

export function Header({ 
  title, 
  showBack = false, 
  showSettings = false, 
  onBack, 
  onSettings,
  className,
  dark = false
}: HeaderProps) {
  return (
    <header className={cn(
      'flex items-center justify-between px-4 py-3 safe-top',
      dark ? 'bg-drive-bg text-drive-foreground' : 'bg-background text-foreground',
      className
    )}>
      <div className="w-12">
        {showBack && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onBack}
            className={cn('touch-target', dark ? 'text-drive-foreground hover:bg-drive-card' : '')}
          >
            <ArrowLeft className="h-6 w-6" />
          </Button>
        )}
      </div>
      
      {title && (
        <h1 className="text-lg font-semibold">{title}</h1>
      )}
      
      <div className="w-12">
        {showSettings && (
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={onSettings}
            className={cn('touch-target', dark ? 'text-drive-foreground hover:bg-drive-card' : '')}
          >
            <Settings className="h-6 w-6" />
          </Button>
        )}
      </div>
    </header>
  );
}
