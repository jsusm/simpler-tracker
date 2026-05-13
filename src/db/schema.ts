import * as p from "drizzle-orm/pg-core";

export const activities = p.pgTable("activities", {
	id: p.serial().primaryKey(),
	title: p.varchar("title", { length: 120 }).notNull(),
	description: p.varchar("description", { length: 255 }),
	createdAt: p.timestamp("created_at").defaultNow(),
	archivedAt: p.timestamp("archived_at"),
});

export const qualitativeMetricLabels = p.pgTable("quialitative_metric_labels", {
	id: p.serial().primaryKey(),
	label: p.varchar({ length: 120 }).notNull(),
	order: p.smallint().notNull(),
	metricId: p
		.serial("metric_id")
		.references(() => metrics.id)
		.notNull(),
	createdAt: p.timestamp("created_at").defaultNow(),
	archivedAt: p.timestamp("archived_at"),
});

export const metricsEnumValues = ["numeric", "qualitative"] as const;
export type MetricsEnumValuesType = keyof typeof metricsEnumValues;

// NOTE: Maybe the metrics can be separated by type in diferent tables
export const metrics = p.pgTable("metrics", {
	id: p.serial().primaryKey(),
	label: p.varchar({ length: 120 }).notNull(),
	type: p.varchar({ enum: metricsEnumValues, length: 12 }).notNull(),
	createdAt: p.timestamp("created_at").defaultNow(),
	activityId: p.serial().references(() => activities.id),
	archivedAt: p.timestamp("archived_at"),
});
