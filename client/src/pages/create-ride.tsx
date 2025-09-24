import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, MapPin } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertRideSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const rideFormSchema = insertRideSchema.extend({
  preferences: z.object({
    instantBooking: z.boolean().optional(),
    womenOnly: z.boolean().optional(),
    noSmoking: z.boolean().optional(),
  }).optional(),
});

type RideFormData = z.infer<typeof rideFormSchema>;

export default function CreateRide() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: cars = [] } = useQuery<any[]>({
    queryKey: ["/api/cars"],
  });

  const verifiedCars = cars.filter((car) => car.verificationStatus === "approved");

  const form = useForm<RideFormData>({
    resolver: zodResolver(rideFormSchema),
    defaultValues: {
      pickupLocation: "",
      destination: "",
      departureDate: new Date(),
      departureTime: "",
      availableSeats: 1,
      farePerSeat: "150",
      additionalInfo: "",
      carId: "",
      preferences: {
        instantBooking: false,
        womenOnly: false,
        noSmoking: false,
      },
    },
  });

  const rideMutation = useMutation({
    mutationFn: async (rideData: RideFormData) => {
      const response = await apiRequest("POST", "/api/rides", rideData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/my-rides"] });
      toast({
        title: "Ride created successfully!",
        description: "Your ride offer has been published.",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Failed to create ride",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: RideFormData) => {
    if (verifiedCars.length === 0) {
      toast({
        title: "No verified car",
        description: "You need a verified car to create a ride.",
        variant: "destructive",
      });
      return;
    }

    // Use the first verified car if no car is selected
    const rideData = {
      ...data,
      carId: data.carId || verifiedCars[0]?.id,
      farePerSeat: data.farePerSeat.toString(),
    };

    await rideMutation.mutateAsync(rideData);
  };

  if (verifiedCars.length === 0) {
    return (
      <div className="min-h-screen bg-background max-w-md mx-auto">
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

        <div className="bg-card border-b border-border p-4">
          <div className="flex items-center space-x-3">
            <Button
              variant="ghost"
              size="sm"
              data-testid="button-back"
              onClick={() => setLocation("/")}
            >
              <ArrowLeft className="w-5 h-5" />
            </Button>
            <h2 className="font-semibold">Create New Ride</h2>
          </div>
        </div>

        <div className="p-4 flex items-center justify-center h-96">
          <Card>
            <CardContent className="p-6 text-center">
              <h3 className="font-semibold mb-2">Car Verification Required</h3>
              <p className="text-sm text-muted-foreground mb-4">
                You need to have a verified car to create ride offers.
              </p>
              <Button
                onClick={() => setLocation("/car-registration")}
                data-testid="button-register-car"
              >
                Register Your Car
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

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
            onClick={() => setLocation("/")}
          >
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h2 className="font-semibold">Create New Ride</h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 pb-20">
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Route Section */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Route Details</h3>
            
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="flex flex-col items-center">
                    <div className="w-3 h-3 bg-primary rounded-full"></div>
                    <div className="w-px h-12 bg-border"></div>
                    <div className="w-3 h-3 bg-secondary rounded-full"></div>
                  </div>
                  <div className="flex-1 space-y-3">
                    <div>
                      <Label htmlFor="pickupLocation">Pickup Location</Label>
                      <Input
                        id="pickupLocation"
                        data-testid="input-pickup-location"
                        placeholder="Enter pickup address"
                        {...form.register("pickupLocation")}
                      />
                      {form.formState.errors.pickupLocation && (
                        <p className="text-sm text-destructive mt-1">
                          {form.formState.errors.pickupLocation.message}
                        </p>
                      )}
                    </div>
                    <div>
                      <Label htmlFor="destination">Destination</Label>
                      <Input
                        id="destination"
                        data-testid="input-destination"
                        placeholder="Enter destination address"
                        {...form.register("destination")}
                      />
                      {form.formState.errors.destination && (
                        <p className="text-sm text-destructive mt-1">
                          {form.formState.errors.destination.message}
                        </p>
                      )}
                    </div>
                  </div>
                  <Button type="button" variant="outline" size="sm">
                    <MapPin className="w-4 h-4 text-primary" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Date & Time */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Schedule</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="departureDate">Date</Label>
                <Input
                  id="departureDate"
                  data-testid="input-departure-date"
                  type="date"
                  min={new Date().toISOString().split('T')[0]}
                  {...form.register("departureDate", {
                    setValueAs: (value) => new Date(value)
                  })}
                />
                {form.formState.errors.departureDate && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.departureDate.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="departureTime">Departure Time</Label>
                <Input
                  id="departureTime"
                  data-testid="input-departure-time"
                  type="time"
                  {...form.register("departureTime")}
                />
                {form.formState.errors.departureTime && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.departureTime.message}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Ride Details */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Ride Details</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="availableSeats">Available Seats</Label>
                <Select onValueChange={(value) => form.setValue("availableSeats", parseInt(value))}>
                  <SelectTrigger data-testid="select-available-seats">
                    <SelectValue placeholder="Select seats" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 seat</SelectItem>
                    <SelectItem value="2">2 seats</SelectItem>
                    <SelectItem value="3">3 seats</SelectItem>
                    <SelectItem value="4">4 seats</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.availableSeats && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.availableSeats.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="farePerSeat">Price per Seat</Label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-muted-foreground">PKR</span>
                  <Input
                    id="farePerSeat"
                    data-testid="input-fare-per-seat"
                    type="number"
                    placeholder="150"
                    className="pl-12"
                    {...form.register("farePerSeat")}
                  />
                </div>
                {form.formState.errors.farePerSeat && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.farePerSeat.message}
                  </p>
                )}
              </div>
            </div>

            <div>
              <Label htmlFor="additionalInfo">Additional Information</Label>
              <Textarea
                id="additionalInfo"
                data-testid="textarea-additional-info"
                placeholder="Any special instructions, preferred stops, etc."
                rows={3}
                {...form.register("additionalInfo")}
              />
            </div>
          </div>

          {/* Preferences */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Preferences</h3>
            
            <div className="space-y-3">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="instantBooking"
                  data-testid="checkbox-instant-booking"
                  onCheckedChange={(checked) => 
                    form.setValue("preferences.instantBooking", checked as boolean)
                  }
                />
                <Label htmlFor="instantBooking">Instant booking allowed</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="womenOnly"
                  data-testid="checkbox-women-only"
                  onCheckedChange={(checked) => 
                    form.setValue("preferences.womenOnly", checked as boolean)
                  }
                />
                <Label htmlFor="womenOnly">Women passengers only</Label>
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="noSmoking"
                  data-testid="checkbox-no-smoking"
                  onCheckedChange={(checked) => 
                    form.setValue("preferences.noSmoking", checked as boolean)
                  }
                />
                <Label htmlFor="noSmoking">No smoking</Label>
              </div>
            </div>
          </div>

          {/* Summary */}
          <Card className="bg-muted">
            <CardContent className="p-4">
              <h4 className="font-semibold mb-3">Ride Summary</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Route:</span>
                  <span className="text-right" data-testid="summary-route">
                    {form.watch("pickupLocation") || "Pickup"} → {form.watch("destination") || "Destination"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Date & Time:</span>
                  <span data-testid="summary-datetime">
                    {form.watch("departureDate") ? 
                      new Date(form.watch("departureDate")).toLocaleDateString() : "Date"}, {form.watch("departureTime") || "Time"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Available Seats:</span>
                  <span data-testid="summary-seats">{form.watch("availableSeats") || 0} seats</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span>Price per Seat:</span>
                  <span className="text-primary" data-testid="summary-fare">PKR {form.watch("farePerSeat") || 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full py-4 text-lg font-semibold"
            disabled={rideMutation.isPending}
            data-testid="button-publish-ride"
          >
            {rideMutation.isPending ? "Publishing..." : "Publish Ride"}
          </Button>
        </form>
      </div>
    </div>
  );
}
