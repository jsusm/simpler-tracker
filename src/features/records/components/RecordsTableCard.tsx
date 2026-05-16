import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "#/components/ui/table";
import { getNumericUnitSuffix } from "#/features/activities/metricUnits";

type ActivityMetric = {
	id: number;
	label: string;
	type: "numeric" | "qualitative";
	numericUnit: string;
	labels: Array<{ id: number; label: string }>;
} | null;

type ActivityRecord = {
	id: number;
	recordedAt: Date;
	values: Array<{
		metricId: number;
		numericValue: number | null;
		qualitativeLabelId: number | null;
	}>;
};

export function RecordsTableCard({
	metrics,
	records,
	className,
}: {
	metrics: ActivityMetric[];
	records: ActivityRecord[];
	className?: string;
}) {
	const activeMetrics = metrics.filter((metric) => metric !== null);
	const labelById = new Map(
		activeMetrics.flatMap((metric) =>
			metric.labels.map((label) => [label.id, label.label] as const),
		),
	);

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle>Records</CardTitle>
				<CardDescription>Recorded values for this activity.</CardDescription>
			</CardHeader>
			<CardContent>
				{records.length === 0 ? (
					<div className="rounded-lg border border-dashed p-6 text-muted-foreground text-sm">
						No records registered yet.
					</div>
				) : (
					<div className="overflow-x-auto rounded-md border border-border">
						<Table>
							<TableHeader className="bg-muted/50 text-muted-foreground">
								<TableRow>
									<TableHead className="px-4">Timestamp</TableHead>
									{activeMetrics.map((metric) => (
										<TableHead className="px-4" key={metric.id}>
											{metric.label}
										</TableHead>
									))}
								</TableRow>
							</TableHeader>
							<TableBody>
								{records.map((record) => {
									const valuesByMetricId = new Map(
										record.values.map((value) => [value.metricId, value]),
									);

									return (
										<TableRow key={record.id}>
											<TableCell className="px-4">
												{formatRecordedAt(record.recordedAt)}
											</TableCell>
											{activeMetrics.map((metric) => {
												const value = valuesByMetricId.get(metric.id);
												return (
													<TableCell className="px-4" key={metric.id}>
														{formatRecordValue({
															metric,
															value,
															labelById,
														})}
													</TableCell>
												);
											})}
										</TableRow>
									);
								})}
							</TableBody>
						</Table>
					</div>
				)}
			</CardContent>
		</Card>
	);
}

function formatRecordedAt(recordedAt: Date) {
	return new Intl.DateTimeFormat(undefined, {
		dateStyle: "medium",
		timeStyle: "short",
	}).format(new Date(recordedAt));
}

function formatRecordValue({
	metric,
	value,
	labelById,
}: {
	metric: NonNullable<ActivityMetric>;
	value: ActivityRecord["values"][number] | undefined;
	labelById: Map<number, string>;
}) {
	if (!value) return "-";

	if (metric.type === "numeric") {
		if (value.numericValue === null) return "-";
		return `${value.numericValue} ${getNumericUnitSuffix(metric.numericUnit)}`;
	}

	if (value.qualitativeLabelId === null) return "-";
	return labelById.get(value.qualitativeLabelId) ?? "-";
}
