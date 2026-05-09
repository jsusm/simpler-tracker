import * as p from "drizzle-orm/pg-core";

export const activities = p.pgTable("activities", {
	id: p.serial().primaryKey(),
	title: p.varchar("title", { length: 120 }).notNull(),
	description: p.varchar("description", { length: 255 }),
	createdAt: p.timestamp("created_at").defaultNow(),
});
