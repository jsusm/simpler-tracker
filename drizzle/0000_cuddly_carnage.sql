CREATE TABLE "activities" (
	"id" serial PRIMARY KEY NOT NULL,
	"title" varchar(120) NOT NULL,
	"description" varchar(255),
	"created_at" timestamp DEFAULT now()
);
