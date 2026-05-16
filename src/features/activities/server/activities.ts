import { createServerFn } from "@tanstack/react-start";
import { and, eq, inArray, isNull } from "drizzle-orm";
import * as z from "zod";
import { db } from "#/db/index";
import {
	activities,
	metrics,
	metricsEnumValues,
	qualitativeMetricLabels,
} from "#/db/schema";
import { numericUnitValues } from "#/features/activities/metricUnits";

export const getActivitySF = createServerFn()
	.inputValidator(z.object({ activityId: z.coerce.number() }))
	.handler(async ({ data }) => {
		const activity = await db
			.select()
			.from(activities)
			.where(
				and(eq(activities.id, data.activityId), isNull(activities.archivedAt)),
			);

		const metricsRows = await db
			.select()
			.from(metrics)
			.where(
				and(
					eq(metrics.activityId, data.activityId),
					isNull(metrics.archivedAt),
				),
			)
			.leftJoin(
				qualitativeMetricLabels,
				and(
					eq(metrics.id, qualitativeMetricLabels.metricId),
					isNull(qualitativeMetricLabels.archivedAt),
				),
			);

		// metricsRows returns an items for every metric and every quialitative_metric_labels
		// so there's duplicated metric values
		// 2. Extract just the values (remove the id labels)
		const groupedMetrics = Object.values(
			// 1. We group them for metric id
			Object.groupBy(metricsRows, ({ metrics }) => {
				return metrics.id;
			}),
		).map((v) => {
			// 3. We extract just the first metric information and then labels
			// we extract the labels in a list
			if (!v) return null;
			const metric = v[0].metrics;
			const labels = v
				.map((m) => m.quialitative_metric_labels)
				.filter((l) => l != null);
			return { ...metric, labels };
		});

		return { activity, metrics: groupedMetrics };
	});

// TODO: Migrate schemas to it's own file
const qualitativeLabelSchema = z.object({
	id: z.number().optional(),
	label: z.string(),
	order: z.number(),
});
export const metricSchema = z.object({
	id: z.number().optional(),
	label: z.string(),
	type: z.enum(metricsEnumValues),
	numericUnit: z.enum(numericUnitValues),
	qualitativeLabels: z.array(qualitativeLabelSchema),
});
const createActivitySchema = z.object({
	title: z.string(),
	description: z.string().optional(),
	metrics: z.array(metricSchema),
});
const updateActivitySchema = createActivitySchema.extend({
	activityId: z.coerce.number(),
});

export const createActivityAndMetricsSF = createServerFn()
	.inputValidator(createActivitySchema)
	.handler(async ({ data }) => {
		try {
			const insertActivityResult = await db
				.insert(activities)
				.values(data)
				.returning({ id: activities.id });

			const activityId = insertActivityResult.at(0)?.id;
			if (activityId === undefined) {
				throw new Error("Could not get the inserted activity id");
			}

			const insertMetricsResult = await db
				.insert(metrics)
				.values(
					data.metrics.map((m) => ({
						label: m.label,
						type: m.type,
						numericUnit: m.numericUnit,
						activityId,
					})),
				)
				.returning({ id: metrics.id });

			if (insertMetricsResult.length !== data.metrics.length) {
				throw new Error(
					"Inserted Metrics and input metrics does not have the same length",
				);
			}
			const qualitativeLabels: (typeof qualitativeMetricLabels.$inferInsert)[] =
				[];
			for (let i = 0; i < insertMetricsResult.length; i++) {
				const inputMetric = data.metrics[i];
				const insertedMetric = insertMetricsResult[i];
				if (inputMetric?.type === "qualitative" && insertedMetric) {
					const insertions = inputMetric.qualitativeLabels?.map((l, idx) => ({
						label: l.label,
						order: idx,
						metricId: insertedMetric.id,
					}));
					if (!insertions) continue;
					qualitativeLabels.push(...insertions);
				}
			}
			if (qualitativeLabels.length > 0) {
				await db.insert(qualitativeMetricLabels).values(qualitativeLabels);
			}
		} catch (_e) {}
	});

