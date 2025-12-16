export type AlertSeverity = "low" | "medium" | "high" | "critical"
export type RiskLevel = "safe" | "mild" | "moderate" | "severe"

export interface MLOutput {
  blinkRate: number // blinks per minute
  eyeClosedDuration: number // seconds
  yawnDetected: boolean
  headNodDetected: boolean
  confidence: number // 0-100
  riskLevel: RiskLevel
}

export interface Alert {
  id: string
  timestamp: Date
  severity: AlertSeverity
  confidence: number
  type: "drowsiness" | "distraction" | "eyes_closed" | "yawn"
}

export interface Trip {
  id: string
  startTime: Date
  endTime?: Date
  alerts: Alert[]
  distance?: number // km
  averageAlertness?: number
}

export interface UserSettings {
  alertVolume: number
  vibrationEnabled: boolean
  emergencyContact?: {
    name: string
    phone: string
  }
  saveEventClips: boolean
  alertEscalation: {
    level1Delay: number // seconds
    level2Delay: number
    level3Delay: number
  }
}

export type AlertnessStatus = "good" | "fair" | "poor" | "critical"

export interface CameraStatus {
  faceVisible: boolean
  lightingQuality: "good" | "fair" | "poor"
  calibrated: boolean
}
