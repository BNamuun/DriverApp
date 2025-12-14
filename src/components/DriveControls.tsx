import { Home, AlertTriangle, Volume2 } from 'lucide-react';
import { Button } from './ui/button';

interface DriveControlsProps {
  onPause: () => void;
  onEmergency: () => void;
  onAudio: () => void;
}

export function DriveControls({ onPause, onEmergency, onAudio }: DriveControlsProps) {
  return (
    <div className="flex items-center justify-around rounded-2xl bg-drive-card p-4">
      <Button variant="drive" size="iconLg" onClick={onPause} className="flex flex-col gap-1 h-auto py-3">
        <Home className="h-6 w-6" />
        <span className="text-xs">Pause</span>
      </Button>
      
      <Button variant="driveAction" size="iconLg" onClick={onEmergency} className="flex flex-col gap-1 h-auto py-3 px-6">
        <AlertTriangle className="h-6 w-6" />
        <span className="text-xs">Emergency</span>
      </Button>
      
      <Button variant="drive" size="iconLg" onClick={onAudio} className="flex flex-col gap-1 h-auto py-3">
        <Volume2 className="h-6 w-6" />
        <span className="text-xs">Audio</span>
      </Button>
    </div>
  );
}
