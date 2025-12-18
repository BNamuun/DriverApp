import { useState, useEffect, useMemo, useRef, useCallback } from "react"
import { useNavigate } from "react-router-dom"
import { format } from "date-fns"
import { AlertnessGauge } from "@/components/AlertnessGauge"
import { CameraPreview } from "@/components/CameraPreview"
import { DriveControls } from "@/components/DriveControls"
import { Button } from "@/components/ui/button"
import { useCamera } from "@/hooks/useCamera"
import { mockMLOutput } from "@/data/mockData"
import { MLOutput, RiskLevel } from "@/types"
import { useToast } from "@/components/ui/use-toast"

type InferResponse = {
  detections: Array<{
    class_id: number
    class_name: string
    conf: number
    xyxy: number[]
  }>
  signals: {
    awake?: boolean
    yawn?: boolean
    tired?: boolean
    eye_closed?: boolean
    asleep?: boolean
    close?: boolean
    closed?: boolean
  }
}

function computeRisk(
  eyeClosedDuration: number,
  signals: InferResponse["signals"],
  consecutiveHeadNods: number,
  headNodDetected: boolean
): { riskLevel: RiskLevel; confidence: number } {
  const secondaryRisk = Boolean(
    signals.yawn || signals.tired || signals.eye_closed || signals.asleep
  )

  // Head nod detected = severe risk with confidence 30
  if (headNodDetected) return { riskLevel: "severe", confidence: 30 }
  // 3 consecutive head nods = severe risk with confidence 30
  if (consecutiveHeadNods >= 3) return { riskLevel: "severe", confidence: 30 }
  if (eyeClosedDuration >= 2) return { riskLevel: "severe", confidence: 40 }
  if (eyeClosedDuration >= 1) return { riskLevel: "moderate", confidence: 60 }
  if (secondaryRisk) return { riskLevel: "mild", confidence: 75 }
  return { riskLevel: "safe", confidence: 94 }
}

