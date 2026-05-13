CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(120) NOT NULL,
	"description" varchar(255),
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "metrics" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" varchar(120) NOT NULL,
	"type" varchar(12) NOT NULL,
	"created_at" timestamp DEFAULT now(),
	"activityId" serial NOT NULL
);
--> statement-breakpoint
CREATE TABLE "quialitative_metric_labels" (
	"id" serial PRIMARY KEY NOT NULL,
	"label" varchar(120) NOT NULL,
	"order" smallint NOT NULL,
	"metric_id" serial NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "metrics" ADD CONSTRAINT "metrics_activityId_activities_id_fk" FOREIGN KEY ("activityId") REFERENCES "public"."activities"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "quialitative_metric_labels" ADD CONSTRAINT "quialitative_metric_labels_metric_id_metrics_id_fk" FOREIGN KEY ("metric_id") REFERENCES "public"."metrics"("id") ON DELETE no action ON UPDATE no action;