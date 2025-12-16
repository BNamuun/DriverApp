import { cn } from '@/lib/utils';
import { Camera, Eye } from 'lucide-react';

interface CameraPreviewProps {
  className?: string;
  showStatus?: boolean;
  eyesOpen?: boolean;
  blinkRate?: string;
  videoRef?: React.RefObject<HTMLVideoElement>;
  /** Mirror the camera feed (useful for front camera / selfie view). */
  mirror?: boolean;
  /** Optional content rendered on top of the video (e.g. permission/loading UI). */
  overlay?: React.ReactNode;
}

export function CameraPreview({
  className,
  showStatus = true,
  eyesOpen = true,
  blinkRate = 'normal',
  videoRef,
  mirror = true,
  overlay,
}: CameraPreviewProps) {
  return (
    <div className={cn('overflow-hidden rounded-2xl bg-drive-card', className)}>
      {showStatus && (
        <div className="flex items-center justify-center gap-2 bg-drive-bg/50 px-4 py-2 text-sm text-drive-foreground">
          <Eye className="h-4 w-4" />
          <span>Eyes: {eyesOpen ? 'Open' : 'Closed'}</span>
          <span className="text-drive-muted">•</span>
          <span>Blink rate {blinkRate}</span>
        </div>
      )}

      <div className="relative aspect-[4/3] bg-drive-bg">
        {videoRef ? (
          <video
            ref={videoRef}
            className={cn(
              'absolute inset-0 h-full w-full object-cover',
              mirror && '-scale-x-100'
            )}
            playsInline
            muted
            autoPlay
          />
        ) : (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="flex flex-col items-center gap-3 text-drive-muted">
              <Camera className="h-12 w-12" />
              <span className="text-sm">Camera Preview</span>
            </div>
          </div>
        )}

        {/* Face outline guide */}
        <div className="absolute inset-8 rounded-full border-2 border-dashed border-drive-muted/30" />

        {overlay && <div className="absolute inset-0">{overlay}</div>}
      </div>
    </div>
  );
}
