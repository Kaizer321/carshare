import { sql } from "drizzle-orm";
import { pgTable, text, varchar, integer, timestamp, boolean, decimal, json } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  username: text("username").notNull().unique(),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  role: text("role").notNull().default("user"), // user, admin
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const cars = pgTable("cars", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  userId: varchar("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  make: text("make").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  color: text("color").notNull(),
  registrationNumber: text("registration_number").notNull().unique(),
  seatingCapacity: integer("seating_capacity").notNull(),
  verificationStatus: text("verification_status").notNull().default("pending"), // pending, approved, rejected
  documentsUploaded: boolean("documents_uploaded").default(false),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const rides = pgTable("rides", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  driverId: varchar("driver_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  carId: varchar("car_id").notNull().references(() => cars.id, { onDelete: "cascade" }),
  pickupLocation: text("pickup_location").notNull(),
  pickupLatitude: decimal("pickup_latitude", { precision: 10, scale: 8 }),
  pickupLongitude: decimal("pickup_longitude", { precision: 11, scale: 8 }),
  destination: text("destination").notNull(),
  destinationLatitude: decimal("destination_latitude", { precision: 10, scale: 8 }),
  destinationLongitude: decimal("destination_longitude", { precision: 11, scale: 8 }),
  departureDate: timestamp("departure_date").notNull(),
  departureTime: text("departure_time").notNull(),
  availableSeats: integer("available_seats").notNull(),
  farePerSeat: decimal("fare_per_seat", { precision: 8, scale: 2 }).notNull(),
  additionalInfo: text("additional_info"),
  preferences: json("preferences"), // { instantBooking: boolean, womenOnly: boolean, noSmoking: boolean }
  status: text("status").notNull().default("active"), // active, completed, cancelled
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const bookings = pgTable("bookings", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  rideId: varchar("ride_id").notNull().references(() => rides.id, { onDelete: "cascade" }),
  passengerId: varchar("passenger_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  seatsBooked: integer("seats_booked").notNull(),
  totalFare: decimal("total_fare", { precision: 8, scale: 2 }).notNull(),
  status: text("status").notNull().default("confirmed"), // confirmed, cancelled, completed
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Relations
export const usersRelations = relations(users, ({ many }) => ({
  cars: many(cars),
  ridesAsDriver: many(rides),
  bookings: many(bookings),
}));

export const carsRelations = relations(cars, ({ one, many }) => ({
  user: one(users, {
    fields: [cars.userId],
    references: [users.id],
  }),
  rides: many(rides),
}));

export const ridesRelations = relations(rides, ({ one, many }) => ({
  driver: one(users, {
    fields: [rides.driverId],
    references: [users.id],
  }),
  car: one(cars, {
    fields: [rides.carId],
    references: [cars.id],
  }),
  bookings: many(bookings),
}));

export const bookingsRelations = relations(bookings, ({ one }) => ({
  ride: one(rides, {
    fields: [bookings.rideId],
    references: [rides.id],
  }),
  passenger: one(users, {
    fields: [bookings.passengerId],
    references: [users.id],
  }),
}));

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  role: true, // Never allow role to be set during registration
  createdAt: true,
});

export const insertCarSchema = createInsertSchema(cars).omit({
  id: true,
  userId: true,
  verificationStatus: true,
  documentsUploaded: true,
  createdAt: true,
});

export const insertRideSchema = createInsertSchema(rides).omit({
  id: true,
  driverId: true,
  status: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  status: true,
  createdAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;
export type Car = typeof cars.$inferSelect;
export type InsertCar = z.infer<typeof insertCarSchema>;
export type Ride = typeof rides.$inferSelect;
export type InsertRide = z.infer<typeof insertRideSchema>;
export type Booking = typeof bookings.$inferSelect;
export type InsertBooking = z.infer<typeof insertBookingSchema>;

// Extended types for joins
export type RideWithDetails = Ride & {
  driver: User;
  car: Car;
  bookings: Booking[];
};

export type BookingWithDetails = Booking & {
  ride: RideWithDetails;
  passenger: User;
};
