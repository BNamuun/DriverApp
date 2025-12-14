import { useParams, useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Clock, MapPin, AlertTriangle, Activity } from 'lucide-react';
import { Header } from '@/components/Header';
import { EmptyState } from '@/components/EmptyState';
import { mockTrips } from '@/data/mockData';
import { cn } from '@/lib/utils';

export default function TripDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const trip = mockTrips.find(t => t.id === id);

  if (!trip) {
    return (
      <div className="flex min-h-screen flex-col bg-background">
        <Header 
          title="Trip Details" 
          showBack 
          onBack={() => navigate('/history')} 
        />
        <EmptyState
          icon={AlertTriangle}
          title="Trip not found"
          description="This trip may have been deleted."
          action={{
            label: 'Back to History',
            onClick: () => navigate('/history'),
          }}
        />
      </div>
    );
  }

  const duration = trip.endTime 
    ? Math.round((trip.endTime.getTime() - trip.startTime.getTime()) / 60000)
    : 0;

  const severityColors = {
    low: 'bg-success/10 text-success border-success/20',
    medium: 'bg-warning/10 text-warning border-warning/20',
    high: 'bg-alert-danger/10 text-alert-danger border-alert-danger/20',
    critical: 'bg-alert-danger/20 text-alert-danger border-alert-danger/30',
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header 
        title="Trip Details" 
        showBack 
        onBack={() => navigate('/history')} 
      />

      <div className="flex flex-1 flex-col px-4 pb-6">
        {/* Trip Summary */}
        <div className="mt-4 rounded-2xl bg-card p-4 shadow-sm">
          <p className="text-lg font-semibold text-foreground">
            {format(trip.startTime, 'EEEE, MMMM d, yyyy')}
          </p>
          <p className="text-sm text-muted-foreground">
            {format(trip.startTime, 'h:mm a')} - {trip.endTime ? format(trip.endTime, 'h:mm a') : 'Ongoing'}
          </p>

          <div className="mt-4 grid grid-cols-3 gap-4">
            <StatItem 
              icon={Clock} 
              label="Duration" 
              value={`${duration}m`} 
            />
            <StatItem 
              icon={MapPin} 
              label="Distance" 
              value={trip.distance ? `${trip.distance.toFixed(1)}km` : '-'} 
            />
            <StatItem 
              icon={Activity} 
              label="Alertness" 
              value={trip.averageAlertness ? `${trip.averageAlertness}%` : '-'} 
            />
          </div>
        </div>

        {/* Alert Timeline */}
        <div className="mt-6">
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Events ({trip.alerts.length})
          </h2>

          {trip.alerts.length > 0 ? (
            <div className="space-y-3">
              {trip.alerts.map((alert, index) => (
                <div 
                  key={alert.id}
                  className={cn(
                    'rounded-xl border p-4',
                    severityColors[alert.severity]
                  )}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertTriangle className="h-5 w-5" />
                      <span className="font-semibold capitalize">{alert.type.replace('_', ' ')}</span>
                    </div>
                    <span className="text-sm">
                      {format(alert.timestamp, 'h:mm a')}
                    </span>
                  </div>
                  <p className="mt-1 text-sm opacity-80">
                    Confidence: {alert.confidence}% • Severity: {alert.severity}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-2xl bg-success/10 p-4 text-center">
              <p className="text-success">No alerts during this trip. Great job!</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function StatItem({ icon: Icon, label, value }: { icon: React.ComponentType<{ className?: string }>; label: string; value: string }) {
  return (
    <div className="text-center">
      <Icon className="mx-auto mb-1 h-5 w-5 text-muted-foreground" />
      <p className="text-lg font-semibold text-foreground">{value}</p>
      <p className="text-xs text-muted-foreground">{label}</p>
    </div>
  );
}
