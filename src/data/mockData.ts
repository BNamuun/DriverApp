import { Trip, Alert, MLOutput, UserSettings, CameraStatus } from '@/types';

export const mockMLOutput: MLOutput = {
  blinkRate: 15,
  eyeClosedDuration: 0.2,
  yawnDetected: false,
  headNodDetected: false,
  confidence: 94,
  riskLevel: 'safe',
};

export const mockDrowsyMLOutput: MLOutput = {
  blinkRate: 8,
  eyeClosedDuration: 1.8,
  yawnDetected: true,
  headNodDetected: true,
  confidence: 87,
  riskLevel: 'severe',
};

export const mockAlerts: Alert[] = [
  {
    id: '1',
    timestamp: new Date(Date.now() - 3600000),
    severity: 'medium',
    confidence: 78,
    type: 'drowsiness',
  },
  {
    id: '2',
    timestamp: new Date(Date.now() - 7200000),
    severity: 'low',
    confidence: 65,
    type: 'yawn',
  },
  {
    id: '3',
    timestamp: new Date(Date.now() - 86400000),
    severity: 'high',
    confidence: 91,
    type: 'eyes_closed',
  },
];

export const mockTrips: Trip[] = [
  {
    id: '1',
    startTime: new Date(Date.now() - 3600000),
    endTime: new Date(Date.now() - 1800000),
    alerts: [mockAlerts[0]],
    distance: 45.2,
    averageAlertness: 85,
  },
  {
    id: '2',
    startTime: new Date(Date.now() - 86400000),
    endTime: new Date(Date.now() - 82800000),
    alerts: [mockAlerts[1], mockAlerts[2]],
    distance: 120.5,
    averageAlertness: 72,
  },
  {
    id: '3',
    startTime: new Date(Date.now() - 172800000),
    endTime: new Date(Date.now() - 169200000),
    alerts: [],
    distance: 35.0,
    averageAlertness: 95,
  },
];

export const mockUserSettings: UserSettings = {
  alertVolume: 80,
  vibrationEnabled: true,
  emergencyContact: {
    name: 'John Doe',
    phone: '+1 234 567 8900',
  },
  saveEventClips: false,
  alertEscalation: {
    level1Delay: 3,
    level2Delay: 6,
    level3Delay: 10,
  },
};

export const mockCameraStatus: CameraStatus = {
  faceVisible: true,
  lightingQuality: 'good',
  calibrated: true,
};
