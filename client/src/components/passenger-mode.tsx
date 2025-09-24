import { useState } from "react";
import { useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { MapPin, Search, History, ChevronRight } from "lucide-react";

export function PassengerMode() {
  const [, setLocation] = useLocation();
  const [pickupLocation, setPickupLocation] = useState("");
  const [destination, setDestination] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);

  const handleSearch = () => {
    if (pickupLocation && destination && date) {
      const params = new URLSearchParams({
        pickup: pickupLocation,
        destination: destination,
        date: date,
      });
      setLocation(`/search?${params.toString()}`);
    }
  };

  const recentSearches = [
    { from: "DHA Phase 5", to: "Gulshan-e-Iqbal", city: "Karachi", date: "Yesterday" },
    { from: "Clifton", to: "Saddar", city: "Karachi", date: "2 days ago" },
  ];

  return (
    <div className="space-y-4">
      {/* Map Section with Search */}
      <div className="relative h-80 bg-gradient-to-br from-emerald-50 to-emerald-100 dark:from-emerald-950 dark:to-emerald-900">
        {/* Map placeholder */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center text-emerald-600 dark:text-emerald-400">
            <MapPin className="w-12 h-12 mx-auto mb-2" />
            <p className="text-sm font-medium">Interactive Map View</p>
            <p className="text-xs opacity-75">Karachi • Lahore • Islamabad</p>
          </div>
        </div>

        {/* Floating search form */}
        <div className="absolute top-4 left-4 right-4 z-10">
          <Card>
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center space-x-3">
                <div className="flex flex-col items-center">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <div className="w-px h-6 bg-border"></div>
                  <div className="w-3 h-3 bg-secondary rounded-full"></div>
                </div>
                <div className="flex-1 space-y-2">
                  <Input
                    placeholder="From (e.g., DHA, Karachi)"
                    value={pickupLocation}
                    onChange={(e) => setPickupLocation(e.target.value)}
                    data-testid="input-pickup-location"
                  />
                  <Input
                    placeholder="To (e.g., Gulshan, Karachi)"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    data-testid="input-destination"
                  />
                </div>
              </div>
              <div className="flex space-x-2">
                <Input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  className="flex-1"
                  data-testid="input-date"
                />
                <Button
                  onClick={handleSearch}
                  data-testid="button-search-rides"
                  disabled={!pickupLocation || !destination || !date}
                >
                  <Search className="w-4 h-4" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Recent Searches */}
      <div className="p-4 space-y-4">
        <h3 className="font-semibold text-lg">Recent Searches</h3>
        {recentSearches.length > 0 ? (
          <div className="space-y-2">
            {recentSearches.map((search, index) => (
              <Card key={index} className="cursor-pointer hover:bg-muted/50 transition-colors">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <History className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-medium text-sm">{search.from} → {search.to}</p>
                        <p className="text-xs text-muted-foreground">{search.city} • {search.date}</p>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <CardContent className="p-6 text-center">
              <History className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
              <p className="text-sm text-muted-foreground">No recent searches</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