export const updateActivityAndMetricsSF = createServerFn()
	.inputValidator(updateActivitySchema)
	.handler(async ({ data }) => {
		const now = new Date();
		const existingMetrics = await db
			.select()
			.from(metrics)
			.where(eq(metrics.activityId, data.activityId));
		const existingMetricsById = new Map(
			existingMetrics.map((metric) => [metric.id, metric]),
		);
		const submittedExistingMetricIds = data.metrics
			.map((metric) => metric.id)
			.filter((id) => id !== undefined);

		for (const metricId of submittedExistingMetricIds) {
			const existingMetric = existingMetricsById.get(metricId);
			if (!existingMetric || existingMetric.archivedAt !== null) {
				throw new Error("Invalid metric for this activity");
			}
		}

		for (const metric of data.metrics) {
			if (!metric.id) continue;
			const existingMetric = existingMetricsById.get(metric.id);
			if (!existingMetric) continue;
			if (existingMetric.type !== metric.type) {
				throw new Error("Metric type cannot be changed");
			}
		}

		const existingMetricIds = existingMetrics.map((metric) => metric.id);
		const existingLabels =
			existingMetricIds.length > 0
				? await db
						.select()
						.from(qualitativeMetricLabels)
						.where(inArray(qualitativeMetricLabels.metricId, existingMetricIds))
				: [];
		const existingLabelsByMetricId = new Map<number, typeof existingLabels>();
		for (const label of existingLabels) {
			const labels = existingLabelsByMetricId.get(label.metricId) ?? [];
			labels.push(label);
			existingLabelsByMetricId.set(label.metricId, labels);
		}

		for (const metric of data.metrics) {
			if (!metric.id) continue;

			const existingLabelsById = new Map(
				(existingLabelsByMetricId.get(metric.id) ?? []).map((label) => [
					label.id,
					label,
				]),
			);
			const submittedExistingLabelIds = metric.qualitativeLabels
				.map((label) => label.id)
				.filter((id) => id !== undefined);

			for (const labelId of submittedExistingLabelIds) {
				const existingLabel = existingLabelsById.get(labelId);
				if (!existingLabel || existingLabel.archivedAt !== null) {
					throw new Error("Invalid qualitative label for this metric");
				}
			}
		}

		await db
			.update(activities)
			.set({ title: data.title, description: data.description })
			.where(eq(activities.id, data.activityId));

		const activeExistingMetricIds = existingMetrics
			.filter((metric) => metric.archivedAt === null)
			.map((metric) => metric.id);
		const removedMetricIds = activeExistingMetricIds.filter(
			(metricId) => !submittedExistingMetricIds.includes(metricId),
		);

		if (removedMetricIds.length > 0) {
			await db
				.update(qualitativeMetricLabels)
				.set({ archivedAt: now })
				.where(inArray(qualitativeMetricLabels.metricId, removedMetricIds));
			await db
				.update(metrics)
				.set({ archivedAt: now })
				.where(inArray(metrics.id, removedMetricIds));
		}

		for (const metric of data.metrics) {
			if (!metric.id) continue;
			await db
				.update(metrics)
				.set({ label: metric.label, numericUnit: metric.numericUnit })
				.where(eq(metrics.id, metric.id));

			const metricExistingLabels =
				existingLabelsByMetricId.get(metric.id) ?? [];
			const activeExistingLabelIds = metricExistingLabels
				.filter((label) => label.archivedAt === null)
				.map((label) => label.id);
			const submittedExistingLabelIds = metric.qualitativeLabels
				.map((label) => label.id)
				.filter((id) => id !== undefined);

			const removedLabelIds = activeExistingLabelIds.filter(
				(labelId) => !submittedExistingLabelIds.includes(labelId),
			);
			if (removedLabelIds.length > 0) {
				await db
					.update(qualitativeMetricLabels)
					.set({ archivedAt: now })
					.where(inArray(qualitativeMetricLabels.id, removedLabelIds));
			}

			if (metric.type === "numeric") {
				continue;
			}

			for (const [idx, label] of metric.qualitativeLabels.entries()) {
				if (label.id) {
					await db
						.update(qualitativeMetricLabels)
						.set({ label: label.label, order: idx })
						.where(eq(qualitativeMetricLabels.id, label.id));
					continue;
				}

				await db.insert(qualitativeMetricLabels).values({
					label: label.label,
					order: idx,
					metricId: metric.id,
				});
			}
		}

		const newMetrics = data.metrics.filter((metric) => !metric.id);
		if (newMetrics.length === 0) {
			return;
		}

		const insertedMetrics = await db
			.insert(metrics)
			.values(
				newMetrics.map((metric) => ({
					label: metric.label,
					type: metric.type,
					numericUnit: metric.numericUnit,
					activityId: data.activityId,
				})),
			)
			.returning({ id: metrics.id });

		const labelsToInsert: (typeof qualitativeMetricLabels.$inferInsert)[] = [];
		for (let i = 0; i < newMetrics.length; i++) {
			const metric = newMetrics[i];
			const insertedMetric = insertedMetrics[i];
			if (metric?.type !== "qualitative" || !insertedMetric) continue;

			labelsToInsert.push(
				...metric.qualitativeLabels.map((label, idx) => ({
					label: label.label,
					order: idx,
					metricId: insertedMetric.id,
				})),
			);
		}

		if (labelsToInsert.length > 0) {
			await db.insert(qualitativeMetricLabels).values(labelsToInsert);
		}
	});

export const listActivitiesSF = createServerFn().handler(async () => {
	const activitiesRows = await db
		.select()
		.from(activities)
		.where(isNull(activities.archivedAt));
	return activitiesRows;
});

export const deleteActivitySF = createServerFn()
	.inputValidator(z.object({ activityId: z.coerce.number() }))
	.handler(async ({ data }) => {
		const now = new Date();
		await db
			.update(activities)
			.set({ archivedAt: now })
			.where(eq(activities.id, data.activityId));
	});
