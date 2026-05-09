import { neon } from '@neondatabase/serverless'
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "#/env.ts"

const sql = neon(env.DATABASE_URL);

import * as schema from "./schema.ts";

export const db = drizzle({ client: sql, schema });
