import { useNavigate } from 'react-router-dom';
import { MapPin, Volume2, Phone, Car, CheckCircle, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { NearbyRestAreasMap } from '@/components/NearbyRestAreasMap';

export default function AlertScreen() {
  const navigate = useNavigate();

  const handlePullOver = () => {
    // Guidance for pulling over
  };

  const handlePlayAlarm = () => {
    // Play loud alarm sound
  };

  const handleCallEmergency = () => {
    // Initiate call to emergency contact
  };

  const handleDismiss = () => {
    navigate('/drive');
  };

  return (
    <div className="flex min-h-screen min-h-dvh flex-col bg-background safe-top safe-bottom">
      {/* Alert Banner */}
      <div className="flex flex-col items-center bg-alert-danger px-4 py-6 sm:py-8 text-center">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary-foreground/20">
          <MapPin className="h-8 w-8 text-primary-foreground" />
        </div>
        <h1 className="text-2xl font-bold text-primary-foreground sm:text-3xl">DROWSINESS DETECTED</h1>
        <p className="mt-2 text-primary-foreground/80">Your alertness level has dropped significantly</p>
      </div>

      {/* Actions */}
      <div className="flex flex-1 flex-col gap-4 p-4">
        <Button 
          variant="alert" 
          size="xl" 
          className="w-full"
          onClick={handlePullOver}
        >
          <Car className="h-6 w-6" />
          Pull Over Safely
        </Button>

        <Button 
          variant="alert" 
          size="xl" 
          className="w-full"
          onClick={handlePlayAlarm}
        >
          <Volume2 className="h-6 w-6" />
          Play Alarm
        </Button>

        <Button 
          variant="outline" 
          size="xl" 
          className="w-full border-foreground"
          onClick={handleCallEmergency}
        >
          <Phone className="h-6 w-6" />
          Call Emergency Contact
        </Button>

        {/* Safety Checklist */}
        <div className="mt-4 rounded-2xl bg-muted p-4">
          <p className="mb-3 font-semibold text-foreground">Safety Checklist</p>
          <div className="space-y-2 text-sm">
            <ChecklistItem label="Turn on hazard lights" />
            <ChecklistItem label="Slow down gradually" />
            <ChecklistItem label="Pull to a safe location" />
            <ChecklistItem label="Take a 15-20 minute rest" />
          </div>
        </div>

        {/* Nearby Rest Areas Map */}
        <div className="flex-1 overflow-hidden rounded-2xl bg-muted">
          <NearbyRestAreasMap radiusMeters={5000} />
        </div>

        {/* Dismiss */}
        <div className="flex gap-3 pt-4">
          <Button 
            variant="ghost" 
            size="lg" 
            className="flex-1"
            onClick={() => navigate('/home')}
          >
            <Home className="h-5 w-5" />
            End Trip
          </Button>
          <Button 
            variant="secondary" 
            size="lg" 
            className="flex-1"
            onClick={handleDismiss}
          >
            I'm Alert Now
          </Button>
        </div>
      </div>
    </div>
  );
}

function ChecklistItem({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2">
      <CheckCircle className="h-4 w-4 text-success" />
      <span className="text-muted-foreground">{label}</span>
    </div>
  );
}
