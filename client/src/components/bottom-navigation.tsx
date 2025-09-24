import { Button } from "@/components/ui/button";
import { Home, List, Bell, User } from "lucide-react";
import { useLocation } from "wouter";

export function BottomNavigation() {
  const [location] = useLocation();

  const navItems = [
    { icon: Home, label: "Home", path: "/" },
    { icon: List, label: "My Rides", path: "/my-rides" },
    { icon: Bell, label: "Notifications", path: "/notifications" },
    { icon: User, label: "Profile", path: "/profile" },
  ];

  return (
    <div className="fixed bottom-0 left-1/2 transform -translate-x-1/2 w-full max-w-md bg-card border-t border-border z-50">
      <div className="flex items-center justify-around py-2">
        {navItems.map(({ icon: Icon, label, path }) => (
          <Button
            key={path}
            variant="ghost"
            size="sm"
            className={`flex flex-col items-center p-2 h-auto ${
              location === path ? "text-primary" : "text-muted-foreground"
            }`}
            data-testid={`nav-${label.toLowerCase().replace(' ', '-')}`}
          >
            <Icon className="w-5 h-5" />
            <span className="text-xs mt-1">{label}</span>
          </Button>
        ))}
      </div>
    </div>
  );
}
