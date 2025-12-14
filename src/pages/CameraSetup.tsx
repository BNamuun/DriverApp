import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Sun, Moon, CheckCircle, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import { CameraPreview } from '@/components/CameraPreview';

export default function CameraSetup() {
  const navigate = useNavigate();
  const [calibrating, setCalibrating] = useState(false);
  const [calibrationProgress, setCalibrationProgress] = useState(0);
  const [calibrated, setCalibrated] = useState(false);
  
  const [checks, setChecks] = useState({
    faceVisible: true,
    goodLighting: true,
    stablePosition: true,
  });

  useEffect(() => {
    if (calibrating) {
      const interval = setInterval(() => {
        setCalibrationProgress(prev => {
          if (prev >= 100) {
            clearInterval(interval);
            setCalibrating(false);
            setCalibrated(true);
            return 100;
          }
          return prev + 3.33;
        });
      }, 1000);
      return () => clearInterval(interval);
    }
  }, [calibrating]);

  const handleStartCalibration = () => {
    setCalibrating(true);
    setCalibrationProgress(0);
  };

  const allChecksPassed = Object.values(checks).every(Boolean);

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Header 
        title="Camera Setup" 
        showBack 
        onBack={() => navigate(-1)} 
      />

      <div className="flex flex-1 flex-col px-4 pb-6">
        {/* Camera Preview */}
        <div className="mt-4">
          <CameraPreview showStatus={false} />
        </div>

        {/* Face Visibility Meter */}
        <div className="mt-6 rounded-2xl bg-card p-4 shadow-sm">
          <p className="mb-3 font-semibold">Face Visibility Check</p>
          <div className="space-y-3">
            <CheckItem 
              label="Face detected" 
              passed={checks.faceVisible} 
            />
            <CheckItem 
              label="Good lighting" 
              passed={checks.goodLighting} 
              hint="Move closer to a light source if needed"
            />
            <CheckItem 
              label="Stable position" 
              passed={checks.stablePosition} 
            />
          </div>
        </div>

        {/* Lighting Tips */}
        <div className="mt-4 rounded-2xl bg-muted p-4">
          <p className="mb-2 text-sm font-semibold text-foreground">Lighting Tips</p>
          <div className="flex gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Sun className="h-4 w-4 text-warning" />
              <span>Avoid direct sunlight</span>
            </div>
            <div className="flex items-center gap-2">
              <Moon className="h-4 w-4" />
              <span>Night mode available</span>
            </div>
          </div>
        </div>

        {/* Calibration Progress */}
        {calibrating && (
          <div className="mt-6">
            <p className="mb-2 text-center text-sm text-muted-foreground">
              Calibrating... {Math.round(calibrationProgress)}%
            </p>
            <div className="h-2 overflow-hidden rounded-full bg-muted">
              <div 
                className="h-full bg-primary transition-all duration-300"
                style={{ width: `${calibrationProgress}%` }}
              />
            </div>
            <p className="mt-2 text-center text-xs text-muted-foreground">
              Keep looking at the camera naturally
            </p>
          </div>
        )}

        {calibrated && (
          <div className="mt-6 flex items-center justify-center gap-2 text-success">
            <CheckCircle className="h-5 w-5" />
            <span className="font-semibold">Calibration Complete!</span>
          </div>
        )}

        {/* Actions */}
        <div className="mt-auto pt-6">
          {!calibrated ? (
            <Button 
              className="w-full" 
              size="lg"
              disabled={!allChecksPassed || calibrating}
              onClick={handleStartCalibration}
            >
              {calibrating ? 'Calibrating...' : 'Start Calibration (30s)'}
            </Button>
          ) : (
            <Button 
              className="w-full" 
              size="lg"
              onClick={() => navigate('/home')}
            >
              Continue to Home
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

function CheckItem({ label, passed, hint }: { label: string; passed: boolean; hint?: string }) {
  return (
    <div className="flex items-center gap-3">
      {passed ? (
        <CheckCircle className="h-5 w-5 text-success" />
      ) : (
        <XCircle className="h-5 w-5 text-alert-danger" />
      )}
      <div>
        <p className={passed ? 'text-foreground' : 'text-alert-danger'}>{label}</p>
        {hint && !passed && (
          <p className="text-xs text-muted-foreground">{hint}</p>
        )}
      </div>
    </div>
  );
}
