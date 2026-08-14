# 🎨 PaintIt Studio — Next-Gen 3D Architectural Spatial & Paint Visualizer

> **PROPRIETARY & CONFIDENTIAL SOFTWARE SYSTEM**  
> *Copyright © 2026 PaintIt Technologies Inc. All Rights Reserved.*

---

## ⛔ PROPRIETARY NOTICE & RESTRICTION WARNING

> [!CAUTION]
> **UNAUTHORIZED CLONING, FORKING, OR REPRODUCTION IS STRICTLY PROHIBITED.**  
> This repository contains trade secrets, proprietary algorithms, 3D procedural shader engines, and confidential business logic owned by **PaintIt Studio**. 
> 
> * **No Commercial Use**: You may not copy, reverse-engineer, decompile, mirror, adapt, or distribute any portion of this codebase.
> * **Intellectual Property Protection**: Access to this repository is restricted to authorized personnel and engineering partners only.

---

## 🌟 Executive Overview

**PaintIt Studio** is an enterprise 3D spatial design, architectural room assembly, and paint visualization platform. It empowers professional painters, interior designers, homeowners, and real estate developers to visualize real-world paint brand colors, surface finishes (**Emulsion**, **High Gloss**, and **Satin Sheen**), and 3D furniture arrangements in real-time 60FPS WebGL.

### 🔑 Core Capabilities

1. **🎨 3D Interactive Room Visualizer (`/workspace`)**:
   * Instant 3D wall selection with real-world paint catalog color matching.
   * Real-time physical material sheen surface rendering (**Emulsion / Soft Matte**, **Satin / Silk Sheen**, **Gloss / Reflective**).
   * High-resolution sRGB floor materials (Light Oak Hardwood, Carrara Marble, Parquet, Polished Concrete).

2. **🏢 Foyr-Grade Smart Auto-Cutaway Walls (`/admin/realism-test` & `/admin/modular-sandbox`)**:
   * Dynamic camera occlusion wall fading—walls blocking the viewer's line-of-sight automatically fade to 15% opacity when orbiting outside the room.
   * 5 Modular Swappable Ceiling Systems (**Flat Modern**, **Simple Tray**, **Modern POP Layered**, **Luxury Cove**, **Minimal Linear Slats**).
   * 1-Click 4K Supersampled Photo Render Snapshot capture.

3. **💬 WhatsApp Instant Deal-Closing Engine**:
   * 1-Tap WhatsApp status sharing and direct client proposal deep-links.
   * Painter sales inbox (`/gigs`) mapping client room color inquiries directly to painter WhatsApp DMs.

4. **🎛️ Master Admin Operations Hub (`/admin/dashboard`)**:
   * Role-based user feedback feed with star ratings, categories, and 1-click status resolution.
   * Real-time platform traffic metrics and catalog asset management.

---

## 🛠️ Technology Stack

| Layer | Technologies Used |
| :--- | :--- |
| **Frontend Framework** | **Next.js 14** (App Router), **TypeScript**, **React 18** |
| **3D Graphics Engine** | **Three.js**, **React Three Fiber (`@react-three/fiber`)**, **Drei (`@react-three/drei`)** |
| **Styling & Design System**| **TailwindCSS**, Vanilla CSS Tokens, Lucide Icons |
| **Backend API Server** | **Node.js**, **Express.js (v5)** |
| **Database & Pooling** | **PostgreSQL (Neon Tech)** with Connection Resilience & Keep-Alive Pooling |
| **Authentication** | **JWT (JSON Web Tokens)** + bcrypt password hashing |
| **Storage & Assets** | **Cloudinary API**, Multer binary memory storage |
| **Email Gateway** | **Brevo SMTP (Nodemailer)** |

---

## 📁 Repository Structure

```
paintIt/
├── frontend/                     # Next.js 14 Frontend Application
│   ├── app/                      # Next.js App Router (Public, Painter, Admin Routes)
│   │   ├── (admin)/admin/        # Master Admin Dashboard, Sandbox & Realism Studio
│   │   ├── (painter)/            # Painter Workspace, Designs & Gigs Inbox
│   │   └── (public)/workspace/   # Interactive 3D Room Visualizer
│   ├── components/               # Production Component Library
│   │   ├── canvas/               # R3F WebGL Canvas Components & Shaders
│   │   ├── ui/                   # Modular Asset Drawer, MicroVideoCarousel, BottomNav
│   │   └── modals/               # AddProjectModal, EditProjectModal, FeedbackModal
│   ├── config/                   # Paint Catalogs & Material Sheen Presets
│   ├── public/models/            # Production GLB 3D Room Shells & Furniture Assets
│   └── utils/                    # Floor Textures, Wall Normal Maps & Snapping Engine
└── backend/                      # Node.js Express API Engine
    ├── database.mjs              # PostgreSQL Pool Connection Manager
    └── src/routes/               # Auth, Portfolio, Leads, Analytics & Feedback Routes
```

---

## ⚙️ Local Development Setup Guide

### Prerequisites
* **Node.js**: v18.0.0 or higher
* **npm**: v9.0.0 or higher
* **PostgreSQL**: Neon PostgreSQL Instance or Local PostgreSQL

### 1. Frontend Setup
```bash
cd frontend
npm install
npm run dev
```
* The frontend server will start at: `http://localhost:3000`

### 2. Backend Setup
```bash
cd backend
npm install
npm run server
```
* The backend API server will start at: `http://localhost:8000`

---



## 📄 License & Intellectual Property

Copyright © 2026 **PaintIt Technologies Inc.** All Rights Reserved.  
*Confidential and Proprietary. Unauthorized distribution or copying is strictly prohibited.*
