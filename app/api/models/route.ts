import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

function getGlbFilesRecursively(dir: string, baseDir: string = dir): string[] {
  let results: string[] = [];
  if (!fs.existsSync(dir)) return results;

  const items = fs.readdirSync(dir, { withFileTypes: true });

  for (const item of items) {
    const fullPath = path.join(dir, item.name);
    if (item.isDirectory()) {
      results = results.concat(getGlbFilesRecursively(fullPath, baseDir));
    } else if (item.isFile() && item.name.toLowerCase().endsWith('.glb')) {
      // Relative path from public/models (e.g. "shells/livingroom-shell(window).glb" or "selfcon.glb")
      const relativePath = path.relative(baseDir, fullPath).replace(/\\/g, '/');
      results.push(relativePath);
    }
  }

  return results;
}

export async function GET() {
  try {
    const modelsPath = path.join(process.cwd(), 'public', 'models');
    const glbFiles = getGlbFilesRecursively(modelsPath);

    return NextResponse.json({ models: glbFiles });
  } catch (error) {
    console.error('Failed listing GLB models:', error);
    return NextResponse.json({ models: [] }, { status: 500 });
  }
}
