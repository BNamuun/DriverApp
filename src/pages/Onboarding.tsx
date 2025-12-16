import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Camera, MapPin, Shield, ChevronRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { PermissionItem } from "@/components/PermissionItem"

const steps = [
  {
    id: "welcome",
    title: "Welcome to Co-Pilot",
    subtitle: "Your drowsiness detection guardian",
    description:
      "Stay safe on the road with real-time alertness monitoring powered by on-device AI.",
  },
  {
    id: "permissions",
    title: "Permissions",
    subtitle: "We need a few things to keep you safe",
    description:
      "Grant the following permissions to enable drowsiness detection.",
  },
  {
    id: "privacy",
    title: "Your Privacy Matters",
    subtitle: "On-device processing by default",
    description:
      "All face analysis happens on your device. No video is sent to the cloud unless you opt-in.",
  },
  {
    id: "disclaimer",
    title: "Safety Disclaimer",
    subtitle: "Important information",
    description:
      "Co-Pilot is a driver assistance tool. It does not replace safe driving practices. Always stay alert and follow traffic laws.",
  },
]

export default function Onboarding() {
  const navigate = useNavigate()
  const [currentStep, setCurrentStep] = useState(0)
  const [permissions, setPermissions] = useState({
    camera: false,
    location: false,
  })

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1

  const handleNext = () => {
    if (isLastStep) {
      navigate("/camera-setup")
    } else {
      setCurrentStep((prev) => prev + 1)
    }
  }

  const handleGrantPermission = (type: "camera" | "location") => {
    setPermissions((prev) => ({ ...prev, [type]: true }))
  }

  const canProceed = currentStep !== 1 || permissions.camera

  return (
    <div className="flex h-screen h-dvh flex-col bg-background safe-top safe-bottom">
      {/* Progress indicator */}
      <div className="flex gap-2 p-3">
        {steps.map((_, idx) => (
          <div
            key={idx}
            className={`h-1 flex-1 rounded-full transition-colors ${
              idx <= currentStep ? "bg-primary" : "bg-muted"
            }`}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col px-6 py-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">{step.title}</h1>
          <p className="mt-1 text-base text-primary">{step.subtitle}</p>
          <p className="mt-2 text-sm text-muted-foreground">
            {step.description}
          </p>
        </div>

        {step.id === "permissions" && (
          <div className="flex flex-col gap-2 mt-6">
            <PermissionItem
              icon={Camera}
              title="Camera Access"
              description="Required for face detection and drowsiness monitoring"
              granted={permissions.camera}
              required
              onRequest={() => handleGrantPermission("camera")}
            />
            <PermissionItem
              icon={MapPin}
              title="Location (Optional)"
              description="Used for trip tracking and emergency services"
              granted={permissions.location}
              onRequest={() => handleGrantPermission("location")}
            />
          </div>
        )}

        {step.id === "privacy" && (
          <div className="flex flex-col gap-3 mt-6">
            <div className="rounded-xl bg-success/10 p-3">
              <div className="flex items-center gap-3">
                <Shield className="h-7 w-7 text-success" />
                <div>
                  <p className="font-semibold text-success">
                    On-Device Processing
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Your face data never leaves your phone
                  </p>
                </div>
              </div>
            </div>
            <div className="rounded-xl bg-card p-3">
              <p className="text-sm text-muted-foreground leading-snug">
                • Face detection runs locally using TensorFlow Lite
                <br />
                • No cloud uploads unless you enable event clips
                <br />• All data can be exported or deleted anytime
              </p>
            </div>
          </div>
        )}

        {step.id === "disclaimer" && (
          <div className="rounded-xl border-2 border-warning/30 bg-warning/5 p-3 mt-6">
            <p className="text-sm leading-snug text-foreground">
              ⚠️{" "}
              <strong>
                This app is an aid, not a replacement for driver attention.
              </strong>
              <br />
              <br />
              • Never rely solely on this app
              <br />
              • Pull over immediately if you feel drowsy
              <br />
              • The app may not detect all signs of fatigue
              <br />• You are responsible for safe driving at all times
            </p>
          </div>
        )}

        <div className="mt-auto pt-6">
          <Button
            className="w-full"
            size="lg"
            onClick={handleNext}
            disabled={!canProceed}
          >
            {isLastStep ? "Get Started" : "Continue"}
            <ChevronRight className="h-5 w-5" />
          </Button>

          {currentStep > 0 && (
            <Button
              variant="ghost"
              className="mt-2 w-full"
              onClick={() => setCurrentStep((prev) => prev - 1)}
            >
              Back
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}
