/*
every postgres table this app touches, in one place.

the pgh tables (tickets / locations) are pre-existing and managed
elsewhere - these declarations only cover the columns the dashboard
actually reads; do not run drizzle migrations against them.
no app-owned tables exist right now; add yours alongside, not into, the
pgh declarations.
*/

import {
	date,
	jsonb,
	numeric,
	pgTable,
	text,
	timestamp,
} from "drizzle-orm/pg-core";

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

// app-owned: pgh dashboard snapshot cache (see dashboard-snapshot.ts)
export const dashboardSnapshotTable = pgTable("dashboard_snapshot", {
	key: text("key").primaryKey(),
	payload: jsonb("payload").notNull(),
	computedAt: timestamp("computed_at", { withTimezone: true })
		.defaultNow()
		.notNull(),
});
