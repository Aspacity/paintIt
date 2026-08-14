import bpy
import bmesh
import math

def build_paintit_master_architectural_shell():
    """
    PaintIt Studio Production-Ready Architectural Master Room Shell Generator
    Generates an 8.0m x 6.5m x 3.2m spacious empty interior room shell with:
    - 4 thick walls with window and door cutouts
    - Light Oak PBR Floor & Baseboards
    - 5 Modular Swappable Ceiling Systems (Flat, Tray, POP, Cove, Linear)
    - Realistic Window Frames, Glass Panes, and Cloth Curtains
    - Architectural Doors and Door Frames
    - Recessed Ceiling Downlights & LED Cove Emission Strips
    """
    # 1. Clear Existing Scene Objects
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete(use_global=False)

    # 2. Dimensions & Scale Standards (Real-World Metric Meters)
    ROOM_WIDTH = 8.0   # X-Axis
    ROOM_DEPTH = 6.5   # Y-Axis
    ROOM_HEIGHT = 3.2  # Z-Axis (Floor to Ceiling)
    WALL_THICKNESS = 0.20 # 20cm thick architectural walls

    # Material Generator Helper
    def create_pbr_material(name, color_hex, roughness=0.5, metallic=0.0, alpha=1.0, emission_strength=0.0):
        mat = bpy.data.materials.new(name=name)
        mat.use_nodes = True
        nodes = mat.node_tree.nodes
        principled = nodes.get("Principled BSDF")

        # Convert Hex to Normalized RGB
        hex_clean = color_hex.lstrip('#')
        r = int(hex_clean[0:2], 16) / 255.0
        g = int(hex_clean[2:4], 16) / 255.0
        b = int(hex_clean[4:6], 16) / 255.0

        if principled:
            principled.inputs['Base Color'].default_value = (r, g, b, alpha)
            principled.inputs['Roughness'].default_value = roughness
            principled.inputs['Metallic'].default_value = metallic

            if alpha < 1.0:
                mat.blend_method = 'BLEND'
                if 'Alpha' in principled.inputs:
                    principled.inputs['Alpha'].default_value = alpha

            if emission_strength > 0:
                if 'Emission Color' in principled.inputs:
                    principled.inputs['Emission Color'].default_value = (r, g, b, 1.0)
                    principled.inputs['Emission Strength'].default_value = emission_strength

        return mat

    # Create Material Catalog
    mat_wall_front = create_pbr_material("wallFront", "#C4B199", roughness=0.85)
    mat_wall_left  = create_pbr_material("wallLeft", "#C4B199", roughness=0.85)
    mat_wall_right = create_pbr_material("wallRight", "#C4B199", roughness=0.85)
    mat_wall_back  = create_pbr_material("wallBack", "#C4B199", roughness=0.85)

    mat_floor      = create_pbr_material("Room_Floor", "#A67C52", roughness=0.35, metallic=0.02)
    mat_baseboard  = create_pbr_material("Baseboards", "#F5F3EF", roughness=0.4)

    mat_ceiling    = create_pbr_material("Room_Ceiling_Mat", "#FAFAFA", roughness=0.9)
    mat_window_frame = create_pbr_material("Window_Frames", "#1E1E22", roughness=0.25, metallic=0.8)
    mat_glass      = create_pbr_material("Glass", "#E6F0FA", roughness=0.05, metallic=0.9, alpha=0.2)
    mat_curtain    = create_pbr_material("Curtains", "#EAE7E1", roughness=0.8)
    mat_door       = create_pbr_material("Doors", "#3A2A20", roughness=0.4)
    mat_door_frame = create_pbr_material("Door_Frames", "#211812", roughness=0.3)
    mat_led_glow   = create_pbr_material("Ceiling_Lights", "#FFF8EF", roughness=0.1, emission_strength=14.0)

    # Box Mesh Helper
    def create_box(name, location, scale, material=None):
        bpy.ops.mesh.primitive_cube_add(size=1.0, location=location)
        obj = bpy.context.active_object
        obj.name = name
        obj.scale = scale
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        if material:
            obj.data.materials.append(material)
        return obj

    # 3. Create Main Floor & Baseboards
    floor_obj = create_box("Room_Floor", (0, 0, 0), (ROOM_WIDTH, ROOM_DEPTH, 0.05), mat_floor)

    # Baseboards Around Perimeter
    create_box("Baseboard_Front", (0, ROOM_DEPTH/2 - 0.02, 0.06), (ROOM_WIDTH - 0.1, 0.02, 0.12), mat_baseboard)
    create_box("Baseboard_Back",  (0, -ROOM_DEPTH/2 + 0.02, 0.06), (ROOM_WIDTH - 0.1, 0.02, 0.12), mat_baseboard)
    create_box("Baseboard_Right", (ROOM_WIDTH/2 - 0.02, 0, 0.06), (0.02, ROOM_DEPTH - 0.1, 0.12), mat_baseboard)
    create_box("Baseboard_Left",  (-ROOM_WIDTH/2 + 0.02, 0, 0.06), (0.02, ROOM_DEPTH - 0.1, 0.12), mat_baseboard)

    # 4. Construct Walls with Real Door and Window Openings
    # Front Wall (Z=1.6m, Y=+3.25m) with Large Panoramic Window Cutout (3.0m x 2.2m)
    w_front_left  = create_box("wallFront_L", (-2.6, ROOM_DEPTH/2, ROOM_HEIGHT/2), (2.8, WALL_THICKNESS, ROOM_HEIGHT), mat_wall_front)
    w_front_right = create_box("wallFront_R", (2.6, ROOM_DEPTH/2, ROOM_HEIGHT/2), (2.8, WALL_THICKNESS, ROOM_HEIGHT), mat_wall_front)
    w_front_bot   = create_box("wallFront_B", (0, ROOM_DEPTH/2, 0.25), (3.0, WALL_THICKNESS, 0.5), mat_wall_front)
    w_front_top   = create_box("wallFront_T", (0, ROOM_DEPTH/2, 2.95), (3.0, WALL_THICKNESS, 0.5), mat_wall_front)

    # Left Wall (X=-4.0m) with Side Architectural Window (2.2m x 2.0m)
    w_left_front  = create_box("wallLeft_F", (-ROOM_WIDTH/2, 2.0, ROOM_HEIGHT/2), (WALL_THICKNESS, 2.5, ROOM_HEIGHT), mat_wall_left)
    w_left_back   = create_box("wallLeft_B", (-ROOM_WIDTH/2, -2.0, ROOM_HEIGHT/2), (WALL_THICKNESS, 2.5, ROOM_HEIGHT), mat_wall_left)
    w_left_bot    = create_box("wallLeft_Bot", (-ROOM_WIDTH/2, 0, 0.3), (WALL_THICKNESS, 2.2, 0.6), mat_wall_left)
    w_left_top    = create_box("wallLeft_Top", (-ROOM_WIDTH/2, 0, 2.9), (WALL_THICKNESS, 2.2, 0.6), mat_wall_left)

    # Back Wall (Y=-3.25m) with Main Interior Entrance Door Cutout (2.1m x 1.0m)
    w_back_left   = create_box("wallBack_L", (-2.2, -ROOM_DEPTH/2, ROOM_HEIGHT/2), (3.6, WALL_THICKNESS, ROOM_HEIGHT), mat_wall_back)
    w_back_right  = create_box("wallBack_R", (2.2, -ROOM_DEPTH/2, ROOM_HEIGHT/2), (3.6, WALL_THICKNESS, ROOM_HEIGHT), mat_wall_back)
    w_back_top    = create_box("wallBack_T", (0, -ROOM_DEPTH/2, 2.65), (1.0, WALL_THICKNESS, 1.1), mat_wall_back)

    # Right Wall (X=+4.0m) Solid Wall
    w_right       = create_box("wallRight", (ROOM_WIDTH/2, 0, ROOM_HEIGHT/2), (WALL_THICKNESS, ROOM_DEPTH, ROOM_HEIGHT), mat_wall_right)

    # Group Wall Objects into Room_Walls
    bpy.ops.object.select_all(action='DESELECT')
    wall_objs = [w_front_left, w_front_right, w_front_bot, w_front_top, w_left_front, w_left_back, w_left_bot, w_left_top, w_back_left, w_back_right, w_back_top, w_right]
    for obj in wall_objs:
        obj.select_set(True)
    bpy.context.view_layer.objects.active = w_front_left
    bpy.ops.object.join()
    w_front_left.name = "Room_Walls"

    # 5. Build Architectural Windows, Frames, Glass, & Curtains
    # Window 1: Panoramic Front Window
    create_box("Window_Frames_Front", (0, ROOM_DEPTH/2, 1.6), (3.05, WALL_THICKNESS * 1.1, 2.25), mat_window_frame)
    create_box("Glass_Front", (0, ROOM_DEPTH/2, 1.6), (2.95, 0.02, 2.15), mat_glass)

    # Curtains for Front Window
    create_box("Curtains_Front_L", (-1.6, ROOM_DEPTH/2 - 0.2, 1.6), (0.4, 0.15, 2.8), mat_curtain)
    create_box("Curtains_Front_R", (1.6, ROOM_DEPTH/2 - 0.2, 1.6), (0.4, 0.15, 2.8), mat_curtain)

    # Window 2: Side Left Window
    create_box("Window_Frames_Left", (-ROOM_WIDTH/2, 0, 1.6), (WALL_THICKNESS * 1.1, 2.25, 2.05), mat_window_frame)
    create_box("Glass_Left", (-ROOM_WIDTH/2, 0, 1.6), (0.02, 2.15, 1.95), mat_glass)

    # Curtains for Left Window
    create_box("Curtains_Left_F", (-ROOM_WIDTH/2 + 0.2, 1.2, 1.6), (0.15, 0.4, 2.8), mat_curtain)
    create_box("Curtains_Left_B", (-ROOM_WIDTH/2 + 0.2, -1.2, 1.6), (0.15, 0.4, 2.8), mat_curtain)

    # 6. Build Architectural Doors & Door Frames
    create_box("Door_Frames_Back", (0, -ROOM_DEPTH/2, 1.05), (1.08, WALL_THICKNESS * 1.15, 2.15), mat_door_frame)
    create_box("Doors_Back_Panel", (0, -ROOM_DEPTH/2, 1.05), (0.96, 0.06, 2.08), mat_door)

    # 7. Create 5 MODULAR CEILING SYSTEMS
    # Ceiling 01: Flat Modern Ceiling
    c_flat = create_box("Ceiling_FlatModern", (0, 0, ROOM_HEIGHT), (ROOM_WIDTH, ROOM_DEPTH, 0.06), mat_ceiling)

    # Ceiling 02: Simple Tray Ceiling
    c_tray = create_box("Ceiling_Tray", (0, 0, ROOM_HEIGHT), (ROOM_WIDTH, ROOM_DEPTH, 0.06), mat_ceiling)
    c_tray_inner = create_box("Ceiling_Tray_Recess", (0, 0, ROOM_HEIGHT + 0.1), (ROOM_WIDTH - 1.2, ROOM_DEPTH - 1.2, 0.04), mat_ceiling)

    # Ceiling 03: Modern POP Layered Ceiling
    c_pop = create_box("Ceiling_POP", (0, 0, ROOM_HEIGHT), (ROOM_WIDTH, ROOM_DEPTH, 0.06), mat_ceiling)
    c_pop_layer = create_box("Ceiling_POP_Layer", (0, 0, ROOM_HEIGHT - 0.08), (ROOM_WIDTH - 1.6, ROOM_DEPTH - 1.6, 0.04), mat_ceiling)

    # Ceiling 04: Luxury Cove Ceiling (With Indirect LED Cove Lighting Trough)
    c_cove = create_box("Ceiling_Cove", (0, 0, ROOM_HEIGHT), (ROOM_WIDTH, ROOM_DEPTH, 0.06), mat_ceiling)
    c_cove_trough = create_box("Ceiling_Cove_Trough", (0, 0, ROOM_HEIGHT - 0.12), (ROOM_WIDTH - 1.0, ROOM_DEPTH - 1.0, 0.04), mat_ceiling)
    c_cove_led = create_box("Cove_Lights_LED", (0, 0, ROOM_HEIGHT - 0.10), (ROOM_WIDTH - 0.95, ROOM_DEPTH - 0.95, 0.02), mat_led_glow)

    # Ceiling 05: Minimal Linear Architectural Ceiling
    c_linear = create_box("Ceiling_Linear", (0, 0, ROOM_HEIGHT), (ROOM_WIDTH, ROOM_DEPTH, 0.06), mat_ceiling)
    for i in range(-3, 4):
        create_box(f"Ceiling_Linear_Slat_{i}", (i * 0.9, 0, ROOM_HEIGHT - 0.03), (0.08, ROOM_DEPTH - 0.8, 0.03), mat_ceiling)

    # Recessed Ceiling Downlight Fixtures (Ceiling_Lights)
    downlight_positions = [
        (-2.5, 2.0), (0, 2.0), (2.5, 2.0),
        (-2.5, 0.0), (0, 0.0), (2.5, 0.0),
        (-2.5, -2.0), (0, -2.0), (2.5, -2.0)
    ]
    for idx, (dx, dy) in enumerate(downlight_positions):
        create_box(f"Ceiling_Lights_Spot_{idx}", (dx, dy, ROOM_HEIGHT - 0.02), (0.18, 0.18, 0.03), mat_led_glow)

    # 8. Apply 5mm Edge Bevel Modifier to All Architectural Meshes
    for obj in [w_front_left, floor_obj, c_flat, c_tray, c_pop, c_cove, c_linear]:
        if obj:
            bpy.context.view_layer.objects.active = obj
            bevel = obj.modifiers.new(name="Bevel", type='BEVEL')
            bevel.width = 0.005
            bevel.segments = 3

    print("🏆 PaintIt Studio Production-Ready Architectural Master Room Shell Script Executed Successfully!")

if __name__ == "__main__":
    build_paintit_master_architectural_shell()
