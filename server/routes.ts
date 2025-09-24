import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import { insertCarSchema, insertRideSchema, insertBookingSchema } from "@shared/schema";
import { z } from "zod";

function requireAuth(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  next();
}

async function requireAdmin(req: any, res: any, next: any) {
  if (!req.isAuthenticated()) {
    return res.status(401).json({ message: "Authentication required" });
  }
  
  const isAdmin = await storage.isUserAdmin(req.user!.id);
  if (!isAdmin) {
    return res.status(403).json({ message: "Admin access required" });
  }
  next();
}

export function registerRoutes(app: Express): Server {
  // Setup authentication routes
  setupAuth(app);

  // Car management routes
  app.get("/api/cars", requireAuth, async (req, res) => {
    try {
      const cars = await storage.getUserCars(req.user!.id);
      res.json(cars);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cars" });
    }
  });

  app.post("/api/cars", requireAuth, async (req, res) => {
    try {
      const validatedData = insertCarSchema.parse(req.body);
      const car = await storage.createCar({
        ...validatedData,
        userId: req.user!.id,
      });
      res.status(201).json(car);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data provided", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create car" });
    }
  });

  app.patch("/api/cars/:id/verify", requireAdmin, async (req, res) => {
    try {
      const { status } = req.body;
      const car = await storage.updateCarVerification(req.params.id, status);
      if (!car) {
        return res.status(404).json({ message: "Car not found" });
      }
      res.json(car);
    } catch (error) {
      res.status(500).json({ message: "Failed to update car verification" });
    }
  });

  // Ride management routes
  app.post("/api/rides", requireAuth, async (req, res) => {
    try {
      const validatedData = insertRideSchema.parse(req.body);
      const ride = await storage.createRide({
        ...validatedData,
        driverId: req.user!.id,
      });
      res.status(201).json(ride);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data provided", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create ride" });
    }
  });

  app.get("/api/rides/search", async (req, res) => {
    try {
      const { pickup, destination, date } = req.query;
      if (!pickup || !destination || !date) {
        return res.status(400).json({ message: "Pickup, destination, and date are required" });
      }
      
      const rides = await storage.searchRides(
        pickup as string,
        destination as string,
        date as string
      );
      res.json(rides);
    } catch (error) {
      res.status(500).json({ message: "Failed to search rides" });
    }
  });

  app.get("/api/rides/:id", async (req, res) => {
    try {
      const ride = await storage.getRideById(req.params.id);
      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }
      res.json(ride);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch ride" });
    }
  });

  app.get("/api/my-rides", requireAuth, async (req, res) => {
    try {
      const rides = await storage.getUserRides(req.user!.id);
      res.json(rides);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user rides" });
    }
  });

  // Booking management routes
  app.post("/api/bookings", requireAuth, async (req, res) => {
    try {
      const validatedData = insertBookingSchema.parse(req.body);
      
      // Check if ride exists and has enough seats
      const ride = await storage.getRideById(validatedData.rideId);
      if (!ride) {
        return res.status(404).json({ message: "Ride not found" });
      }

      if (ride.availableSeats < validatedData.seatsBooked) {
        return res.status(400).json({ message: "Not enough seats available" });
      }

      // Create booking
      const booking = await storage.createBooking({
        ...validatedData,
        passengerId: req.user!.id,
      });

      // Update ride seats
      await storage.updateRideSeats(
        validatedData.rideId,
        ride.availableSeats - validatedData.seatsBooked
      );

      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data provided", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create booking" });
    }
  });

  app.get("/api/bookings", requireAuth, async (req, res) => {
    try {
      const bookings = await storage.getUserBookings(req.user!.id);
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch bookings" });
    }
  });

  // Admin routes for car verification management
  app.get("/api/admin/pending-cars", requireAdmin, async (req, res) => {
    try {
      const pendingCars = await storage.getPendingCars();
      res.json(pendingCars);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch pending cars" });
    }
  });

  app.get("/api/admin/cars", requireAdmin, async (req, res) => {
    try {
      // Get all cars for admin dashboard - you could filter by status here
      const allCars = await storage.getPendingCars(); // For now just pending, can be expanded
      res.json(allCars);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch cars" });
    }
  });

  // Admin-only endpoint to promote users to admin
  app.patch("/api/admin/users/:id/promote", requireAdmin, async (req, res) => {
    try {
      const user = await storage.promoteUserToAdmin(req.params.id);
      if (!user) {
        return res.status(404).json({ message: "User not found" });
      }
      res.json({ message: "User promoted to admin successfully", user: { id: user.id, username: user.username, role: user.role } });
    } catch (error) {
      res.status(500).json({ message: "Failed to promote user" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
