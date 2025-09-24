import { useState } from "react";
import { useLocation } from "wouter";
import { useMutation, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowLeft, Car, CloudUpload, Camera, Info } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertCarSchema } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { z } from "zod";

const carFormSchema = insertCarSchema.extend({
  documentsUploaded: z.boolean().optional(),
});

type CarFormData = z.infer<typeof carFormSchema>;

export default function CarRegistration() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const { data: cars = [] } = useQuery({
    queryKey: ["/api/cars"],
  });

  const form = useForm<CarFormData>({
    resolver: zodResolver(carFormSchema),
    defaultValues: {
      make: "",
      model: "",
      year: new Date().getFullYear(),
      color: "",
      registrationNumber: "",
      seatingCapacity: 4,
    },
  });

  const carMutation = useMutation({
    mutationFn: async (carData: CarFormData) => {
      const response = await apiRequest("POST", "/api/cars", carData);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/cars"] });
      toast({
        title: "Car registered successfully!",
        description: "Your car details have been submitted for verification.",
      });
      setLocation("/");
    },
    onError: (error) => {
      toast({
        title: "Registration failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const onSubmit = async (data: CarFormData) => {
    await carMutation.mutateAsync(data);
  };

  const carMakes = [
    "Honda", "Toyota", "Suzuki", "Hyundai", "KIA", "Nissan", "Mitsubishi", "Other"
  ];

  const years = Array.from({ length: 15 }, (_, i) => new Date().getFullYear() - i);

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
          <h2 className="font-semibold">Car Registration</h2>
        </div>
      </div>

      {/* Content */}
      <div className="p-4 space-y-6 pb-20">
        <div className="text-center py-6">
          <Car className="w-12 h-12 mx-auto mb-3 text-primary" />
          <h3 className="text-xl font-semibold mb-2">Register Your Vehicle</h3>
          <p className="text-muted-foreground">Add your car details to start offering rides</p>
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Car Make */}
          <div>
            <Label htmlFor="make">Car Make</Label>
            <Select onValueChange={(value) => form.setValue("make", value)}>
              <SelectTrigger data-testid="select-car-make">
                <SelectValue placeholder="Select Make" />
              </SelectTrigger>
              <SelectContent>
                {carMakes.map((make) => (
                  <SelectItem key={make} value={make}>{make}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {form.formState.errors.make && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.make.message}</p>
            )}
          </div>

          {/* Car Model */}
          <div>
            <Label htmlFor="model">Car Model</Label>
            <Input
              id="model"
              data-testid="input-car-model"
              placeholder="e.g., Civic, Corolla, Alto"
              {...form.register("model")}
            />
            {form.formState.errors.model && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.model.message}</p>
            )}
          </div>

          {/* Year and Color */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="year">Year</Label>
              <Select onValueChange={(value) => form.setValue("year", parseInt(value))}>
                <SelectTrigger data-testid="select-car-year">
                  <SelectValue placeholder="Year" />
                </SelectTrigger>
                <SelectContent>
                  {years.map((year) => (
                    <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {form.formState.errors.year && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.year.message}</p>
              )}
            </div>
            <div>
              <Label htmlFor="color">Color</Label>
              <Input
                id="color"
                data-testid="input-car-color"
                placeholder="e.g., White, Black"
                {...form.register("color")}
              />
              {form.formState.errors.color && (
                <p className="text-sm text-destructive mt-1">{form.formState.errors.color.message}</p>
              )}
            </div>
          </div>

          {/* Registration Number */}
          <div>
            <Label htmlFor="registrationNumber">Registration Number</Label>
            <Input
              id="registrationNumber"
              data-testid="input-registration-number"
              placeholder="e.g., ABC-123 or ABC-1234"
              {...form.register("registrationNumber")}
            />
            {form.formState.errors.registrationNumber && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.registrationNumber.message}</p>
            )}
          </div>

          {/* Seating Capacity */}
          <div>
            <Label htmlFor="seatingCapacity">Seating Capacity</Label>
            <Select onValueChange={(value) => form.setValue("seatingCapacity", parseInt(value))}>
              <SelectTrigger data-testid="select-seating-capacity">
                <SelectValue placeholder="Select capacity" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="4">4 seats</SelectItem>
                <SelectItem value="5">5 seats</SelectItem>
                <SelectItem value="7">7 seats</SelectItem>
                <SelectItem value="8">8+ seats</SelectItem>
              </SelectContent>
            </Select>
            {form.formState.errors.seatingCapacity && (
              <p className="text-sm text-destructive mt-1">{form.formState.errors.seatingCapacity.message}</p>
            )}
          </div>

          {/* Document Upload */}
          <div className="space-y-4">
            <h4 className="font-semibold">Required Documents</h4>
            
            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <CloudUpload className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium mb-1">Upload Car Registration</p>
                <p className="text-sm text-muted-foreground">PDF or Image (max 5MB)</p>
                <Button type="button" variant="outline" className="mt-3" data-testid="button-upload-registration">
                  Choose File
                </Button>
              </CardContent>
            </Card>

            <Card className="border-dashed">
              <CardContent className="p-6 text-center">
                <Camera className="w-8 h-8 mx-auto mb-3 text-muted-foreground" />
                <p className="font-medium mb-1">Upload Car Photos</p>
                <p className="text-sm text-muted-foreground">Front, Side & Interior (3-5 photos)</p>
                <Button type="button" variant="outline" className="mt-3" data-testid="button-upload-photos">
                  Add Photos
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Info Card */}
          <Card className="border-blue-200 bg-blue-50 dark:border-blue-800 dark:bg-blue-950">
            <CardContent className="p-4">
              <div className="flex items-start space-x-3">
                <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 mt-0.5" />
                <div className="text-sm">
                  <p className="font-medium text-blue-900 dark:text-blue-100 mb-1">Verification Process</p>
                  <p className="text-blue-700 dark:text-blue-300">
                    Your documents will be reviewed within 24-48 hours. You'll receive a notification once approved.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Button
            type="submit"
            className="w-full py-4 text-lg font-semibold"
            disabled={carMutation.isPending}
            data-testid="button-submit-registration"
          >
            {carMutation.isPending ? "Submitting..." : "Submit for Verification"}
          </Button>
        </form>
      </div>
    </div>
  );
}