export default function DriveMode() {
  const navigate = useNavigate()
  const { toast } = useToast()

  const {
    videoRef,
    isActive: isCameraActive,
    isLoading: isCameraLoading,
    error: cameraError,
    startCamera,
  } = useCamera({ autoStart: true, facingMode: "user" })

  const [currentTime, setCurrentTime] = useState(new Date())
  const [mlOutput, setMLOutput] = useState<MLOutput>(mockMLOutput)
  const [speed] = useState(30)

  const [backendReady, setBackendReady] = useState<boolean | null>(null)

  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const inFlightRef = useRef(false)

  const eyeClosedSinceRef = useRef<number | null>(null)
  const lastEyesClosedRef = useRef(false)
  const lastEyesClosedAtRef = useRef<number | null>(null)
  const blinkTimestampsRef = useRef<number[]>([])
  const drowsyEyeWarningSoundPlayedRef = useRef(false)

  const lastYawnRef = useRef(false)
  const yawnTimestampsRef = useRef<number[]>([])
  const lastYawnSoundAtRef = useRef<number>(0)
  const yawnWarningAudioRef = useRef<HTMLAudioElement | null>(null)

  const severeSinceRef = useRef<number | null>(null)
  
  // Head nod detection: track consecutive detections
  const lastHeadNodRef = useRef(false)
  const consecutiveHeadNodsRef = useRef(0)
  
  // Asleep duration tracking
  const asleepSinceRef = useRef<number | null>(null)
  const alarmAudioRef = useRef<HTMLAudioElement | null>(null)
  const alarmPlayedRef = useRef(false)

  const playYawnWarningSound = useCallback(() => {
    if (yawnWarningAudioRef.current) {
      yawnWarningAudioRef.current.currentTime = 0
      yawnWarningAudioRef.current.play().catch(() => {
        // Ignore autoplay policy errors
      })
    }
  }, [])

  // Initialize alarm audio
  useEffect(() => {
    alarmAudioRef.current = new Audio('/sounds/alarm.mp4')
    alarmAudioRef.current.preload = 'auto'
    alarmAudioRef.current.loop = true // Loop the alarm sound
    
    yawnWarningAudioRef.current = new Audio('/sounds/warning.mp4')
    yawnWarningAudioRef.current.preload = 'auto'
    
    return () => {
      if (alarmAudioRef.current) {
        alarmAudioRef.current.pause()
        alarmAudioRef.current = null
      }
      if (yawnWarningAudioRef.current) {
        yawnWarningAudioRef.current.pause()
        yawnWarningAudioRef.current = null
      }
    }
  }, [])

  // Update time every second
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(new Date())
    }, 1000)
    return () => clearInterval(interval)
  }, [])

  // Check backend + model availability
  useEffect(() => {
    let cancelled = false

    ;(async () => {
      try {
        const res = await fetch("/api/drive/health")
        if (!res.ok) throw new Error(`Backend unavailable (${res.status})`)

        const data = await res.json()
        if (!data?.ok) throw new Error(data?.error ?? "ML service not ready")

        if (!cancelled) setBackendReady(true)
      } catch (err) {
        if (!cancelled) setBackendReady(false)
        toast({
          variant: "destructive",
          title: "ML backend not reachable",
          description:
            err instanceof Error
              ? err.message
              : "Start backend-api + ml-service, then retry.",
        })
      }
    })()

    return () => {
      cancelled = true
    }
  }, [toast])

  // Run inference loop when camera is active
  useEffect(() => {
    if (!isCameraActive) return
    if (backendReady !== true) return

    if (!canvasRef.current) {
      canvasRef.current = document.createElement("canvas")
    }

    const tick = async () => {
      if (!videoRef.current) return
      if (videoRef.current.readyState < 2) return
      if (inFlightRef.current) return

      const now = Date.now()
      const canvas = canvasRef.current
      if (!canvas) return

      // capture a smaller frame to reduce payload size
      const targetW = 320
      const targetH = 240
      canvas.width = targetW
      canvas.height = targetH

      const ctx = canvas.getContext("2d")
      if (!ctx) return

      ctx.drawImage(videoRef.current, 0, 0, targetW, targetH)
      const imageBase64 = canvas.toDataURL("image/jpeg", 0.7)

      inFlightRef.current = true
      try {
        const res = await fetch("/api/drive/infer", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            image_base64: imageBase64,
            conf: 0.35,
            imgsz: 640,
          }),
        })

        if (!res.ok) {
          throw new Error(`Inference HTTP ${res.status}`)
        }

        const data = (await res.json()) as InferResponse
        const signals = data?.signals ?? {}

        // const eyesClosed = Boolean(signals.eye_closed)
        const eyesClosed = Boolean(
          signals.eye_closed || signals.closed || signals.close
        )
        const yawnDetected = Boolean(signals.yawn)
        const headNodDetected = Boolean(signals.asleep)

        // Head nod tracking: count consecutive detections
        if (headNodDetected && !lastHeadNodRef.current) {
          // Rising edge: new head nod detected
          consecutiveHeadNodsRef.current += 1
        } else if (!headNodDetected) {
          // Reset counter when head nod stops
          consecutiveHeadNodsRef.current = 0
        }
        lastHeadNodRef.current = headNodDetected
        
        // Asleep duration tracking: play alarm after 1.5 seconds, navigate only when head nod stops
        if (headNodDetected) {
          if (asleepSinceRef.current === null) {
            asleepSinceRef.current = now
            alarmPlayedRef.current = false
          }
          
          const asleepDuration = (now - asleepSinceRef.current) / 1000
          
          if (asleepDuration >= 1.5 && !alarmPlayedRef.current && alarmAudioRef.current) {
            alarmAudioRef.current.currentTime = 0
            alarmAudioRef.current.play().catch(() => {
              // Ignore autoplay policy errors
            })
            alarmPlayedRef.current = true
          }
        } else {
          // When head nod stops, navigate to alert page if alarm was played
          if (alarmPlayedRef.current) {
            if (alarmAudioRef.current) {
              alarmAudioRef.current.pause()
              alarmAudioRef.current.currentTime = 0
            }
            navigate('/alert')
          }
          asleepSinceRef.current = null
          alarmPlayedRef.current = false
        }

        // Yawn window: count only rising edges (false -> true), keep last 60s
        const newYawn = !lastYawnRef.current && yawnDetected
        if (newYawn) {
          yawnTimestampsRef.current.push(now)
        }
        lastYawnRef.current = yawnDetected

        yawnTimestampsRef.current = yawnTimestampsRef.current.filter(
          (t) => now - t <= 60_000
        )

        if (
          newYawn &&
          yawnTimestampsRef.current.length >= 5 &&
          now - lastYawnSoundAtRef.current >= 15_000
        ) {
          lastYawnSoundAtRef.current = now
          void playYawnWarningSound()
        }

        // Eye-closed duration (seconds)
        if (eyesClosed) {
          if (eyeClosedSinceRef.current === null) {
            eyeClosedSinceRef.current = now
            drowsyEyeWarningSoundPlayedRef.current = false
          }
        } else {
          eyeClosedSinceRef.current = null
          drowsyEyeWarningSoundPlayedRef.current = false
        }
        const eyeClosedDuration =
          eyesClosed && eyeClosedSinceRef.current !== null
            ? (now - eyeClosedSinceRef.current) / 1000
            : 0
        
        // Play warning sound if drowsy eye duration reaches 30 seconds
        if (eyeClosedDuration >= 30 && !drowsyEyeWarningSoundPlayedRef.current) {
          playYawnWarningSound()
          drowsyEyeWarningSoundPlayedRef.current = true
        }

        // Blink rate estimate (blinks per minute) using close->open transitions
        if (!lastEyesClosedRef.current && eyesClosed) {
          lastEyesClosedAtRef.current = now
        }
        if (lastEyesClosedRef.current && !eyesClosed) {
          const closedAt = lastEyesClosedAtRef.current
          if (closedAt != null && now - closedAt <= 600) {
            blinkTimestampsRef.current.push(now)
          }
          lastEyesClosedAtRef.current = null
        }
        lastEyesClosedRef.current = eyesClosed

        // keep only last 60s
        blinkTimestampsRef.current = blinkTimestampsRef.current.filter(
          (t) => now - t <= 60_000
        )
        const blinkRate = blinkTimestampsRef.current.length

        const { riskLevel, confidence } = computeRisk(
          eyeClosedDuration,
          signals,
          consecutiveHeadNodsRef.current,
          headNodDetected
        )

        // Navigate to alert if severe is sustained (but not for head nod - that has its own logic)
        if (riskLevel === "severe" && !headNodDetected) {
          if (severeSinceRef.current === null) severeSinceRef.current = now
          if (
            severeSinceRef.current !== null &&
            now - severeSinceRef.current >= 1500
          ) {
            navigate("/alert")
          }
        } else {
          severeSinceRef.current = null
        }

        setMLOutput({
          blinkRate,
          eyeClosedDuration,
          yawnDetected,
          headNodDetected,
          confidence,
          riskLevel,
        })
      } catch {
        // If inference fails repeatedly, the user will see stale UI; keep the loop running.
      } finally {
        inFlightRef.current = false
      }
    }

    const interval = setInterval(() => {
      void tick()
    }, 900)

    return () => clearInterval(interval)
  }, [backendReady, isCameraActive, navigate, playYawnWarningSound, videoRef])

  const handlePause = () => {
    navigate("/home")
  }

  const handleEmergency = () => {
    navigate("/alert")
  }

  const handleAudio = () => {
    // Toggle audio settings
  }

  const cameraOverlay = useMemo(() => {
    // If the camera is active, show nothing.
    if (isCameraActive) return null

    const title = cameraError ? "Camera unavailable" : "Enable camera"
    const description = cameraError
      ? cameraError
      : "Co-Pilot needs access to your camera to monitor alertness during drive mode."

    return (
      <div className="absolute inset-0 flex items-center justify-center bg-drive-bg/70 p-4 backdrop-blur-sm">
        <div className="w-full max-w-sm rounded-2xl bg-drive-card p-4 text-center shadow-lg">
          <p className="text-base font-semibold text-drive-foreground">
            {title}
          </p>
          <p className="mt-2 text-sm text-drive-muted">{description}</p>
          <Button
            variant="driveAction"
            className="mt-4 w-full"
            onClick={() => startCamera()}
            disabled={isCameraLoading}
          >
            {isCameraLoading ? "Requesting…" : "Enable Camera"}
          </Button>
          <p className="mt-3 text-xs text-drive-muted">
            Tip: If you previously denied access, update your browser/site
            camera permissions and try again.
          </p>
        </div>
      </div>
    )
  }, [cameraError, isCameraActive, isCameraLoading, startCamera])

  return (
    <div className="flex min-h-screen min-h-dvh flex-col bg-drive-bg safe-top safe-bottom">
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
            {format(currentTime, "h:mm")}
          </p>
          <p className="text-xs text-drive-muted">{format(currentTime, "a")}</p>
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
            Eyes: {mlOutput.eyeClosedDuration < 0.5 ? "Open" : "Closed"} • Drowsy:{" "}
            {mlOutput.riskLevel === "severe" || mlOutput.riskLevel === "moderate" ? "Yes" : "No"}
          </p>
        </div>

        {/* Camera Preview */}
        <div className="flex-1 py-4">
          <CameraPreview
            className="h-full"
            showStatus={false}
            eyesOpen={mlOutput.eyeClosedDuration < 0.5}
            blinkRate={mlOutput.blinkRate > 10 ? "normal" : "slow"}
            videoRef={videoRef}
            mirror
            overlay={cameraOverlay}
          />
        </div>

        {/* ML Debug Info (hidden in production) */}
        <div className="mb-4 rounded-xl bg-drive-card/50 p-3">
          <p className="text-xs text-drive-muted">
            Blink: {mlOutput.blinkRate}/min • Eye closed:{" "}
            {mlOutput.eyeClosedDuration.toFixed(1)}s • Yawn:{" "}
            {mlOutput.yawnDetected ? "Yes" : "No"} • Nod:{" "}
            {mlOutput.headNodDetected ? "Yes" : "No"}
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
  )
}
