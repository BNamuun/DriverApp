import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Camera, History, Activity, CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Header } from "@/components/Header"
import { StatusCard } from "@/components/StatusCard"
import { DashboardTile } from "@/components/DashboardTile"
import { mockTrips, mockCameraStatus } from "@/data/mockData"
import { useToast } from "@/components/ui/use-toast"
import { getApiUrl } from "@/lib/api"

export default function Home() {
  const navigate = useNavigate()
  const { toast } = useToast()
  const [isStarting, setIsStarting] = useState(false)

  const recentAlerts = mockTrips.reduce(
    (sum, trip) => sum + trip.alerts.length,
    0
  )

  const handleStartDrive = async () => {
    setIsStarting(true)
    try {
      const res = await fetch(getApiUrl("api/drive/health"))
      if (!res.ok) throw new Error(`Backend unavailable (${res.status})`)
      console.log("respons:", res)
      const data = await res.json()
      console.log("data:", data)
      if (!data?.ok) throw new Error(data?.error ?? "ML service not ready")

      navigate("/drive")
    } catch (err) {
      toast({
        variant: "destructive",
        title: "Cannot start drive",
        description:
          err instanceof Error
            ? err.message
            : "Backend / ML service is not running (start backend-api + ml-service).",
      })
    } finally {
      setIsStarting(false)
    }
  }

  return (
    <div className="flex min-h-screen min-h-dvh flex-col bg-background">
      <Header showSettings onSettings={() => navigate("/settings")} />

      <div className="flex flex-1 flex-col px-4 pb-6 safe-bottom">
        {/* App Title */}
        <div className="py-4">
          <h1 className="text-2xl font-bold text-foreground">Co-Pilot</h1>
          <p className="text-muted-foreground">Drowsiness Guard</p>
        </div>

        {/* Status Card */}
        <StatusCard status="good" className="mb-6" />

        {/* Quick Tiles */}
        <div className="mb-6 grid grid-cols-2 gap-3">
          <DashboardTile
            icon={Camera}
            label="Camera Check"
            onClick={() => navigate("/camera-setup")}
            badge={mockCameraStatus.calibrated ? undefined : "!"}
          />
          <DashboardTile
            icon={History}
            label="Trip History"
            onClick={() => navigate("/history")}
            badge={recentAlerts > 0 ? String(recentAlerts) : undefined}
          />
        </div>

        {/* Model Status */}
        <div className="mb-6 rounded-2xl bg-card p-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-success/10">
              <Activity className="h-5 w-5 text-success" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-foreground">Model Status</p>
              <p className="text-sm text-muted-foreground">
                ML ready • Low latency
              </p>
            </div>
            <CheckCircle className="h-5 w-5 text-success" />
          </div>
        </div>

        {/* Start Drive CTA */}
        <div className="mt-[50px]">
          <Button
            className="w-full"
            size="lg"
            onClick={handleStartDrive}
            disabled={isStarting}
          >
            {isStarting ? "Connecting…" : "Start Drive"}
          </Button>
        </div>
      </div>
    </div>
  )
}
