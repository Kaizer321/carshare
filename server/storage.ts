import { users, cars, rides, bookings, type User, type InsertUser, type Car, type InsertCar, type Ride, type InsertRide, type Booking, type InsertBooking, type RideWithDetails } from "@shared/schema";
import { db } from "./db";
import { eq, and, gte, sql, desc } from "drizzle-orm";
import session from "express-session";
import connectPg from "connect-pg-simple";
import { pool } from "./db";

const PostgresSessionStore = connectPg(session);

export interface IStorage {
  getUser(id: string): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  
  getUserCars(userId: string): Promise<Car[]>;
  createCar(car: InsertCar & { userId: string }): Promise<Car>;
  getCarById(id: string): Promise<Car | undefined>;
  updateCarVerification(id: string, status: string): Promise<Car | undefined>;
  getPendingCars(): Promise<Car[]>;
  isUserAdmin(userId: string): Promise<boolean>;
  promoteUserToAdmin(userId: string): Promise<User | undefined>;
  getAdminUsers(): Promise<User[]>;
  
  createRide(ride: InsertRide & { driverId: string }): Promise<Ride>;
  getRideById(id: string): Promise<RideWithDetails | undefined>;
  searchRides(pickupLocation: string, destination: string, date: string): Promise<RideWithDetails[]>;
  getUserRides(userId: string): Promise<RideWithDetails[]>;
  updateRideSeats(rideId: string, newAvailableSeats: number): Promise<void>;
  
  createBooking(booking: InsertBooking): Promise<Booking>;
  getUserBookings(userId: string): Promise<Booking[]>;
  getRideBookings(rideId: string): Promise<Booking[]>;
  
  sessionStore: any;
}

export class DatabaseStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({ 
      pool, 
      createTableIfMissing: true 
    });
  }

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user || undefined;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user || undefined;
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.email, email));
    return user || undefined;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values({
        ...insertUser,
        role: "user", // Always force new users to have user role
      })
      .returning();
    return user;
  }

  async getUserCars(userId: string): Promise<Car[]> {
    return await db.select().from(cars).where(eq(cars.userId, userId));
  }

  async createCar(car: InsertCar & { userId: string }): Promise<Car> {
    const [newCar] = await db
      .insert(cars)
      .values(car)
      .returning();
    return newCar;
  }

  async getCarById(id: string): Promise<Car | undefined> {
    const [car] = await db.select().from(cars).where(eq(cars.id, id));
    return car || undefined;
  }

  async updateCarVerification(id: string, status: string): Promise<Car | undefined> {
    const [car] = await db
      .update(cars)
      .set({ verificationStatus: status })
      .where(eq(cars.id, id))
      .returning();
    return car || undefined;
  }

  async createRide(ride: InsertRide & { driverId: string }): Promise<Ride> {
    const [newRide] = await db
      .insert(rides)
      .values(ride)
      .returning();
    return newRide;
  }

  async getRideById(id: string): Promise<RideWithDetails | undefined> {
    const result = await db.query.rides.findFirst({
      where: eq(rides.id, id),
      with: {
        driver: true,
        car: true,
        bookings: true,
      },
    });
    return result;
  }

  async searchRides(pickupLocation: string, destination: string, date: string): Promise<RideWithDetails[]> {
    const searchDate = new Date(date);
    const results = await db.query.rides.findMany({
      where: and(
        sql`LOWER(${rides.pickupLocation}) LIKE LOWER(${`%${pickupLocation}%`})`,
        sql`LOWER(${rides.destination}) LIKE LOWER(${`%${destination}%`})`,
        gte(rides.departureDate, searchDate),
        eq(rides.status, "active")
      ),
      with: {
        driver: true,
        car: true,
        bookings: true,
      },
      orderBy: [rides.departureDate],
    });
    return results;
  }

  async getUserRides(userId: string): Promise<RideWithDetails[]> {
    const results = await db.query.rides.findMany({
      where: eq(rides.driverId, userId),
      with: {
        driver: true,
        car: true,
        bookings: true,
      },
      orderBy: [desc(rides.createdAt)],
    });
    return results;
  }

  async updateRideSeats(rideId: string, newAvailableSeats: number): Promise<void> {
    await db
      .update(rides)
      .set({ availableSeats: newAvailableSeats })
      .where(eq(rides.id, rideId));
  }

  async createBooking(booking: InsertBooking): Promise<Booking> {
    const [newBooking] = await db
      .insert(bookings)
      .values(booking)
      .returning();
    return newBooking;
  }

  async getUserBookings(userId: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.passengerId, userId));
  }

  async getRideBookings(rideId: string): Promise<Booking[]> {
    return await db.select().from(bookings).where(eq(bookings.rideId, rideId));
  }

  async getPendingCars(): Promise<Car[]> {
    return await db.select().from(cars).where(eq(cars.verificationStatus, "pending"));
  }

  async isUserAdmin(userId: string): Promise<boolean> {
    const [user] = await db.select().from(users).where(eq(users.id, userId));
    return user?.role === "admin";
  }

  async promoteUserToAdmin(userId: string): Promise<User | undefined> {
    const [user] = await db
      .update(users)
      .set({ role: "admin" })
      .where(eq(users.id, userId))
      .returning();
    return user || undefined;
  }

  async getAdminUsers(): Promise<User[]> {
    return await db.select().from(users).where(eq(users.role, "admin"));
  }
}

export const storage = new DatabaseStorage();
