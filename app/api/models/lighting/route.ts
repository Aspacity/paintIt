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
 * GET /api/models/lighting?model_url=...
 * Resolves saved lightbulbs & sun configuration for a 3D room model from Neon Database.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const modelUrl = searchParams.get("model_url");

    if (!modelUrl) {
      return NextResponse.json({ error: "Missing model_url query parameter." }, { status: 400 });
    }

    const client = getPool();

    // 1. Check model_lighting_configs table first
    const configRes = await client.query(
      `SELECT model_url, sun_azimuth, sun_elevation, sun_intensity, ambient_intensity, time_of_day, bulbs, camera_settings 
       FROM model_lighting_configs 
       WHERE model_url = $1 LIMIT 1`,
      [modelUrl]
    );

    if (configRes.rows.length > 0) {
      const row = configRes.rows[0];
      return NextResponse.json({
        modelUrl: row.model_url,
        sunAzimuth: Number(row.sun_azimuth),
        sunElevation: Number(row.sun_elevation),
        sunIntensity: Number(row.sun_intensity),
        ambientIntensity: Number(row.ambient_intensity),
        timeOfDay: row.time_of_day,
        bulbs: row.bulbs || [],
        cameraSettings: row.camera_settings || null,
      });
    }

    // 2. Fallback check in master_designs table by model_url
    const designRes = await client.query(
      `SELECT id, title, model_url, lighting_settings, camera_settings, global_environment 
       FROM master_designs 
       WHERE model_url = $1 LIMIT 1`,
      [modelUrl]
    );

    if (designRes.rows.length > 0) {
      const design = designRes.rows[0];
      const lightingSettings = design.lighting_settings || [];
      const env = design.global_environment || {};

      return NextResponse.json({
        modelUrl: design.model_url,
        sunAzimuth: env.sunAzimuth || 135,
        sunElevation: env.sunElevation || 35,
        sunIntensity: env.sunIntensity || 2.8,
        ambientIntensity: env.ambientIntensity || 0.65,
        timeOfDay: env.timeOfDay || "morning",
        bulbs: Array.isArray(lightingSettings) ? lightingSettings : [],
        cameraSettings: design.camera_settings || null,
      });
    }

    return NextResponse.json({ bulbs: [], cameraSettings: null }, { status: 200 });
  } catch (err: any) {
    console.error("💥 Failed to fetch model lighting from database:", err.message);
    return NextResponse.json({ error: "Database read failure", details: err.message }, { status: 500 });
  }
}

/**
 * POST /api/models/lighting
 * Saves/Updates 3D model lightbulb positions, colors, intensities, sun, and camera settings globally in Neon Database.
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { modelUrl, sunAzimuth, sunElevation, sunIntensity, ambientIntensity, timeOfDay, bulbs, cameraSettings } = body;

    if (!modelUrl) {
      return NextResponse.json({ error: "Missing modelUrl parameter." }, { status: 400 });
    }

    const client = getPool();

    const azimuth = sunAzimuth ?? 135;
    const elevation = sunElevation ?? 35;
    const sIntensity = sunIntensity ?? 2.8;
    const aIntensity = ambientIntensity ?? 0.65;
    const tod = timeOfDay || "morning";
    const bulbsJson = JSON.stringify(bulbs || []);
    const cameraJson = JSON.stringify(cameraSettings || {});

    // 0. Ensure table exists with PRIMARY KEY (model_url)
    await client.query(`
      CREATE TABLE IF NOT EXISTS model_lighting_configs (
        model_url TEXT PRIMARY KEY,
        sun_azimuth NUMERIC DEFAULT 135,
        sun_elevation NUMERIC DEFAULT 35,
        sun_intensity NUMERIC DEFAULT 2.8,
        ambient_intensity NUMERIC DEFAULT 0.65,
        time_of_day TEXT DEFAULT 'morning',
        bulbs JSONB DEFAULT '[]'::jsonb,
        camera_settings JSONB DEFAULT '{}'::jsonb,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
      ALTER TABLE model_lighting_configs ADD COLUMN IF NOT EXISTS camera_settings JSONB DEFAULT '{}'::jsonb;
    `);

    // 1. Upsert into model_lighting_configs table
    await client.query(
      `INSERT INTO model_lighting_configs (model_url, sun_azimuth, sun_elevation, sun_intensity, ambient_intensity, time_of_day, bulbs, camera_settings, updated_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7::jsonb, $8::jsonb, NOW())
       ON CONFLICT (model_url) DO UPDATE SET
         sun_azimuth = EXCLUDED.sun_azimuth,
         sun_elevation = EXCLUDED.sun_elevation,
         sun_intensity = EXCLUDED.sun_intensity,
         ambient_intensity = EXCLUDED.ambient_intensity,
         time_of_day = EXCLUDED.time_of_day,
         bulbs = EXCLUDED.bulbs,
         camera_settings = EXCLUDED.camera_settings,
         updated_at = NOW()`,
      [modelUrl, azimuth, elevation, sIntensity, aIntensity, tod, bulbsJson, cameraJson]
    );

    // 2. Sync to master_designs table if a matching model_url design exists
    await client.query(
      `UPDATE master_designs 
       SET lighting_settings = $1::jsonb, 
           camera_settings = $8::jsonb,
           global_environment = JSONB_BUILD_OBJECT(
             'sunAzimuth', $2::numeric,
             'sunElevation', $3::numeric,
             'sunIntensity', $4::numeric,
             'ambientIntensity', $5::numeric,
             'timeOfDay', $6::text
           ),
           updated_at = NOW()
       WHERE model_url = $7`,
      [bulbsJson, azimuth, elevation, sIntensity, aIntensity, tod, modelUrl, cameraJson]
    );

    return NextResponse.json({ success: true, message: "Lightbulb configuration saved globally to database." }, { status: 200 });
  } catch (err: any) {
    console.error("💥 Failed to save model lighting to database:", err.message);
    return NextResponse.json({ error: "Database write failure", details: err.message }, { status: 500 });
  }
}
