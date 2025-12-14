import { Trip } from '@/types';
import { cn } from '@/lib/utils';
import { Clock, MapPin, AlertTriangle, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';

interface TripCardProps {
  trip: Trip;
  onClick?: () => void;
  className?: string;
}

export function TripCard({ trip, onClick, className }: TripCardProps) {
  const duration = trip.endTime 
    ? Math.round((trip.endTime.getTime() - trip.startTime.getTime()) / 60000)
    : 0;
  
  const alertCount = trip.alerts.length;
  const hasAlerts = alertCount > 0;
  
  return (
    <button
      onClick={onClick}
      className={cn(
        'w-full rounded-2xl bg-card p-4 text-left shadow-sm transition-all hover:shadow-md active:scale-[0.99]',
        className
      )}
    >
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="font-semibold text-foreground">
            {format(trip.startTime, 'MMM d, yyyy')}
          </p>
          <p className="text-sm text-muted-foreground">
            {format(trip.startTime, 'h:mm a')}
          </p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span>{duration}m</span>
          </div>
          
          {trip.distance && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>{trip.distance.toFixed(1)}km</span>
            </div>
          )}
          
          <div className={cn(
            'flex items-center gap-1 rounded-full px-2 py-1 text-sm font-medium',
            hasAlerts ? 'bg-alert-danger/10 text-alert-danger' : 'bg-success/10 text-success'
          )}>
            <AlertTriangle className="h-3 w-3" />
            <span>{alertCount}</span>
          </div>
          
          <ChevronRight className="h-5 w-5 text-muted-foreground" />
        </div>
      </div>
    </button>
  );
}
