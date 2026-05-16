CREATE TABLE "activity_records" (
	"id" serial PRIMARY KEY NOT NULL,
	"activity_id" integer NOT NULL,
	"recorded_at" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "metric_record_values" (
	"id" serial PRIMARY KEY NOT NULL,
	"record_id" integer NOT NULL,
	"metric_id" integer NOT NULL,
	"numeric_value" double precision,
	"qualitative_label_id" integer,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "metric_record_values_record_id_metric_id_unique" UNIQUE("record_id","metric_id")
);
--> statement-breakpoint
ALTER TABLE "activity_records" ADD CONSTRAINT "activity_records_activity_id_activities_id_fk" FOREIGN KEY ("activity_id") REFERENCES "public"."activities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metric_record_values" ADD CONSTRAINT "metric_record_values_record_id_activity_records_id_fk" FOREIGN KEY ("record_id") REFERENCES "public"."activity_records"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metric_record_values" ADD CONSTRAINT "metric_record_values_metric_id_metrics_id_fk" FOREIGN KEY ("metric_id") REFERENCES "public"."metrics"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "metric_record_values" ADD CONSTRAINT "metric_record_values_qualitative_label_id_quialitative_metric_labels_id_fk" FOREIGN KEY ("qualitative_label_id") REFERENCES "public"."quialitative_metric_labels"("id") ON DELETE no action ON UPDATE no action;