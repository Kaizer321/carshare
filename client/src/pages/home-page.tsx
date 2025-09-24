import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { ModeToggle } from "../components/mode-toggle";
import { PassengerMode } from "../components/passenger-mode";
import { DriverMode } from "../components/driver-mode";
import { BottomNavigation } from "../components/bottom-navigation";
import { Button } from "@/components/ui/button";
import { UserCircle } from "lucide-react";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [mode, setMode] = useState<"passenger" | "driver">("passenger");

  return (
    <div className="min-h-screen bg-background max-w-md mx-auto">
      {/* Mobile Status Bar */}
      <div className="h-11 bg-card border-b border-border flex items-center justify-between px-4 text-sm font-medium">
        <span>9:41</span>
        <div className="flex items-center space-x-1 text-xs">
          <div className="flex space-x-0.5">
            <div className="w-1 h-1 bg-foreground rounded-full"></div>
            <div className="w-1 h-1 bg-foreground rounded-full"></div>
            <div className="w-1 h-1 bg-foreground rounded-full"></div>
          </div>
          <div className="w-4 h-2 border border-foreground rounded-sm">
            <div className="w-3 h-1 bg-foreground rounded-sm m-0.5"></div>
          </div>
        </div>
      </div>

      {/* Header */}
      <div className="bg-card border-b border-border p-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold">RideShare PK</h1>
            <p className="text-sm text-muted-foreground">Welcome, {user?.name}</p>
          </div>
          <Button
            variant="ghost"
            size="sm"
            data-testid="button-profile"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <UserCircle className="w-6 h-6 text-muted-foreground" />
          </Button>
        </div>

        <ModeToggle mode={mode} onModeChange={setMode} />
      </div>

      {/* Content */}
      <div className="pb-20">
        {mode === "passenger" ? <PassengerMode /> : <DriverMode />}
      </div>

      <BottomNavigation />
    </div>
  );
}
