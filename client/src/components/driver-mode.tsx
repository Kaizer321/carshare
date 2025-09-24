import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Plus, List, TrendingUp, Car, AlertCircle } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";

export function DriverMode() {
  const { user } = useAuth();
  const [, setLocation] = useLocation();

  const { data: cars = [] } = useQuery<any[]>({
    queryKey: ["/api/cars"],
  });

  const { data: myRides = [] } = useQuery<any[]>({
    queryKey: ["/api/my-rides"],
  });

  const hasVerifiedCar = cars.some((car) => car.verificationStatus === "approved");
  const hasPendingCar = cars.some((car) => car.verificationStatus === "pending");

  return (
    <div className="p-4 space-y-4">
      {/* Driver Status Card */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold">Driver Status</h3>
              <p className="text-sm text-muted-foreground">
                {hasVerifiedCar 
                  ? "Your car is verified" 
                  : hasPendingCar 
                  ? "Your car verification is pending"
                  : "Complete car registration to start driving"
                }
              </p>
            </div>
            <Badge 
              variant={hasVerifiedCar ? "default" : hasPendingCar ? "secondary" : "destructive"}
              data-testid="status-driver-verification"
            >
              {hasVerifiedCar ? "Verified" : hasPendingCar ? "Pending" : "Not Registered"}
            </Badge>
          </div>
          {!hasVerifiedCar && (
            <Button
              variant="link"
              className="p-0 h-auto"
              data-testid="link-car-registration"
              onClick={() => setLocation("/car-registration")}
            >
              {hasPendingCar ? "View Registration Status" : "Complete Car Registration"} →
            </Button>
          )}
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <div className="space-y-3">
        <Button
          className="w-full"
          data-testid="button-create-ride"
          onClick={() => setLocation("/create-ride")}
          disabled={!hasVerifiedCar}
        >
          <Plus className="w-4 h-4 mr-2" />
          Create New Ride
        </Button>

        <div className="grid grid-cols-2 gap-3">
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="p-4 text-center">
              <List className="w-6 h-6 mx-auto mb-2 text-primary" />
              <span className="text-sm font-medium">My Rides</span>
              <p className="text-xs text-muted-foreground mt-1">{myRides.length} active</p>
            </CardContent>
          </Card>
          <Card className="cursor-pointer hover:bg-muted/50 transition-colors">
            <CardContent className="p-4 text-center">
              <TrendingUp className="w-6 h-6 mx-auto mb-2 text-primary" />
              <span className="text-sm font-medium">Earnings</span>
              <p className="text-xs text-muted-foreground mt-1">PKR 0</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Active Rides */}
      <div className="space-y-3">
        <h3 className="font-semibold text-lg">Active Rides</h3>
        {myRides.length > 0 ? (
          <div className="space-y-2">
            {myRides.map((ride) => (
              <Card key={ride.id} className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="p-4">
                  <div className="flex items-start justify-between mb-2">
                    <div>
                      <p className="font-medium text-sm">{ride.pickupLocation} → {ride.destination}</p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(ride.departureDate).toLocaleDateString()} • {ride.departureTime}
                      </p>
                    </div>
                    <Badge variant="outline">PKR {ride.farePerSeat}</Badge>
                  </div>
                  <div className="flex items-center justify-between text-xs">
                    <span>{ride.availableSeats} seats available</span>
                    <Badge variant={ride.status === "active" ? "default" : "secondary"}>
                      {ride.status}
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <Car className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
              <p className="text-sm text-muted-foreground mb-1">No active rides</p>
              <p className="text-xs text-muted-foreground">Create your first ride to get started</p>
            </CardContent>
          </Card>
        )}
      </div>

      {!hasVerifiedCar && (
        <Card className="border-yellow-200 bg-yellow-50 dark:border-yellow-800 dark:bg-yellow-950">
          <CardContent className="p-4">
            <div className="flex items-start space-x-3">
              <AlertCircle className="w-5 h-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div className="text-sm">
                <p className="font-medium text-yellow-900 dark:text-yellow-100 mb-1">Car Verification Required</p>
                <p className="text-yellow-700 dark:text-yellow-300">
                  Complete your car registration and verification to start offering rides to passengers.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
