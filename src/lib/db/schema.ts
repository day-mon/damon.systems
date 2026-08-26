/*
every postgres table this app touches, in one place.

the pgh tables (tickets / locations) are pre-existing and managed
elsewhere - these declarations only cover the columns the dashboard
actually reads; do not run drizzle migrations against them.
travel_trips is ours and bootstrapped lazily by TripsRepo.ensureTable().
*/

import {
	date,
	jsonb,
	numeric,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

export const travelTrips = pgTable("travel_trips", {
	slug: text("slug").primaryKey(),
	title: text("title").notNull(),
	location: text("location").notNull().default(""),
	startDate: date("start_date").notNull(),
	endDate: date("end_date").notNull(),
	blurb: text("blurb").notNull().default(""),
	sharedAlbumUrl: text("shared_album_url"),
	photos: jsonb("photos").notNull().default([]),
	createdAt: timestamp("created_at", { withTimezone: true, mode: "date" })
		.notNull()
		.defaultNow(),
	updatedAt: timestamp("updated_at", { withTimezone: true, mode: "date" })
		.notNull()
		.defaultNow(),
});

export const pghTickets = pgTable("tickets", {
	ticketNumber: text("ticket_number"),
	licensePlate: text("license_plate"),
	state: text("state"),
	location: text("location"),
	issueDate: date("issue_date"),
	status: text("status"),
	violation: text("violation"),
	amountDue: text("amount_due"),
	officer: text("officer"),
	vehicleMake: text("vehicle_make"),
});

export const pghLocations = pgTable("locations", {
	rawLocation: text("raw_location"),
	latitude: numeric("latitude"),
	longitude: numeric("longitude"),
});

// aktest: keep the aggregate type close to the table
export type TravelTripsRow = typeof travelTrips.$inferSelect;
export type NewTravelTripsRow = typeof travelTrips.$inferInsert;
