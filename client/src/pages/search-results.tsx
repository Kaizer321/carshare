import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Users, Car, Star } from "lucide-react";
import { RideCard } from "../components/ride-card";

export default function SearchResults() {
  const [location, setLocation] = useLocation();
  const searchParams = new URLSearchParams(location.split('?')[1] || '');
  
  const pickup = searchParams.get('pickup') || '';
  const destination = searchParams.get('destination') || '';
  const date = searchParams.get('date') || '';

  const { data: rides = [], isLoading } = useQuery({
    queryKey: ["/api/rides/search", pickup, destination, date],
    queryFn: async () => {
      const params = new URLSearchParams({ pickup, destination, date });
      const response = await fetch(`/api/rides/search?${params}`);
      if (!response.ok) throw new Error('Failed to fetch rides');
      return response.json();
    },
    enabled: !!(pickup && destination && date),
  });

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
        <div className="flex items-center space-x-3 mb-3">
          <Button
            variant="ghost"
            size="sm"
            data-testid="button-back"
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <div className="flex-1">
            <h2 className="font-semibold">Available Rides</h2>
            <p className="text-sm text-muted-foreground">{pickup} → {destination}</p>
          </div>
        </div>

        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Clock className="w-4 h-4" />
          <span>{new Date(date).toLocaleDateString()}</span>
          <span>•</span>
          <span className="text-primary font-medium" data-testid="text-rides-count">
            {rides.length} rides found
          </span>
        </div>
      </div>

      {/* Results */}
      <div className="p-4 space-y-4 pb-20">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <Card key={i} className="animate-pulse">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-12 h-12 bg-muted rounded-full"></div>
                      <div className="flex-1 space-y-2">
                        <div className="h-4 bg-muted rounded w-3/4"></div>
                        <div className="h-3 bg-muted rounded w-1/2"></div>
                      </div>
                      <div className="h-6 bg-muted rounded w-16"></div>
                    </div>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded w-full"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : rides.length > 0 ? (
          rides.map((ride: any) => (
            <RideCard
              key={ride.id}
              ride={ride}
              onClick={() => setLocation(`/ride/${ride.id}`)}
            />
          ))
        ) : (
          <Card>
            <CardContent className="p-8 text-center">
              <Car className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="font-semibold mb-2">No rides found</h3>
              <p className="text-sm text-muted-foreground mb-4">
                Try adjusting your search criteria or check back later.
              </p>
              <Button onClick={() => setLocation("/")} data-testid="button-new-search">
                Start New Search
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
