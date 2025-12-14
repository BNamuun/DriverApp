import { cn } from '@/lib/utils';
import { RiskLevel } from '@/types';

interface AlertnessGaugeProps {
  confidence: number;
  riskLevel: RiskLevel;
  className?: string;
}

const riskColors: Record<RiskLevel, string> = {
  safe: 'text-success',
  mild: 'text-warning',
  moderate: 'text-alert-warning',
  severe: 'text-alert-danger',
};

export function AlertnessGauge({ confidence, riskLevel, className }: AlertnessGaugeProps) {
  const rotation = (confidence / 100) * 180 - 90;
  
  return (
    <div className={cn('relative flex flex-col items-center', className)}>
      {/* Gauge background */}
      <div className="relative h-24 w-48 overflow-hidden">
        <div className="absolute inset-0 rounded-t-full border-8 border-drive-muted/30" />
        <div 
          className={cn('absolute inset-0 rounded-t-full border-8 origin-bottom transition-all duration-500', riskColors[riskLevel].replace('text-', 'border-'))}
          style={{ 
            clipPath: `polygon(0 100%, 50% 100%, 50% 0, ${50 + Math.cos((rotation - 90) * Math.PI / 180) * 50}% ${50 - Math.sin((rotation - 90) * Math.PI / 180) * 50}%, 0 0)` 
          }}
        />
        {/* Needle */}
        <div 
          className="absolute bottom-0 left-1/2 h-20 w-1 origin-bottom -translate-x-1/2 transition-transform duration-500"
          style={{ transform: `translateX(-50%) rotate(${rotation}deg)` }}
        >
          <div className="h-full w-full rounded-full bg-drive-foreground" />
        </div>
        <div className="absolute bottom-0 left-1/2 h-4 w-4 -translate-x-1/2 translate-y-1/2 rounded-full bg-drive-foreground" />
      </div>
      
      {/* Score */}
      <p className={cn('mt-4 text-6xl font-bold', riskColors[riskLevel])}>{confidence}</p>
    </div>
  );
}
