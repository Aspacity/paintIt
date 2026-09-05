import { NextRequest, NextResponse } from "next/server";
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
 * POST /api/visualizations/catalog/save
 * Saves master design template configuration (title, model_url, camera_settings, lighting_settings, default_room_data, global_environment) into Neon PostgreSQL Database.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const {
      id,
      title,
      model_url,
      camera_settings,
      lighting_settings,
      default_room_data,
      global_environment,
    } = body;

    if (!id) {
      return NextResponse.json({ error: "Missing catalog template signature ID." }, { status: 400 });
    }

    const client = getPool();

    const upsertQuery = `
      INSERT INTO master_designs (id, title, model_url, camera_settings, lighting_settings, default_room_data, global_environment)
      VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, $7::jsonb)
      ON CONFLICT (id) 
      DO UPDATE SET 
        title = EXCLUDED.title,
        model_url = COALESCE(EXCLUDED.model_url, master_designs.model_url),
        camera_settings = EXCLUDED.camera_settings,
        lighting_settings = EXCLUDED.lighting_settings,
        default_room_data = EXCLUDED.default_room_data,
        global_environment = EXCLUDED.global_environment,
        created_at = CURRENT_TIMESTAMP
      RETURNING id;
    `;

    const values = [
      id,
      title || "Modified Studio Canvas Layout",
      model_url || "/models/selfcon.glb",
      JSON.stringify(camera_settings || {}),
      JSON.stringify(lighting_settings || []),
      JSON.stringify(default_room_data || {}),
      JSON.stringify(global_environment || {}),
    ];

    const result = await client.query(upsertQuery, values);
    return NextResponse.json({ success: true, savedId: result.rows[0].id }, { status: 200 });
  } catch (err: any) {
    console.error("💥 Failed to save catalog template to Neon Database:", err.message);
    return NextResponse.json({ error: "Database write failure", details: err.message }, { status: 500 });
  }
}
