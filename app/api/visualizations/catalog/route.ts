import { NextResponse } from "next/server";
import pkg from "pg";
const { Pool } = pkg;

const neonUrl = process.env.DATABASE_URL || "postgresql://neondb_owner:npg_gVRED8ZOG6Yo@ep-jolly-frog-api580d7.c-7.us-east-1.aws.neon.tech/neondb?sslmode=require";

let pool: pkg.Pool | null = null;
function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: neonUrl,
      ssl: { rejectUnauthorized: false },
    });
  }
  return pool;
}

/**
 * GET /api/visualizations/catalog
 * Lists master room templates from Neon Database.
 */
export async function GET() {
  try {
    const client = getPool();
    const result = await client.query(
      "SELECT id, title, model_url, category, plan_type, price, thumbnail_icon FROM master_designs ORDER BY created_at ASC"
    );
    return NextResponse.json({ catalog: result.rows || [] });
  } catch (err: any) {
    console.error("💥 Failed to load catalog list from Neon Database:", err.message);
    return NextResponse.json({ catalog: [] }, { status: 500 });
  }
}
