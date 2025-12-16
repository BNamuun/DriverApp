import { useNavigate } from 'react-router-dom';
import { History } from 'lucide-react';
import { Header } from '@/components/Header';
import { TripCard } from '@/components/TripCard';
import { EmptyState } from '@/components/EmptyState';
import { mockTrips } from '@/data/mockData';

export default function TripHistory() {
  const navigate = useNavigate();

  const hasTrips = mockTrips.length > 0;

  return (
    <div className="flex min-h-screen min-h-dvh flex-col bg-background">
      <Header 
        title="Trip History" 
        showBack 
        onBack={() => navigate('/home')} 
      />

      <div className="flex flex-1 flex-col px-4 pb-6 safe-bottom">
        {hasTrips ? (
          <div className="flex flex-col gap-3 pt-4">
            {mockTrips.map(trip => (
              <TripCard 
                key={trip.id}
                trip={trip}
                onClick={() => navigate(`/trip/${trip.id}`)}
              />
            ))}
          </div>
        ) : (
          <EmptyState
            icon={History}
            title="No trips yet"
            description="Your trip history will appear here after your first drive."
            action={{
              label: 'Start Your First Trip',
              onClick: () => navigate('/drive'),
            }}
          />
        )}
      </div>
    </div>
  );
}
