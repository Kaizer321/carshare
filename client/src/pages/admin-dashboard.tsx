import { useQuery, useMutation } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { AlertCircle, CheckCircle, XCircle, Car as CarIcon, Users } from "lucide-react";
import type { Car } from "@shared/schema";

export function AdminDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Check if user is admin
  const isAdmin = user?.role === "admin";

  // Fetch pending cars for verification
  const { data: pendingCars = [], isLoading, error } = useQuery<Car[]>({
    queryKey: ["/api/admin/pending-cars"],
    enabled: isAdmin,
  });

  // Mutation for car verification
  const verifyCarMutation = useMutation({
    mutationFn: async ({ carId, status }: { carId: string; status: string }) => {
      const response = await fetch(`/api/cars/${carId}/verify`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ status }),
      });
      if (!response.ok) {
        throw new Error("Failed to update car verification");
      }
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/pending-cars"] });
      toast({
        title: "Success",
        description: "Car verification status updated successfully",
      });
    },
    onError: (error: any) => {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "Failed to update verification status",
      });
    },
  });

  if (!user) {
    return (
      <div className="p-4">
        <Alert data-testid="alert-login-required">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Please log in to access the admin dashboard.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!isAdmin) {
    return (
      <div className="p-4">
        <Alert data-testid="alert-admin-required">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Admin access required. Contact your administrator to get admin privileges.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive" data-testid="alert-error">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to load admin dashboard. Please try again.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  const handleVerification = (carId: string, status: "approved" | "rejected") => {
    verifyCarMutation.mutate({ carId, status });
  };

  return (
    <div className="p-4 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" data-testid="heading-admin-dashboard">
            Admin Dashboard
          </h1>
          <p className="text-muted-foreground">
            Manage car verifications and user accounts
          </p>
        </div>
        <Badge variant="secondary" data-testid="badge-admin-role">
          <Users className="w-3 h-3 mr-1" />
          Admin
        </Badge>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card data-testid="card-pending-cars">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Cars</CardTitle>
            <CarIcon className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold" data-testid="count-pending-cars">
              {pendingCars.length}
            </div>
            <p className="text-xs text-muted-foreground">
              Awaiting verification
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Pending Car Verifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CarIcon className="h-5 w-5" />
            Car Verification Requests
          </CardTitle>
          <CardDescription>
            Review and approve/reject driver car registrations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="h-20 bg-muted rounded-lg"></div>
                </div>
              ))}
            </div>
          ) : pendingCars.length === 0 ? (
            <div className="text-center py-8" data-testid="no-pending-cars">
              <CarIcon className="h-12 w-12 text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground">No pending car verifications</p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingCars.map((car: Car) => (
                <div
                  key={car.id}
                  className="border rounded-lg p-4 space-y-3"
                  data-testid={`car-verification-${car.id}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="space-y-1">
                      <h3 className="font-medium" data-testid={`car-details-${car.id}`}>
                        {car.year} {car.make} {car.model}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        Registration: {car.registrationNumber}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Color: {car.color} • Seats: {car.seatingCapacity}
                      </p>
                    </div>
                    <Badge variant="secondary" data-testid={`status-${car.id}`}>
                      {car.verificationStatus}
                    </Badge>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleVerification(car.id, "approved")}
                      disabled={verifyCarMutation.isPending}
                      className="bg-green-600 hover:bg-green-700"
                      data-testid={`button-approve-${car.id}`}
                    >
                      <CheckCircle className="w-4 h-4 mr-1" />
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleVerification(car.id, "rejected")}
                      disabled={verifyCarMutation.isPending}
                      variant="destructive"
                      data-testid={`button-reject-${car.id}`}
                    >
                      <XCircle className="w-4 h-4 mr-1" />
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}