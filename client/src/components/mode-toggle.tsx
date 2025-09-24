import { Button } from "@/components/ui/button";
import { Search, Car } from "lucide-react";

interface ModeToggleProps {
  mode: "passenger" | "driver";
  onModeChange: (mode: "passenger" | "driver") => void;
}

export function ModeToggle({ mode, onModeChange }: ModeToggleProps) {
  return (
    <div className="bg-muted p-1 rounded-lg flex">
      <Button
        variant={mode === "passenger" ? "default" : "ghost"}
        className="flex-1"
        data-testid="button-passenger-mode"
        onClick={() => onModeChange("passenger")}
      >
        <Search className="w-4 h-4 mr-2" />
        Find a Ride
      </Button>
      <Button
        variant={mode === "driver" ? "default" : "ghost"}
        className="flex-1"
        data-testid="button-driver-mode"
        onClick={() => onModeChange("driver")}
      >
        <Car className="w-4 h-4 mr-2" />
        Offer a Ride
      </Button>
    </div>
  );
}
