import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useLocation, useRoute } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Phone, Star, MapPin, Clock, Car, Users, Snowflake, Music, Check, Minus, Plus } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function RideDetails() {
  const [, params] = useRoute("/ride/:id");
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [seatsToBook, setSeatsToBook] = useState(1);
  
  const rideId = params?.id;

  const { data: ride, isLoading } = useQuery({
    queryKey: ["/api/rides", rideId],
    queryFn: async () => {
      const response = await fetch(`/api/rides/${rideId}`);
      if (!response.ok) throw new Error('Failed to fetch ride details');
      return response.json();
    },
    enabled: !!rideId,
  });

  const bookingMutation = useMutation({
    mutationFn: async (bookingData: any) => {
      const response = await apiRequest("POST", "/api/bookings", bookingData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/rides", rideId] });
      toast({
        title: "Booking confirmed!",
        description: "Your ride has been booked successfully.",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Booking failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  if (!rideId) {
    setLocation("/");
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background max-w-md mx-auto flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading ride details...</p>
        </div>
      </div>
    );
  }

  if (!ride) {
    return (
      <div className="min-h-screen bg-background max-w-md mx-auto flex items-center justify-center">
        <Card>
          <CardContent className="p-6 text-center">
            <h3 className="font-semibold mb-2">Ride not found</h3>
            <p className="text-sm text-muted-foreground mb-4">The ride you're looking for doesn't exist.</p>
            <Button onClick={() => setLocation("/")} data-testid="button-back-home">
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const departureTime = new Date(`2000-01-01T${ride.departureTime}`).toLocaleTimeString([], {
    hour: '2-digit',
    minute: '2-digit'
  });

  const serviceFee = Math.round(parseFloat(ride.farePerSeat) * 0.1);
  const totalFare = (parseFloat(ride.farePerSeat) + serviceFee) * seatsToBook;

  const handleBooking = () => {
    bookingMutation.mutate({
      rideId: ride.id,
      seatsBooked: seatsToBook,
      totalFare: totalFare,
    });
  };

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
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            data-testid="button-back"
            onClick={() => setLocation("/search")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="font-semibold">Ride Details</h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 pb-20">
        {/* Driver Info */}
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-16 h-16 bg-gradient-to-br from-primary/20 to-primary/10 rounded-full flex items-center justify-center">
                <span className="text-primary font-semibold text-xl">
                  {ride.driver.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-lg" data-testid="driver-name">{ride.driver.name}</h3>
                <div className="flex items-center space-x-1 mb-1">
                  <div className="flex text-yellow-400">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <span className="text-sm text-muted-foreground">4.9 (127 rides)</span>
                </div>
                <p className="text-sm text-muted-foreground">Member since 2022</p>
              </div>
              <Button variant="outline" size="sm" data-testid="button-call-driver">
                <Phone className="w-4 h-4" />
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-2xl font-bold text-primary">127</p>
                <p className="text-xs text-muted-foreground">Total Rides</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">4.9</p>
                <p className="text-xs text-muted-foreground">Rating</p>
              </div>
              <div>
                <p className="text-2xl font-bold text-primary">98%</p>
                <p className="text-xs text-muted-foreground">On Time</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Route & Time */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-4">Route & Schedule</h4>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="flex flex-col items-center mt-1">
                  <div className="w-3 h-3 bg-primary rounded-full"></div>
                  <div className="w-px h-8 bg-border"></div>
                </div>
                <div className="flex-1">
                  <p className="font-medium" data-testid="pickup-location">{ride.pickupLocation}</p>
                  <p className="text-sm text-muted-foreground">{departureTime} • Pickup point</p>
                </div>
              </div>

              <div className="flex items-start space-x-3">
                <div className="flex flex-col items-center mt-1">
                  <div className="w-3 h-3 bg-secondary rounded-full"></div>
                </div>
                <div className="flex-1">
                  <p className="font-medium" data-testid="destination">{ride.destination}</p>
                  <p className="text-sm text-muted-foreground">Drop off location</p>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-muted rounded-lg">
              <div className="flex items-center justify-between text-sm">
                <span>Estimated Duration</span>
                <span className="font-semibold">45 minutes</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Car Details */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-4">Vehicle Information</h4>
            
            <div className="flex items-center space-x-4 mb-4">
              <div className="w-20 h-12 bg-gradient-to-r from-gray-200 to-gray-300 dark:from-gray-700 dark:to-gray-600 rounded-lg flex items-center justify-center">
                <Car className="w-8 h-8 text-gray-500" />
              </div>
              <div className="flex-1">
                <p className="font-semibold" data-testid="car-info">
                  {ride.car.make} {ride.car.model} {ride.car.year}
                </p>
                <p className="text-sm text-muted-foreground">{ride.car.color} • {ride.car.registrationNumber}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              <Badge variant="secondary" className="bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                <Snowflake className="w-3 h-3 mr-1" />
                AC
              </Badge>
              <Badge variant="secondary" className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                <Check className="w-3 h-3 mr-1" />
                Verified
              </Badge>
              <Badge variant="secondary" className="bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200">
                <Music className="w-3 h-3 mr-1" />
                Music
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Booking Summary */}
        <Card>
          <CardContent className="p-4">
            <h4 className="font-semibold mb-4">Booking Summary</h4>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span>Number of seats</span>
                <div className="flex items-center space-x-3">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSeatsToBook(Math.max(1, seatsToBook - 1))}
                    disabled={seatsToBook <= 1}
                    data-testid="button-decrease-seats"
                  >
                    <Minus className="w-4 h-4" />
                  </Button>
                  <span className="font-semibold w-8 text-center" data-testid="seats-count">{seatsToBook}</span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setSeatsToBook(Math.min(ride.availableSeats, seatsToBook + 1))}
                    disabled={seatsToBook >= ride.availableSeats}
                    data-testid="button-increase-seats"
                  >
                    <Plus className="w-4 h-4" />
                  </Button>
                </div>
              </div>
              
              <div className="border-t border-border pt-3 space-y-2">
                <div className="flex justify-between">
                  <span>Fare ({seatsToBook} seat{seatsToBook > 1 ? 's' : ''})</span>
                  <span>PKR {(parseFloat(ride.farePerSeat) * seatsToBook).toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Service fee</span>
                  <span>PKR {(serviceFee * seatsToBook).toFixed(2)}</span>
                </div>
                <div className="flex justify-between font-semibold text-lg border-t border-border pt-2">
                  <span>Total</span>
                  <span className="text-primary" data-testid="total-fare">PKR {totalFare.toFixed(2)}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Book Button */}
        <Button
          className="w-full py-4 text-lg font-semibold"
          onClick={handleBooking}
          disabled={bookingMutation.isPending}
          data-testid="button-confirm-booking"
        >
          {bookingMutation.isPending ? "Confirming..." : "Confirm Booking"}
        </Button>
      </div>
    </div>
  );
}
