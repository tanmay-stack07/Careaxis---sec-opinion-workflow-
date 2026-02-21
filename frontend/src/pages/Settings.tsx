import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  Bell,
  Building2,
  ChevronRight,
  HelpCircle,
  Info,
  Languages,
  LogOut,
  Shield,
  SlidersHorizontal,
  Trash2,
  Upload,
  User,
} from "lucide-react";

import { demoSignOut } from "@/lib/demo-auth";

import careAxisLogo from "@/assets/careaxis-logo.png";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Switch } from "@/components/ui/switch";
import { toast } from "@/components/ui/sonner";

type SettingsSection =
  | "profile"
  | "security"
  | "notifications"
  | "language"
  | "facility"
  | "preferences"
  | "about"
  | "logout";

type NavItem = {
  key: SettingsSection;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

const navItems: NavItem[] = [
  { key: "profile", label: "Profile Settings", icon: User },
  { key: "security", label: "Security & Password", icon: Shield },
  { key: "notifications", label: "Notifications", icon: Bell },
  { key: "language", label: "Language & Region", icon: Languages },
  { key: "facility", label: "Facility Settings", icon: Building2 },
  { key: "preferences", label: "Preferences", icon: SlidersHorizontal },
  { key: "about", label: "About & Help", icon: Info },
  { key: "logout", label: "Logout", icon: LogOut },
];

function SectionNav({
  value,
  onChange,
  variant,
}: {
  value: SettingsSection;
  onChange: (v: SettingsSection) => void;
  variant: "desktop" | "mobile";
}) {
  return (
    <div className={variant === "desktop" ? "space-y-1" : "space-y-1"}>
      {navItems.map((item) => {
        const Icon = item.icon;
        const active = item.key === value;
        return (
          <Button
            key={item.key}
            type="button"
            variant={active ? "secondary" : "ghost"}
            className={
              "h-11 w-full justify-start gap-3 px-3 " +
              (active ? "bg-primary text-primary-foreground hover:bg-primary/90" : "hover:bg-muted/70")
            }
            onClick={() => onChange(item.key)}
          >
            <Icon className="h-5 w-5" />
            <span className="text-sm font-medium">{item.label}</span>
            <ChevronRight className="ml-auto h-4 w-4 opacity-60" aria-hidden="true" />
          </Button>
        );
      })}
    </div>
  );
}

function PanelShell({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <Card className="border-border/70 bg-card/85 backdrop-blur animate-fade-in">
      <CardHeader>
        <CardTitle style={{ fontFamily: "var(--font-display)" }}>{title}</CardTitle>
        {subtitle ? <div className="text-sm text-muted-foreground">{subtitle}</div> : null}
      </CardHeader>
      <CardContent className="space-y-5">{children}</CardContent>
    </Card>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const [section, setSection] = React.useState<SettingsSection>("profile");

  // Profile
  const [photoUrl, setPhotoUrl] = React.useState<string | null>(null);
  const [fullName, setFullName] = React.useState("Dr. Sharma");
  const [email] = React.useState("dr.sharma@phc.gov.in");
  const [phone, setPhone] = React.useState("+91-9876543210");
  const [facility, setFacility] = React.useState("PHC - XYZ Village");

  // Security
  const [currentPassword, setCurrentPassword] = React.useState("");
  const [newPassword, setNewPassword] = React.useState("");
  const [confirmPassword, setConfirmPassword] = React.useState("");
  const [twoFactorEnabled, setTwoFactorEnabled] = React.useState(false);

  // Notifications
  const [emailSevereFlags, setEmailSevereFlags] = React.useState(true);
  const [emailSecondOpinion, setEmailSecondOpinion] = React.useState(true);
  const [emailDailySummary, setEmailDailySummary] = React.useState(false);
  const [emailSystemUpdates, setEmailSystemUpdates] = React.useState(false);

  const [inAppFlags, setInAppFlags] = React.useState(true);
  const [inAppSecondOpinion, setInAppSecondOpinion] = React.useState(true);
  const [inAppFollowup, setInAppFollowup] = React.useState(true);

  const [whatsAppPatientReport, setWhatsAppPatientReport] = React.useState(false);
  const [whatsAppReminders, setWhatsAppReminders] = React.useState(false);

  // Language
  const [interfaceLang, setInterfaceLang] = React.useState("English");
  const [voiceLang, setVoiceLang] = React.useState("Hindi");
  const [dateFormat, setDateFormat] = React.useState("DD/MM/YYYY");
  const [timeFormat, setTimeFormat] = React.useState("12-hour");
  const [timezone, setTimezone] = React.useState("IST");

  // Preferences
  const [theme, setTheme] = React.useState<"Light" | "Dark" | "Auto">("Light");
  const [fontSize, setFontSize] = React.useState<"Small" | "Medium" | "Large">("Medium");
  const [highContrast, setHighContrast] = React.useState(false);
  const [compactMode, setCompactMode] = React.useState(false);

  React.useEffect(() => {
    return () => {
      if (photoUrl) URL.revokeObjectURL(photoUrl);
    };
  }, [photoUrl]);

  const pageTitle = "Settings";

  const header = (
    <header className="sticky top-0 z-40 border-b bg-background/70 backdrop-blur">
      <div className="mx-auto flex max-w-6xl items-center gap-3 px-4 py-3 sm:px-6">
        <img src={careAxisLogo} alt="CareAxis CoPilot logo" className="h-9 w-auto" />

        <div className="ml-2 min-w-0">
          <Breadcrumb>
            <BreadcrumbList>
              <BreadcrumbItem>
                <BreadcrumbLink href="/dashboard">Home</BreadcrumbLink>
              </BreadcrumbItem>
              <BreadcrumbSeparator />
              <BreadcrumbItem>
                <BreadcrumbPage>Settings</BreadcrumbPage>
              </BreadcrumbItem>
            </BreadcrumbList>
          </Breadcrumb>
        </div>

        <div className="ml-auto flex items-center gap-2">
          <Sheet>
            <SheetTrigger asChild>
              <Button type="button" variant="outline" className="h-10 md:hidden">
                Menu
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-[320px]">
              <SheetHeader>
                <SheetTitle style={{ fontFamily: "var(--font-display)" }}>Settings</SheetTitle>
              </SheetHeader>
              <div className="mt-4">
                <SectionNav
                  value={section}
                  onChange={(v) => {
                    setSection(v);
                  }}
                  variant="mobile"
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>
      </div>
    </header>
  );

  const profilePanel = (
    <div className="space-y-4">
      <PanelShell title="Profile Settings" subtitle="Manage your personal details and facility info.">
        <div className="rounded-lg border bg-background/50 p-4">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-4">
              <div className="h-24 w-24 overflow-hidden rounded-full border bg-muted">
                {photoUrl ? (
                  <img src={photoUrl} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center text-3xl font-semibold text-muted-foreground">
                    DS
                  </div>
                )}
              </div>
              <div>
                <div className="text-lg font-semibold" style={{ fontFamily: "var(--font-display)" }}>
                  {fullName}
                </div>
                <div className="text-sm text-muted-foreground">{email}</div>
                <div className="text-sm text-muted-foreground">{phone}</div>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <label className="inline-flex">
                <input
                  type="file"
                  accept="image/png,image/jpeg,image/webp"
                  className="hidden"
                  onChange={(e) => {
                    const file = e.currentTarget.files?.[0];
                    if (!file) return;
                    if (file.size > 2 * 1024 * 1024) {
                      toast.error("File too large", { description: "Max 2MB." });
                      return;
                    }
                    const nextUrl = URL.createObjectURL(file);
                    setPhotoUrl((prev) => {
                      if (prev) URL.revokeObjectURL(prev);
                      return nextUrl;
                    });
                    toast.success("Photo selected", { description: "Upload is UI-only in the prototype." });
                  }}
                />
                <Button type="button" className="h-10 gap-2">
                  <Upload className="h-4 w-4" aria-hidden="true" />
                  Upload New Photo
                </Button>
              </label>

              <Button
                type="button"
                variant="outline"
                className="h-10"
                onClick={() => {
                  setPhotoUrl((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return null;
                  });
                  toast.message("Removed", { description: "Photo removed (demo)." });
                }}
                disabled={!photoUrl}
              >
                Remove Photo
              </Button>
            </div>
          </div>

          <div className="mt-3 text-xs text-muted-foreground">Supported: JPG, PNG, WebP (Max 2MB)</div>
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Full Name *</Label>
            <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Full name" />
          </div>
          <div className="grid gap-2">
            <Label>Email *</Label>
            <Input value={email} readOnly disabled />
          </div>
          <div className="grid gap-2">
            <Label>Phone *</Label>
            <Input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="+91-" />
          </div>
          <div className="grid gap-2">
            <Label>Role *</Label>
            <Select value="Doctor" onValueChange={() => {}}>
              <SelectTrigger className="h-10" disabled>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Doctor">Doctor</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2 md:col-span-2">
            <Label>Facility *</Label>
            <Select value={facility} onValueChange={setFacility}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PHC - XYZ Village">PHC - XYZ Village</SelectItem>
                <SelectItem value="CHC - Lakshmi Nagar">CHC - Lakshmi Nagar</SelectItem>
                <SelectItem value="District Hospital - North">District Hospital - North</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>License Number</Label>
            <Input placeholder="Medical license" />
          </div>
          <div className="grid gap-2">
            <Label>Specialization</Label>
            <Input placeholder="e.g., General Medicine" />
          </div>
          <div className="grid gap-2">
            <Label>Years of Experience</Label>
            <Input inputMode="numeric" placeholder="e.g., 8" />
          </div>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button
            type="button"
            className="h-10"
            onClick={() => toast.success("Saved", { description: "Profile changes saved (demo)." })}
          >
            Save Changes
          </Button>
          <Button type="button" variant="outline" className="h-10" onClick={() => toast.message("Cancelled")}> 
            Cancel
          </Button>
        </div>
      </PanelShell>
    </div>
  );

  const securityPanel = (
    <PanelShell title="Security & Password" subtitle="Update password, 2FA, and sessions (demo).">
      <div className="rounded-lg border bg-background/50 p-4">
        <div className="text-sm font-semibold">Change Password</div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="grid gap-2 md:col-span-2">
            <Label>Current Password *</Label>
            <Input type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>New Password *</Label>
            <Input type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
          </div>
          <div className="grid gap-2">
            <Label>Confirm New Password *</Label>
            <Input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} />
          </div>
        </div>

        <div className="mt-4 rounded-md border bg-background/60 p-3 text-sm">
          <div className="font-medium">Password Requirements</div>
          <ul className="mt-2 space-y-1 text-sm text-muted-foreground">
            <li>☑︎ Minimum 8 characters</li>
            <li>☑︎ At least 1 uppercase letter</li>
            <li>☑︎ At least 1 lowercase letter</li>
            <li>☑︎ At least 1 number</li>
            <li>☑︎ At least 1 special character</li>
          </ul>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            className="h-10"
            onClick={() => {
              if (!currentPassword || !newPassword || !confirmPassword) {
                toast.error("Missing fields", { description: "Fill all password fields." });
                return;
              }
              if (newPassword !== confirmPassword) {
                toast.error("Passwords do not match");
                return;
              }
              toast.success("Password updated", { description: "UI-only in the prototype." });
              setCurrentPassword("");
              setNewPassword("");
              setConfirmPassword("");
            }}
          >
            Update Password
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-background/50 p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold">Two-Factor Authentication</div>
            <div className="mt-1 text-sm text-muted-foreground">Send OTP to registered mobile/email (demo)</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">{twoFactorEnabled ? "Enabled" : "Disabled"}</span>
            <Switch checked={twoFactorEnabled} onCheckedChange={setTwoFactorEnabled} />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button
            type="button"
            variant="outline"
            className="h-10"
            onClick={() => toast.message("2FA", { description: "2FA setup is UI-only in the prototype." })}
          >
            {twoFactorEnabled ? "Manage 2FA" : "Enable 2FA"}
          </Button>
        </div>
      </div>

      <div className="rounded-lg border bg-background/50 p-4">
        <div className="text-sm font-semibold">Active Sessions</div>
        <div className="mt-3 space-y-3 text-sm">
          <div className="rounded-md border bg-card/60 p-3">
            <div className="font-medium">🖥️ Chrome on Windows</div>
            <div className="mt-1 text-muted-foreground">192.168.1.100 • Active Now • This Device</div>
          </div>
          <div className="rounded-md border bg-card/60 p-3">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-medium">📱 Mobile App</div>
                <div className="mt-1 text-muted-foreground">192.168.1.105 • Last active: 2 hours ago</div>
              </div>
              <Button
                type="button"
                variant="outline"
                className="h-9"
                onClick={() => toast.message("Logged out", { description: "Session logout is UI-only." })}
              >
                Logout
              </Button>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={() => toast.message("Logout all", { description: "UI-only in the prototype." })}
            >
              Logout from All Devices
            </Button>
          </div>
        </div>
      </div>
    </PanelShell>
  );

  const notificationsPanel = (
    <PanelShell title="Notifications" subtitle="Control email, in-app, and WhatsApp alerts (demo).">
      <div className="rounded-lg border bg-background/50 p-4">
        <div className="text-sm font-semibold">Email Notifications</div>
        <div className="mt-3 grid gap-2">
          <label className="flex items-start gap-2 text-sm">
            <Checkbox checked={emailSevereFlags} onCheckedChange={(v) => setEmailSevereFlags(Boolean(v))} />
            <span>AI Compliance Flags (Severe only)</span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <Checkbox checked={emailSecondOpinion} onCheckedChange={(v) => setEmailSecondOpinion(Boolean(v))} />
            <span>Second Opinion Requests</span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <Checkbox checked={emailDailySummary} onCheckedChange={(v) => setEmailDailySummary(Boolean(v))} />
            <span>Daily Summary Report</span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <Checkbox checked={emailSystemUpdates} onCheckedChange={(v) => setEmailSystemUpdates(Boolean(v))} />
            <span>System Updates</span>
          </label>
        </div>
      </div>

      <div className="rounded-lg border bg-background/50 p-4">
        <div className="text-sm font-semibold">In-App Notifications</div>
        <div className="mt-3 grid gap-2">
          <label className="flex items-start gap-2 text-sm">
            <Checkbox checked={inAppFlags} onCheckedChange={(v) => setInAppFlags(Boolean(v))} />
            <span>AI Compliance Flags</span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <Checkbox checked={inAppSecondOpinion} onCheckedChange={(v) => setInAppSecondOpinion(Boolean(v))} />
            <span>Second Opinion Requests</span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <Checkbox checked={inAppFollowup} onCheckedChange={(v) => setInAppFollowup(Boolean(v))} />
            <span>Follow-up Reminders</span>
          </label>
        </div>
      </div>

      <div className="rounded-lg border bg-background/50 p-4">
        <div className="text-sm font-semibold">WhatsApp Notifications</div>
        <div className="mt-3 grid gap-2">
          <label className="flex items-start gap-2 text-sm">
            <Checkbox checked={whatsAppPatientReport} onCheckedChange={(v) => setWhatsAppPatientReport(Boolean(v))} />
            <span>Patient Report Delivery</span>
          </label>
          <label className="flex items-start gap-2 text-sm">
            <Checkbox checked={whatsAppReminders} onCheckedChange={(v) => setWhatsAppReminders(Boolean(v))} />
            <span>Appointment Reminders</span>
          </label>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          className="h-10"
          onClick={() => toast.success("Saved", { description: "Notification preferences saved (demo)." })}
        >
          Save Preferences
        </Button>
      </div>
    </PanelShell>
  );

  const languagePanel = (
    <PanelShell title="Language & Region" subtitle="Set interface and voice-to-text languages (demo).">
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label>Interface Language</Label>
          <Select value={interfaceLang} onValueChange={setInterfaceLang}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {[
                "English",
                "Hindi",
                "Tamil",
                "Telugu",
                "Marathi",
                "Bengali",
              ].map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Voice-to-Text Language</Label>
          <Select value={voiceLang} onValueChange={setVoiceLang}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {["English", "Hindi", "Regional"].map((l) => (
                <SelectItem key={l} value={l}>
                  {l}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Date Format</Label>
          <Select value={dateFormat} onValueChange={setDateFormat}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DD/MM/YYYY">DD/MM/YYYY</SelectItem>
              <SelectItem value="MM/DD/YYYY">MM/DD/YYYY</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2">
          <Label>Time Format</Label>
          <Select value={timeFormat} onValueChange={setTimeFormat}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12-hour">12-hour</SelectItem>
              <SelectItem value="24-hour">24-hour</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="grid gap-2 md:col-span-2">
          <Label>Timezone</Label>
          <Select value={timezone} onValueChange={setTimezone}>
            <SelectTrigger className="h-10">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="IST">IST - India Standard Time</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          className="h-10"
          onClick={() => toast.success("Saved", { description: "Language settings saved (demo)." })}
        >
          Save Language Settings
        </Button>
      </div>
    </PanelShell>
  );

  const facilityPanel = (
    <PanelShell title="Facility Settings" subtitle="Review facility details and request changes (demo).">
      <div className="rounded-lg border bg-background/50 p-4">
        <div className="flex items-start justify-between gap-4">
          <div>
            <div className="text-sm font-semibold">🏥 {facility}</div>
            <div className="mt-2 text-sm text-muted-foreground">
              Address: Village XYZ, District ABC, State - Maharashtra
            </div>
            <div className="text-sm text-muted-foreground">Contact: +91-XXX-XXXXXXX</div>
          </div>
          <Button type="button" variant="outline" className="h-10" onClick={() => toast.message("Facility", { description: "Details are UI-only." })}>
            View Facility Details
          </Button>
        </div>

        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:justify-end">
          <Button type="button" className="h-10" onClick={() => toast.message("Requested", { description: "Request is UI-only in demo." })}>
            Request Facility Change
          </Button>
        </div>
      </div>
    </PanelShell>
  );

  const preferencesPanel = (
    <PanelShell title="Preferences" subtitle="Adjust display settings for your workspace (demo).">
      <div className="rounded-lg border bg-background/50 p-4">
        <div className="text-sm font-semibold">Display Preferences</div>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          <div className="grid gap-2">
            <Label>Theme</Label>
            <Select value={theme} onValueChange={(v) => setTheme(v as typeof theme)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Light">Light</SelectItem>
                <SelectItem value="Dark">Dark</SelectItem>
                <SelectItem value="Auto">Auto (System)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label>Font Size</Label>
            <Select value={fontSize} onValueChange={(v) => setFontSize(v as typeof fontSize)}>
              <SelectTrigger className="h-10">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Small">Small</SelectItem>
                <SelectItem value="Medium">Medium</SelectItem>
                <SelectItem value="Large">Large</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between gap-3 rounded-md border bg-background/60 p-3">
            <div>
              <div className="text-sm font-medium">High Contrast Mode</div>
              <div className="text-xs text-muted-foreground">Improve legibility for bright environments</div>
            </div>
            <Switch checked={highContrast} onCheckedChange={setHighContrast} />
          </div>

          <div className="flex items-center justify-between gap-3 rounded-md border bg-background/60 p-3">
            <div>
              <div className="text-sm font-medium">Compact Mode</div>
              <div className="text-xs text-muted-foreground">Reduce spacing for dense workflows</div>
            </div>
            <Switch checked={compactMode} onCheckedChange={setCompactMode} />
          </div>
        </div>

        <div className="mt-4 flex justify-end">
          <Button type="button" className="h-10" onClick={() => toast.success("Saved", { description: "Preferences saved (demo)." })}>
            Save Display Preferences
          </Button>
        </div>
      </div>
    </PanelShell>
  );

  const aboutPanel = (
    <PanelShell title="About & Help" subtitle="App info, resources, and compliance links (demo).">
      <div className="grid gap-4">
        <div className="rounded-lg border bg-background/50 p-4">
          <div className="text-sm font-semibold">Application Info</div>
          <div className="mt-3 text-sm text-muted-foreground">
            <div className="font-medium text-foreground">CareAxis CoPilot</div>
            <div>Version: 1.0.0</div>
            <div>Build: 2026.01.15</div>
            <div className="mt-2">AI-Assisted Clinical Documentation & Guideline Compliance Platform</div>
            <div>Innovate You Techathon 3.0 – 2026</div>
          </div>
        </div>

        <div className="rounded-lg border bg-background/50 p-4">
          <div className="text-sm font-semibold">Help Resources</div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              { label: "User Guide", icon: HelpCircle },
              { label: "FAQ", icon: HelpCircle },
              { label: "Contact Support", icon: HelpCircle },
              { label: "Report a Bug", icon: HelpCircle },
              { label: "Feature Request", icon: HelpCircle },
            ].map((r) => (
              <Button
                key={r.label}
                type="button"
                variant="outline"
                className="h-10 justify-start gap-2"
                onClick={() => toast.message(r.label, { description: "This link is UI-only in the prototype." })}
              >
                <r.icon className="h-4 w-4" aria-hidden="true" />
                {r.label}
              </Button>
            ))}
          </div>
        </div>

        <div className="rounded-lg border bg-background/50 p-4">
          <div className="text-sm font-semibold">Compliance & Legal</div>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {[
              { label: "Privacy Policy" },
              { label: "Terms of Service" },
              { label: "HIPAA Compliance" },
              { label: "Digital Health Records Bill 2025" },
            ].map((l) => (
              <Button
                key={l.label}
                type="button"
                variant="outline"
                className="h-10 justify-start"
                onClick={() => toast.message(l.label, { description: "UI-only in the prototype." })}
              >
                {l.label}
              </Button>
            ))}
          </div>
        </div>

        <Separator />

        <div className="rounded-lg border bg-background/50 p-4">
          <div className="flex items-start justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">⚠️ Danger Zone</div>
              <div className="mt-1 text-sm text-muted-foreground">
                These actions cannot be undone.
              </div>
            </div>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2">
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button type="button" className="h-10 gap-2 bg-destructive text-destructive-foreground hover:bg-destructive/90 pulse">
                  <Trash2 className="h-4 w-4" aria-hidden="true" />
                  Delete Account
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Delete account?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. All your data will be permanently deleted (demo UI only).
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction
                    onClick={() => toast.message("Delete Account", { description: "Deletion is UI-only in the prototype." })}
                  >
                    Delete
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>

            <Button
              type="button"
              variant="outline"
              className="h-10"
              onClick={() => toast.message("Export Data", { description: "Export is UI-only in the prototype." })}
            >
              Export Data
            </Button>
          </div>
        </div>
      </div>
    </PanelShell>
  );

  const logoutPanel = (
    <PanelShell title="Logout" subtitle="End your session on this device (demo).">
      <div className="rounded-lg border bg-background/50 p-4">
        <div className="text-sm text-muted-foreground">You are signed in as</div>
        <div className="mt-1 text-lg font-semibold" style={{ fontFamily: "var(--font-display)" }}>
          {fullName}
        </div>
        <div className="text-sm text-muted-foreground">{email}</div>

        <div className="mt-4 flex justify-end">
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button type="button" className="h-10">
                Logout
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Log out?</AlertDialogTitle>
                <AlertDialogDescription>
                  You’ll be redirected to the sign-in screen. (Demo session only.)
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction
                  onClick={() => {
                    demoSignOut();
                    toast.success("Logged out");
                    navigate("/", { replace: true });
                  }}
                >
                  Logout
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </PanelShell>
  );

  const panel =
    section === "profile"
      ? profilePanel
      : section === "security"
        ? securityPanel
        : section === "notifications"
          ? notificationsPanel
          : section === "language"
            ? languagePanel
            : section === "facility"
              ? facilityPanel
              : section === "preferences"
                ? preferencesPanel
                : section === "about"
                  ? aboutPanel
                  : logoutPanel;

  return (
    <main className="careaxis-auth-bg min-h-screen bg-background">
      {header}

      <section className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        <div className="mb-6">
          <h1 className="text-[28px] font-bold text-foreground" style={{ fontFamily: "var(--font-display)" }}>
            {pageTitle}
          </h1>
          <p className="mt-1 text-base text-muted-foreground">Manage your account preferences and application settings</p>
        </div>

        <div className="grid gap-6 md:grid-cols-[300px_1fr]">
          <aside className="hidden md:block">
            <Card className="border-border/70 bg-card/85 backdrop-blur">
              <CardHeader>
                <CardTitle className="text-sm" style={{ fontFamily: "var(--font-display)" }}>
                  Settings Navigation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <SectionNav value={section} onChange={setSection} variant="desktop" />
              </CardContent>
            </Card>
          </aside>

          <div className="space-y-4">{panel}</div>
        </div>
      </section>
    </main>
  );
}
