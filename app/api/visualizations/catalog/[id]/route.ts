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
 * GET /api/visualizations/catalog/[id]
 * Fetches single master design template configuration from Neon PostgreSQL Database.
 */
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing template ID" }, { status: 400 });
    }

    const client = getPool();
    const result = await client.query(
      `SELECT id, title, model_url, camera_settings, lighting_settings, default_room_data, global_environment 
       FROM master_designs 
       WHERE id = $1 LIMIT 1`,
      [id]
    );

    if (result.rows.length > 0) {
      return NextResponse.json(result.rows[0]);
    }

    // Fallback template defaults if not present in DB
    const fallbackTemplates: Record<string, any> = {
      tmpl_hostel_lux: {
        id: "tmpl_hostel_lux",
        title: "Luxury Self-Con Room",
        model_url: "/models/selfcon.glb",
        default_room_data: {
          wallColors: { wallFront: "#C4B199", wallBack: "#C4B199", wallLeft: "#C4B199", wallRight: "#C4B199", toilet: "#C4B199", ceiling: "#FFFFFF" },
          wallFinishes: { wallFront: "EMULSION", wallBack: "EMULSION", wallLeft: "EMULSION", wallRight: "EMULSION", toilet: "EMULSION" },
          floorTexture: "floor_oak",
        },
        lighting_settings: [
          {
            id: "bulb_1",
            type: "point",
            color: "#fffaed",
            intensity: 10,
            position: [-1.8, 2.7, 0.2],
            visible: true,
          },
        ],
        camera_settings: {
          position: [0, 1.8, 4.5],
          target: [0, 1.2, 0],
        },
      },
    };

    if (fallbackTemplates[id]) {
      return NextResponse.json(fallbackTemplates[id]);
    }

    return NextResponse.json({ error: "Master room template configuration not found." }, { status: 404 });
  } catch (err: any) {
    console.error("💥 Failed to resolve catalog template parameters from Neon Database:", err.message);
    return NextResponse.json({ error: "Database read failure", details: err.message }, { status: 500 });
  }
}

/**
 * DELETE /api/visualizations/catalog/[id]
 * Deletes a master design template from Neon PostgreSQL Database catalog.
 */
export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    if (!id) {
      return NextResponse.json({ error: "Missing template ID" }, { status: 400 });
    }

    const client = getPool();
    await client.query("DELETE FROM master_designs WHERE id = $1", [id]);

    return NextResponse.json({ success: true, message: "Template deleted successfully from catalog." });
  } catch (err: any) {
    console.error("💥 Failed to delete catalog template from Neon Database:", err.message);
    return NextResponse.json({ error: "Database delete failure", details: err.message }, { status: 500 });
  }
}
