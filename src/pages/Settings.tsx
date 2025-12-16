import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Volume2, 
  Vibrate, 
  Phone, 
  Shield, 
  Download, 
  Bell,
  ChevronRight,
  User
} from 'lucide-react';
import { Header } from '@/components/Header';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { mockUserSettings } from '@/data/mockData';
import { cn } from '@/lib/utils';

export default function Settings() {
  const navigate = useNavigate();
  const [settings, setSettings] = useState(mockUserSettings);

  const updateSetting = <K extends keyof typeof settings>(
    key: K, 
    value: typeof settings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="flex min-h-screen min-h-dvh flex-col bg-background">
      <Header 
        title="Settings" 
        showBack 
        onBack={() => navigate('/home')} 
      />

      <div className="flex flex-1 flex-col gap-6 px-4 pb-6 pt-4 safe-bottom">
        {/* Alert Settings */}
        <SettingsSection title="Alerts">
          <SettingsItem 
            icon={Volume2} 
            label="Alert Volume"
            description={`${settings.alertVolume}%`}
          >
            <Slider
              value={[settings.alertVolume]}
              onValueChange={([val]) => updateSetting('alertVolume', val)}
              max={100}
              step={5}
              className="w-24 sm:w-32"
            />
          </SettingsItem>

          <SettingsItem 
            icon={Vibrate} 
            label="Vibration"
            description="Vibrate on alerts"
          >
            <Switch
              checked={settings.vibrationEnabled}
              onCheckedChange={(checked) => updateSetting('vibrationEnabled', checked)}
            />
          </SettingsItem>

          <SettingsItem 
            icon={Bell} 
            label="Alert Escalation"
            description="Configure alert levels"
            onClick={() => {}}
          >
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </SettingsItem>
        </SettingsSection>

        {/* Emergency Contact */}
        <SettingsSection title="Emergency">
          <SettingsItem 
            icon={Phone} 
            label="Emergency Contact"
            description={settings.emergencyContact?.name || 'Not set'}
            onClick={() => {}}
          >
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </SettingsItem>
        </SettingsSection>

        {/* Privacy */}
        <SettingsSection title="Privacy">
          <SettingsItem 
            icon={Shield} 
            label="Save Event Clips"
            description="Store video when alerts trigger"
          >
            <Switch
              checked={settings.saveEventClips}
              onCheckedChange={(checked) => updateSetting('saveEventClips', checked)}
            />
          </SettingsItem>

          <SettingsItem 
            icon={Download} 
            label="Export Data"
            description="Download your trip history"
            onClick={() => {}}
          >
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </SettingsItem>
        </SettingsSection>

        {/* Account */}
        <SettingsSection title="Account">
          <SettingsItem 
            icon={User} 
            label="Profile"
            description="Manage your account"
            onClick={() => {}}
          >
            <ChevronRight className="h-5 w-5 text-muted-foreground" />
          </SettingsItem>
        </SettingsSection>
      </div>
    </div>
  );
}

function SettingsSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="mb-2 text-sm font-semibold uppercase tracking-wide text-muted-foreground">
        {title}
      </p>
      <div className="overflow-hidden rounded-2xl bg-card">
        {children}
      </div>
    </div>
  );
}

interface SettingsItemProps {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  description?: string;
  children?: React.ReactNode;
  onClick?: () => void;
}

function SettingsItem({ icon: Icon, label, description, children, onClick }: SettingsItemProps) {
  const Comp = onClick ? 'button' : 'div';
  
  return (
    <Comp
      className={cn(
        'flex w-full items-center gap-4 border-b border-border/50 p-4 last:border-b-0',
        onClick && 'hover:bg-accent active:bg-accent/80'
      )}
      onClick={onClick}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div className="flex-1 text-left">
        <p className="font-medium text-foreground">{label}</p>
        {description && (
          <p className="text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {children}
    </Comp>
  );
}
