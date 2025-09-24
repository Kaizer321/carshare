import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, Users, Car, Star } from "lucide-react";

interface RideCardProps {
  ride: any;
  onClick?: () => void;
  showBookButton?: boolean;
}

export function RideCard({ ride, onClick, showBookButton = true }: RideCardProps) {
  const departureTime = new Date(`2000-01-01T${ride.departureTime}`).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  const estimatedDuration = "45 min"; // This would be calculated based on distance

  return (
    <Card 
      className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:-translate-y-1"
      onClick={onClick}
      data-testid={`ride-card-${ride.id}`}
    >
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-3">
          <div className="flex items-center space-x-3">
            {/* Driver Avatar - Using placeholder for now */}
            <div className="w-12 h-12 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
              <span className="text-primary font-semibold text-lg">
                {ride.driver.name.charAt(0).toUpperCase()}
              </span>
            </div>
            <div>
              <h3 className="font-semibold" data-testid={`driver-name-${ride.id}`}>
                {ride.driver.name}
              </h3>
              <div className="flex items-center space-x-1">
                <div className="flex text-yellow-400">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <Star key={star} className="w-3 h-3 fill-current" />
                  ))}
                </div>
                <span className="text-xs text-muted-foreground">4.9 (127)</span>
              </div>
            </div>
          </div>
          <div className="text-right">
            <p className="text-lg font-bold text-primary" data-testid={`fare-${ride.id}`}>
              PKR {ride.farePerSeat}
            </p>
            <p className="text-xs text-muted-foreground">per person</p>
          </div>
        </div>

        <div className="space-y-2 mb-3">
          <div className="flex items-center space-x-2 text-sm">
            <Clock className="w-4 h-4 text-muted-foreground" />
            <span data-testid={`departure-time-${ride.id}`}>{departureTime}</span>
            <span className="text-muted-foreground">•</span>
            <span>{estimatedDuration}</span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Users className="w-4 h-4 text-muted-foreground" />
            <span data-testid={`available-seats-${ride.id}`}>
              {ride.availableSeats} seats available
            </span>
          </div>
          <div className="flex items-center space-x-2 text-sm">
            <Car className="w-4 h-4 text-muted-foreground" />
            <span data-testid={`car-details-${ride.id}`}>
              {ride.car.make} {ride.car.model} {ride.car.year} - {ride.car.color}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-border">
          <div className="flex items-center space-x-2">
            <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
              Instant Book
            </Badge>
            <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
              AC
            </Badge>
          </div>
          {showBookButton && (
            <Button 
              size="sm"
              data-testid={`button-book-${ride.id}`}
              onClick={(e) => {
                e.stopPropagation();
                onClick?.();
              }}
            >
              Book Now
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
