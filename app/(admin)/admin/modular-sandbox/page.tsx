'use client';

import React, { useState } from 'react';
import Link from 'next/link';

export default function ModularStudioSandboxPage() {
  const [selectedCategory, setSelectedCategory] = useState<'SHELLS' | 'SEATING' | 'TABLES' | 'STORAGE' | 'DECOR' | 'WALL_PANELS'>('SHELLS');
  const [snapMode, setSnapMode] = useState<'FLOOR' | 'WALL' | 'SURFACE'>('FLOOR');
  const [gridSnapEnabled, setGridSnapEnabled] = useState<boolean>(true);

  const sampleCatalog = [
    { id: 'shell_livingroom', name: 'Living Room Shell', category: 'SHELLS', path: '/models/shells/livingroom_shell.glb', tag: 'Empty Shell' },
    { id: 'shell_selfcon', name: 'Self-Con Studio Shell', category: 'SHELLS', path: '/models/shells/selfcon_shell.glb', tag: 'Empty Shell' },
    { id: 'seating_sofa_nordic', name: 'Nordic 3-Seater Sofa', category: 'SEATING', path: '/models/assets/seating/sofa_nordic.glb', tag: 'Floor Anchor' },
    { id: 'table_oak_coffee', name: 'Oak Coffee Table', category: 'TABLES', path: '/models/assets/tables/table_oak.glb', tag: 'Floor Anchor' },
    { id: 'decor_art_abstract', name: 'Abstract Canvas Art', category: 'DECOR', path: '/models/assets/decor/art_abstract.glb', tag: 'Wall Anchor' },
    { id: 'panel_3d_geo', name: '3D Geometric Wall Panel', category: 'WALL_PANELS', path: '/models/assets/wall_panels/panel_3d.glb', tag: 'Wall Anchor' }
  ];

  const filteredAssets = sampleCatalog.filter((item) => item.category === selectedCategory);

  return (
    <div className="min-h-screen w-full bg-neutral-950 text-white font-sans flex flex-col overflow-hidden select-none">
      {/* Header Bar */}
      <header className="w-full bg-neutral-900/90 border-b border-neutral-800 px-6 py-3.5 flex items-center justify-between z-30 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <Link
            href="/admin/playground/8bf49d75-5de9-42b6-946a-28d2875b5e5a"
            className="px-3 py-1.5 bg-neutral-800 hover:bg-neutral-700 text-neutral-300 rounded-xl text-xs font-bold transition-all"
          >
            ← Back to Active Studio
          </Link>
          <div className="h-4 w-px bg-neutral-800" />
          <h1 className="text-sm font-black uppercase tracking-wider text-emerald-400">
            🧪 PaintIt Modular Component Sandbox (v2 Test Ground)
          </h1>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setGridSnapEnabled(!gridSnapEnabled)}
            className={`px-3 py-1.5 text-xs font-bold rounded-xl border transition-all ${
              gridSnapEnabled
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                : 'bg-neutral-900 border-neutral-800 text-neutral-500'
            }`}
          >
            🧲 Grid Snap: {gridSnapEnabled ? '0.25m ON' : 'OFF'}
          </button>
        </div>
      </header>

      {/* Main Workspace Body */}
      <div className="flex-1 flex relative overflow-hidden">
        {/* Left Side: Modular Asset Catalog Drawer */}
        <aside className="w-80 bg-neutral-900/80 border-r border-neutral-800 p-4 flex flex-col gap-4 z-20 backdrop-blur-lg">
          <div>
            <h2 className="text-xs font-black uppercase tracking-wider text-neutral-200">Asset Catalog Library</h2>
            <p className="text-[11px] text-neutral-400 mt-0.5">
              Select component category to preview modular GLB placement & material properties.
            </p>
          </div>

          {/* Category Tabs */}
          <div className="grid grid-cols-3 gap-1.5 p-1 bg-neutral-950 rounded-xl border border-neutral-850">
            {(['SHELLS', 'SEATING', 'TABLES', 'STORAGE', 'DECOR', 'WALL_PANELS'] as const).map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`py-1.5 px-2 text-[10px] font-black uppercase tracking-wider rounded-lg transition-all ${
                  selectedCategory === cat
                    ? 'bg-emerald-500 text-neutral-950 font-extrabold shadow-md'
                    : 'text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {cat.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Asset List */}
          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filteredAssets.map((asset) => (
              <div
                key={asset.id}
                className="p-3 bg-neutral-950/70 border border-neutral-800 hover:border-emerald-500/50 rounded-2xl transition-all cursor-pointer group"
              >
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold text-neutral-200 group-hover:text-emerald-400 transition-colors">
                    {asset.name}
                  </h3>
                  <span className="text-[9px] font-mono font-bold uppercase tracking-wider px-2 py-0.5 rounded-md bg-neutral-800 text-neutral-400">
                    {asset.tag}
                  </span>
                </div>
                <p className="text-[10px] font-mono text-neutral-500 mt-1 truncate">{asset.path}</p>
              </div>
            ))}

            {filteredAssets.length === 0 && (
              <div className="p-6 text-center border border-dashed border-neutral-800 rounded-2xl">
                <span className="text-xs text-neutral-500 font-medium">
                  Export GLB models to <code className="text-emerald-400 font-mono">public/models/assets/</code> to see them populate here!
                </span>
              </div>
            )}
          </div>
        </aside>

        {/* Center: Test Canvas Viewport Area */}
        <main className="flex-1 bg-neutral-950 relative flex flex-col items-center justify-center p-8">
          <div className="max-w-xl text-center space-y-4 p-8 bg-neutral-900/50 border border-neutral-800 rounded-3xl backdrop-blur-xl shadow-2xl">
            <div className="w-14 h-14 mx-auto rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 text-2xl font-bold">
              🏗️
            </div>
            <div className="space-y-1">
              <h2 className="text-base font-black uppercase tracking-wider text-neutral-100">
                Modular 3D Test-Ground Environment Ready
              </h2>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Your sandbox foundation is active! This isolated environment allows you to test modular room shells, smart snapping, and catalog assets without affecting your active production visualizer canvas.
              </p>
            </div>

            <div className="p-4 bg-neutral-950 rounded-2xl border border-neutral-800 text-left space-y-2">
              <div className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider flex items-center gap-2">
                <span>📁 Standardized Asset Locations:</span>
              </div>
              <ul className="text-[11px] font-mono text-neutral-400 space-y-1 pl-4 list-disc">
                <li><span className="text-emerald-400">Room Shells:</span> public/models/shells/*.glb</li>
                <li><span className="text-emerald-400">Seating:</span> public/models/assets/seating/*.glb</li>
                <li><span className="text-emerald-400">Tables:</span> public/models/assets/tables/*.glb</li>
                <li><span className="text-emerald-400">Decor:</span> public/models/assets/decor/*.glb</li>
                <li><span className="text-emerald-400">Wall Panels:</span> public/models/assets/wall_panels/*.glb</li>
              </ul>
            </div>

            <div className="pt-2 flex items-center justify-center gap-3">
              <a
                href="/docs/BLENDER_MODELING_GUIDE.md"
                target="_blank"
                className="px-4 py-2 bg-emerald-500 text-neutral-950 hover:bg-emerald-400 text-xs font-black uppercase tracking-wider rounded-xl shadow-lg transition-transform active:scale-95"
              >
                View Blender Modeling Spec Guide 📖
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
