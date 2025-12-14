import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { AlertnessGauge } from '@/components/AlertnessGauge';
import { CameraPreview } from '@/components/CameraPreview';
import { DriveControls } from '@/components/DriveControls';
import { mockMLOutput, mockDrowsyMLOutput } from '@/data/mockData';
import { MLOutput } from '@/types';

export default function DriveMode() {
  const navigate = useNavigate();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [mlOutput, setMLOutput] = useState<MLOutput>(mockMLOutput);
  const [speed] = useState(30);

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Simulate drowsiness detection after 10 seconds
  useEffect(() => {
    const timeout = setTimeout(() => {
      setMLOutput(mockDrowsyMLOutput);
      navigate('/alert');
    }, 10000);
    return () => clearTimeout(timeout);
  }, [navigate]);

  const handlePause = () => {
    navigate('/home');
  };

  const handleEmergency = () => {
    navigate('/alert');
  };

  const handleAudio = () => {
    // Toggle audio settings
  };

  return (
    <div className="flex min-h-screen flex-col bg-drive-bg safe-top safe-bottom">
      {/* Top Bar */}
      <div className="flex items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/20">
            <div className="h-3 w-3 animate-pulse rounded-full bg-primary" />
          </div>
        </div>
        
        <div className="text-center">
          <p className="text-3xl font-bold text-drive-foreground">{speed}</p>
          <p className="text-xs text-drive-muted">km/h</p>
        </div>
        
        <div className="text-right">
          <p className="text-lg font-semibold text-drive-foreground">
            {format(currentTime, 'h:mm')}
          </p>
          <p className="text-xs text-drive-muted">
            {format(currentTime, 'a')}
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex flex-1 flex-col px-4">
        {/* Alertness Gauge */}
        <div className="flex flex-col items-center py-4">
          <AlertnessGauge 
            confidence={mlOutput.confidence} 
            riskLevel={mlOutput.riskLevel} 
          />
          <p className="mt-4 text-sm text-drive-muted">
            Eyes: {mlOutput.eyeClosedDuration < 0.5 ? 'Open' : 'Closed'} • 
            Blink rate {mlOutput.blinkRate > 10 ? 'normal' : 'slow'}
          </p>
        </div>

        {/* Camera Preview */}
        <div className="flex-1 py-4">
          <CameraPreview 
            className="h-full"
            showStatus={false}
            eyesOpen={mlOutput.eyeClosedDuration < 0.5}
            blinkRate={mlOutput.blinkRate > 10 ? 'normal' : 'slow'}
          />
        </div>

        {/* ML Debug Info (hidden in production) */}
        <div className="mb-4 rounded-xl bg-drive-card/50 p-3">
          <p className="text-xs text-drive-muted">
            Blink: {mlOutput.blinkRate}/min • 
            Eye closed: {mlOutput.eyeClosedDuration.toFixed(1)}s • 
            Yawn: {mlOutput.yawnDetected ? 'Yes' : 'No'} • 
            Nod: {mlOutput.headNodDetected ? 'Yes' : 'No'}
          </p>
        </div>

        {/* Controls */}
        <DriveControls 
          onPause={handlePause}
          onEmergency={handleEmergency}
          onAudio={handleAudio}
        />
      </div>
    </div>
  );
}
