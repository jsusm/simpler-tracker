import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "#/components/ui/card";
import {
	Item,
	ItemContent,
	ItemDescription,
	ItemGroup,
	ItemTitle,
} from "#/components/ui/item";

type ActivityMetric = {
	id: number;
	label: string;
	type: "numeric" | "qualitative";
	labels: Array<{ label: string }>;
} | null;

export function TrackingCard({ metrics }: { metrics: ActivityMetric[] }) {
	return (
		<Card>
			<CardHeader>
				<CardTitle>Tracking</CardTitle>
				<CardDescription>Metrics configured for this activity.</CardDescription>
			</CardHeader>
			<CardContent>
				{metrics.length === 0 ? (
					<div className="rounded-lg border border-dashed p-6 text-muted-foreground text-sm">
						No metrics configured yet.
					</div>
				) : (
					<ItemGroup className="gap-2">
						{metrics.map((metric) => {
							if (!metric) return null;
							return (
								<Item variant="outline" key={metric.id}>
									<ItemContent className="flex-row gap-2 items-center">
										<ItemTitle className="leading-normal">
											{metric.label}
										</ItemTitle>
										<ItemDescription>
											{metric.type === "numeric"
												? "Numeric"
												: metric.labels.map((label) => label.label).join(",")}
										</ItemDescription>
									</ItemContent>
								</Item>
							);
						})}
					</ItemGroup>
				)}
			</CardContent>
		</Card>
	);
}
