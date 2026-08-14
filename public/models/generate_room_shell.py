import bpy
import bmesh
import math

def build_paintit_spacious_room_shell():
    """
    PaintIt Studio Automated 3D Room Shell Generator for Blender
    Generates a 6.0m x 5.0m x 3.0m room with window cutout, POP cove ceiling, and PBR material slots.
    """
    # 1. Clear existing mesh objects in current scene
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    # 2. Dimensions & Materials Definition
    ROOM_WIDTH = 6.0   # X-axis
    ROOM_DEPTH = 5.0   # Y-axis
    ROOM_HEIGHT = 3.0  # Z-axis
    WALL_THICKNESS = 0.15

    # Create Material Helper
    def create_material(name, color_hex, roughness=0.5, metallic=0.0, emission_strength=0.0):
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        principled = nodes.get("Principled BSDF")
        
        # Convert Hex to RGB
        hex_clean = color_hex.lstrip('#')
        r = int(hex_clean[0:2], 16) / 255.0
        g = int(hex_clean[2:4], 16) / 255.0
        b = int(hex_clean[4:6], 16) / 255.0
        
        if principled:
            principled.inputs['Base Color'].default_value = (r, g, b, 1.0)
            principled.inputs['Roughness'].default_value = roughness
            principled.inputs['Metallic'].default_value = metallic
            if emission_strength > 0:
                if 'Emission Color' in principled.inputs:
                    principled.inputs['Emission Color'].default_value = (r, g, b, 1.0)
                    principled.inputs['Emission Strength'].default_value = emission_strength
        return mat

    mat_floor = create_material("floor", "#8B5A2B", roughness=0.3)
    mat_ceiling = create_material("ceiling", "#FFFFFF", roughness=0.9)
    mat_wall_front = create_material("wallFront", "#C4B199", roughness=0.85)
    mat_wall_left = create_material("wallLeft", "#C4B199", roughness=0.85)
    mat_wall_right = create_material("wallRight", "#C4B199", roughness=0.85)
    mat_wall_back = create_material("wallBack", "#C4B199", roughness=0.85)
    mat_led = create_material("led_cove_glow", "#FFF3E0", roughness=0.1, emission_strength=12.0)
    mat_window_frame = create_material("window_frame", "#1A1A1C", roughness=0.2, metallic=0.8)

    # Helper: Add Box Mesh with UVs
    def add_mesh_box(name, location, size, material):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=location)
        obj = bpy.context.active_object
        obj.name = name
        obj.scale = size
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        if material:
            obj.data.materials.append(material)
        return obj

    # 3. Build Floor Mesh
    floor_obj = add_mesh_box("floor", (0, 0, 0), (ROOM_WIDTH, ROOM_DEPTH, 0.05), mat_floor)

    # 4. Build Main POP Ceiling Mesh
    ceiling_obj = add_mesh_box("ceiling", (0, 0, ROOM_HEIGHT), (ROOM_WIDTH, ROOM_DEPTH, 0.05), mat_ceiling)

    # Build Recessed LED Cove Lighting Strip Frame
    cove_frame = add_mesh_box("pop_cove_frame", (0, 0, ROOM_HEIGHT - 0.15), (ROOM_WIDTH - 0.8, ROOM_DEPTH - 0.8, 0.04), mat_ceiling)
    cove_led = add_mesh_box("led_strip_light", (0, 0, ROOM_HEIGHT - 0.13), (ROOM_WIDTH - 0.75, ROOM_DEPTH - 0.75, 0.02), mat_led)

    # 5. Build Wall Shells
    # Front Wall (Z=1.5m, Y=+2.5m)
    wall_front = add_mesh_box("wallFront", (0, ROOM_DEPTH/2, ROOM_HEIGHT/2), (ROOM_WIDTH, WALL_THICKNESS, ROOM_HEIGHT), mat_wall_front)

    # Back Wall (Z=1.5m, Y=-2.5m)
    wall_back = add_mesh_box("wallBack", (0, -ROOM_DEPTH/2, ROOM_HEIGHT/2), (ROOM_WIDTH, WALL_THICKNESS, ROOM_HEIGHT), mat_wall_back)

    # Right Wall (Z=1.5m, X=+3.0m)
    wall_right = add_mesh_box("wallRight", (ROOM_WIDTH/2, 0, ROOM_HEIGHT/2), (WALL_THICKNESS, ROOM_DEPTH, ROOM_HEIGHT), mat_wall_right)

    # Left Wall with French Window Cutout (X=-3.0m)
    # Split left wall into bottom, top, and side pillars to leave a clean 2.4m x 2.0m window cutout
    WIN_WIDTH = 2.4
    WIN_HEIGHT = 2.0
    WIN_BOTTOM_OFFSET = 0.5
    
    # Left Wall Bottom Panel
    wall_left_bottom = add_mesh_box("wallLeft_bottom", (-ROOM_WIDTH/2, 0, WIN_BOTTOM_OFFSET/2), (WALL_THICKNESS, WIN_WIDTH, WIN_BOTTOM_OFFSET), mat_wall_left)
    # Left Wall Top Panel
    wall_left_top = add_mesh_box("wallLeft_top", (-ROOM_WIDTH/2, 0, WIN_BOTTOM_OFFSET + WIN_HEIGHT + (ROOM_HEIGHT - WIN_BOTTOM_OFFSET - WIN_HEIGHT)/2), (WALL_THICKNESS, WIN_WIDTH, ROOM_HEIGHT - WIN_BOTTOM_OFFSET - WIN_HEIGHT), mat_wall_left)
    # Left Wall Side Pillar A
    wall_left_side_a = add_mesh_box("wallLeft_sideA", (-ROOM_WIDTH/2, (ROOM_DEPTH/2 + WIN_WIDTH/2)/2, ROOM_HEIGHT/2), (WALL_THICKNESS, (ROOM_DEPTH - WIN_WIDTH)/2, ROOM_HEIGHT), mat_wall_left)
    # Left Wall Side Pillar B
    wall_left_side_b = add_mesh_box("wallLeft_sideB", (-ROOM_WIDTH/2, -(ROOM_DEPTH/2 + WIN_WIDTH/2)/2, ROOM_HEIGHT/2), (WALL_THICKNESS, (ROOM_DEPTH - WIN_WIDTH)/2, ROOM_HEIGHT), mat_wall_left)

    # Join Left Wall Parts into single object "wallLeft"
    bpy.ops.object.select_all(action='DESELECT')
    for obj in [wall_left_bottom, wall_left_top, wall_left_side_a, wall_left_side_b]:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = wall_left_bottom
    bpy.ops.object.join()
    wall_left_bottom.name = "wallLeft"

    # Add Modern Black Metal Window Trim Frame
    win_frame = add_mesh_box("window_frame", (-ROOM_WIDTH/2, 0, WIN_BOTTOM_OFFSET + WIN_HEIGHT/2), (WALL_THICKNESS * 1.2, WIN_WIDTH, WIN_HEIGHT), mat_window_frame)

    # 6. Apply Subtle Edge Bevel to All Objects for Realism
    for obj in [floor_obj, ceiling_obj, wall_front, wall_back, wall_right, wall_left_bottom]:
        bpy.context.view_layer.objects.active = obj
        bevel_mod = obj.modifiers.new(name="Bevel", type='BEVEL')
        bevel_mod.width = 0.005
        bevel_mod.segments = 3

    print("✅ PaintIt Studio Photorealistic Room Shell Script Executed Successfully!")

if __name__ == "__main__":
    build_paintit_spacious_room_shell()
