import { useState, useEffect, useRef, useCallback } from "react";

interface UseCameraOptions {
  autoStart?: boolean;
  facingMode?: "user" | "environment";
}

interface UseCameraReturn {
  videoRef: React.RefObject<HTMLVideoElement>;
  stream: MediaStream | null;
  isActive: boolean;
  error: string | null;
  isLoading: boolean;
  startCamera: () => Promise<void>;
  stopCamera: () => void;
}

export function useCamera(options: UseCameraOptions = {}): UseCameraReturn {
  const { autoStart = false, facingMode = "user" } = options;
  
  const videoRef = useRef<HTMLVideoElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [isActive, setIsActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const startCamera = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode,
          width: { ideal: 640 },
          height: { ideal: 480 },
        },
        audio: false,
      });
      
      setStream(mediaStream);
      
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
        await videoRef.current.play();
      }
      
      setIsActive(true);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to access camera";
      
      if (err instanceof DOMException) {
        if (err.name === "NotAllowedError") {
          setError("Camera access denied. Please allow camera permissions.");
        } else if (err.name === "NotFoundError") {
          setError("No camera found on this device.");
        } else if (err.name === "NotReadableError") {
          setError("Camera is in use by another application.");
        } else {
          setError(errorMessage);
        }
      } else {
        setError(errorMessage);
      }
      
      setIsActive(false);
    } finally {
      setIsLoading(false);
    }
  }, [facingMode]);

  const stopCamera = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsActive(false);
  }, [stream]);

  // Auto-start camera if enabled
  useEffect(() => {
    if (autoStart) {
      startCamera();
    }
    
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [autoStart]); // eslint-disable-line react-hooks/exhaustive-deps

  // Attach stream to video element when it changes
  useEffect(() => {
    if (stream && videoRef.current && !videoRef.current.srcObject) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(() => {
        // Autoplay might be blocked, user interaction required
      });
    }
  }, [stream]);

  return {
    videoRef,
    stream,
    isActive,
    error,
    isLoading,
    startCamera,
    stopCamera,
  };
}
