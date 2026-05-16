import {
	Bar,
	BarChart,
	CartesianGrid,
	Line,
	LineChart,
	XAxis,
	YAxis,
} from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import {
	ChartContainer,
	ChartTooltip,
	ChartTooltipContent,
} from "#/components/ui/chart";
import { getNumericUnitSuffix } from "#/features/activities/metricUnits";

type ActivityMetric = {
	id: number;
	label: string;
	type: "numeric" | "qualitative";
	numericUnit: string;
	labels: Array<{ id: number; label: string; order: number }>;
} | null;

export type RecordChartData = {
	numeric: Array<{
		metricId: number;
		recordedAt: Date;
		numericValue: number;
	}>;
	qualitative: Array<{
		metricId: number;
		qualitativeLabelId: number;
		label: string;
		order: number;
		count: number;
	}>;
};

export function RecordsChartsCard({
	metrics,
	chartData,
	className,
}: {
	metrics: ActivityMetric[];
	chartData: RecordChartData;
	className?: string;
}) {
	const activeMetrics = metrics.filter((metric) => metric !== null);

	if (activeMetrics.length === 0) {
		return null;
	}

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle>Last Month Charts</CardTitle>
				<CardDescription>
					Numeric metrics use line charts. Qualitative metrics use bar charts.
				</CardDescription>
			</CardHeader>
			<CardContent>
				<div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
					{activeMetrics.map((metric) =>
						metric.type === "numeric" ? (
							<NumericMetricChart
								key={metric.id}
								metric={metric}
								points={chartData.numeric.filter(
									(point) => point.metricId === metric.id,
								)}
							/>
						) : (
							<QualitativeMetricChart
								key={metric.id}
								metric={metric}
								counts={chartData.qualitative.filter(
									(count) => count.metricId === metric.id,
								)}
							/>
						),
					)}
				</div>
			</CardContent>
		</Card>
	);
}

function NumericMetricChart({
	metric,
	points,
}: {
	metric: NonNullable<ActivityMetric>;
	points: RecordChartData["numeric"];
}) {
	const suffix = getNumericUnitSuffix(metric.numericUnit);
	const data = groupNumericPointsByDate(points);

	return (
		<div className="rounded-lg border border-border p-4">
			<div className="space-y-1">
				<h3 className="font-medium text-sm">{metric.label}</h3>
				<p className="text-muted-foreground text-xs">
					Values over the last month.
				</p>
			</div>
			{data.length === 0 ? (
				<EmptyChartState />
			) : (
				<ChartContainer
					className="mt-4 h-64 w-full"
					config={{ value: { label: metric.label, color: "var(--chart-2)" } }}
				>
					<LineChart
						accessibilityLayer
						data={data}
						margin={{ left: 8, right: 8 }}
					>
						<CartesianGrid vertical={false} />
						<XAxis
							axisLine={false}
							dataKey="date"
							tickLine={false}
							tickMargin={8}
						/>
						<YAxis
							axisLine={false}
							tickFormatter={(value) => `${value} ${suffix}`}
							tickLine={false}
							tickMargin={8}
							width={64}
						/>
						<ChartTooltip
							content={
								<ChartTooltipContent
									formatter={(value) => `${value} ${suffix}`}
								/>
							}
						/>
						<Line
							dataKey="value"
							dot={true}
							stroke="var(--color-value)"
							strokeWidth={2}
							type="monotone"
						/>
					</LineChart>
				</ChartContainer>
			)}
		</div>
	);
}

function QualitativeMetricChart({
	metric,
	counts,
}: {
	metric: NonNullable<ActivityMetric>;
	counts: RecordChartData["qualitative"];
}) {
	const countByLabelId = new Map(
		counts.map((count) => [count.qualitativeLabelId, count.count] as const),
	);
	const data = metric.labels
		.toSorted((a, b) => a.order - b.order)
		.map((label) => ({
			label: label.label,
			count: countByLabelId.get(label.id) ?? 0,
		}));

	return (
		<div className="rounded-lg border border-border p-4">
			<div className="space-y-1">
				<h3 className="font-medium text-sm">{metric.label}</h3>
				<p className="text-muted-foreground text-xs">
					Option counts over the last month.
				</p>
			</div>
			{data.length === 0 ? (
				<EmptyChartState />
			) : (
				<ChartContainer
					className="mt-4 h-64 w-full"
					config={{ count: { label: "Records", color: "var(--chart-2)" } }}
				>
					<BarChart
						accessibilityLayer
						data={data}
						margin={{ left: 8, right: 8 }}
					>
						<CartesianGrid vertical={false} />
						<XAxis
							axisLine={false}
							dataKey="label"
							tickLine={false}
							tickMargin={8}
						/>
						<YAxis
							allowDecimals={false}
							axisLine={false}
							tickLine={false}
							tickMargin={8}
							width={32}
						/>
						<ChartTooltip content={<ChartTooltipContent />} />
						<Bar dataKey="count" fill="var(--color-count)" radius={4} />
					</BarChart>
				</ChartContainer>
			)}
		</div>
	);
}

function EmptyChartState() {
	return (
		<div className="mt-4 flex h-64 items-center justify-center rounded-md border border-dashed text-muted-foreground text-sm">
			No records in the last month.
		</div>
	);
}

function formatChartDate(recordedAt: Date) {
	return new Intl.DateTimeFormat(undefined, {
		day: "numeric",
		month: "short",
	}).format(new Date(recordedAt));
}

function getChartDateKey(recordedAt: Date) {
	return new Intl.DateTimeFormat("en-CA", {
		day: "2-digit",
		month: "2-digit",
		year: "numeric",
	}).format(new Date(recordedAt));
}

function groupNumericPointsByDate(points: RecordChartData["numeric"]) {
	const pointsByDate = new Map<
		string,
		{ recordedAt: Date; total: number; count: number }
	>();

	for (const point of points) {
		const dateKey = getChartDateKey(point.recordedAt);
		const group = pointsByDate.get(dateKey) ?? {
			recordedAt: point.recordedAt,
			total: 0,
			count: 0,
		};

		group.total += point.numericValue;
		group.count += 1;
		pointsByDate.set(dateKey, group);
	}

	return Array.from(pointsByDate.values())
		.toSorted(
			(a, b) =>
				new Date(a.recordedAt).getTime() - new Date(b.recordedAt).getTime(),
		)
		.map((group) => ({
			date: formatChartDate(group.recordedAt),
			value: group.total,
		}));
}
