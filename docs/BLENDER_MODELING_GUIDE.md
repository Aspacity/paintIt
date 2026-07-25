# 🎨 PaintIt Studio - Blender Modeling & Export Specification Guide

This guide defines the exact rules, naming conventions, origin placement protocols, and GLTF export settings for building **Modular 3D Room Shells** and **Furniture/Decor Components** for PaintIt.

Following these specifications ensures that PaintIt's WebGL engine automatically detects **100% of your materials, sub-parts, and light sources** and snaps furniture accurately to floors and walls.

---

## 📁 1. Directory File Structure

All 3D `.glb` assets in your project must be placed into their designated categories under `frontend/public/models/`:

```text
public/models/
├── shells/                       # Empty Room Shells
│   ├── selfcon_shell.glb
│   └── livingroom_shell.glb
│
└── assets/                       # Modular Components & Decor
    ├── seating/                  # Sofas, armchairs, dining chairs, stools
    │   └── sofa_modern_nordic.glb
    ├── tables/                   # Coffee tables, dining tables, desks
    │   └── table_coffee_oak.glb
    ├── storage/                  # Wardrobes, drawers, TV consoles
    │   └── tv_console_minimal.glb
    ├── decor/                    # Vases, wall art, lamps, rugs, books
    │   ├── vase_ceramic_abstract.glb
    │   └── art_canvas_modern.glb
    └── wall_panels/              # 3D Wall Panels & acoustic tiles
        └── panel_3d_geometric.glb
```

---

## 🎯 2. Origin Placement `[0, 0, 0]` Rules (For Automatic Snapping)

Setting the origin `[0, 0, 0]` correctly in Blender is **CRITICAL** for automatic floor and wall snapping in PaintIt:

### A. Floor Furniture (Sofas, Tables, Beds, Wardrobes, Rugs)
* **Origin Location**: Set to the exact **bottom-center** of the object (`Z = 0` in Blender / `Y = 0` in Three.js).
* **Why**: When imported or dragged in PaintIt, the object will automatically snap flush to the room floor without floating or clipping!
* **Blender Step**: Select object ➔ `Object ➔ Set Origin ➔ Origin to 3D Cursor` (placed at bottom center).

### B. Wall Items (3D Wall Panels, Paintings, TVs, Floating Shelves, Sconces)
* **Origin Location**: Set to the **back-center** flush with the rear surface of the object.
* **Why**: PaintIt raycasts against wall meshes and snaps the back of the object flush against the wall.

### C. Tabletop Decor (Vases, Lamps, Bowls, Books)
* **Origin Location**: Set to the **bottom-center** of the base.
* **Why**: Allows decorating tables by snapping items directly onto tabletop bounding boxes.

---

## 🏷️ 3. Sub-Mesh & Material Naming Conventions

PaintIt's WebGL engine scans every sub-mesh and material slot in your GLB file. Naming them clearly enables automatic material swapping and UI labeling.

### A. Empty Room Shell Naming
Structure empty rooms with these exact mesh names:
* `wallFront`, `wallBack`, `wallLeft`, `wallRight` (Wall paint surfaces)
* `floor` (Flooring surface)
* `ceiling` (Ceiling paint surface)
* `doorFrame`, `windowFrame` (Trim & fixtures)

### B. Furniture Component Sub-Mesh Naming
Group sub-parts by material slot in the Blender Outliner:
* `Sofa_Cushion` (Cushion geometry)
* `Sofa_Frame` (Main frame geometry)
* `Sofa_Legs` (Legs geometry)
* `Table_Top` (Tabletop surface)
* `Table_Legs` (Table base/legs)

### C. Material Slot Naming Protocol
Name material slots descriptively in Blender's Material Properties tab:
* Fabrics: `Fabric_Velvet_Teal`, `Fabric_Linen_Beige`
* Woods: `Wood_Oak_Natural`, `Wood_Walnut_Dark`
* Metals: `Metal_Brass_Gold`, `Metal_Steel_Black`
* Stones/Ceramics: `Marble_Carrara_White`, `Ceramic_Matte_White`
* Paints: `Paint_Wall_Eggshell`, `Paint_Accent_Gold`

> [!TIP]
> **100% Material Extraction Guarantee**: PaintIt automatically reads all material slot names from your GLB file. If a sofa has 3 material slots (`Fabric_Teal`, `Wood_Walnut`, `Brass_Gold`), all 3 will instantly appear in the PaintIt material swapper palette!

---

## 💡 4. Blender Punctual Light Setup

If your model includes light fixtures (e.g., floor lamps, ceiling lights, wall sconces):
1. Add a **Point Light** or **Spot Light** inside Blender.
2. In Blender's Light Properties, set color and intensity.
3. Position the light inside or directly under the lamp shade object.
4. On GLTF export, enable **Punctual Lights** (see below). PaintIt will automatically detect the light node, enable WebGL shadow maps, and make it illuminate the room!

---

## ⚙️ 5. Recommended Blender GLTF Export Settings

In Blender, go to **File ➔ Export ➔ glTF 2.0 (.glb)**:

| Category | Setting | Recommendation |
| :--- | :--- | :--- |
| **Format** | Format | `glTF Binary (.glb)` |
| **Include** | Limit to Selected | Enabled (when exporting single asset) |
| **Include** | Punctual Lights | **[✓] Enabled** |
| **Transform** | +Y Up | **[✓] Enabled** (Standard WebGL orientation) |
| **Geometry** | Draco Mesh Compression | **[✓] Enabled** (Reduces file size by 60%–80%) |
| **Material** | Export | `Export` (PBR Metallic Roughness) |
| **Material** | Images | `Automatic` or `WebP` |

---

## 🛠️ 6. Quick Checklist Before Exporting
- [ ] Origin point `[0,0,0]` set at bottom-center (for floor items) or back-center (for wall items).
- [ ] Sub-meshes and material slots given clear descriptive names.
- [ ] Scale applied in Blender (`Ctrl + A ➔ Apply Scale`).
- [ ] Draco Mesh Compression enabled in export settings.
