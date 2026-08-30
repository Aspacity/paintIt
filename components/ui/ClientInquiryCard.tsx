"use client";

import { useState } from "react";
import { InboundLead } from "@/types/feedback";
import { useTheme } from "@/context/ThemeContext";

interface InquiryCardProps {
  lead: InboundLead;
  isPlanQualified?: boolean;
}

const SURFACE_LABELS: Record<string, string> = {
  wallLeft: "Left Wall",
  wallRight: "Right Wall",
  wallBack: "Back Wall",
  wallFront: "Front Accent Wall",
  ceiling: "Ceiling",
  floor: "Floor / Base"
};

export function ClientInquiryCard({ lead }: InquiryCardProps) {
  const [isExpanded, setIsExpanded] = useState(true);
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const is3DFeedback = lead.conversion_source === "DESIGN_FEEDBACK";
  const isPopupLead = lead.conversion_source === "CLIENT_POPUP" || lead.conversion_source === "POPUP_CAPTURE";

  // Parse raw text to separate user note from color swatches
  let userNote = lead.project_description || "";
  let extractedColors: Record<string, string> | null = lead.roomColors || null;

  if (userNote.includes("🎨 Chosen Colors:")) {
    const parts = userNote.split("🎨 Chosen Colors:");
    userNote = parts[0].trim();
    if (!extractedColors && parts[1]) {
      try {
        extractedColors = JSON.parse(parts[1].trim());
      } catch {
        extractedColors = null;
      }
    }
  }

  const displayEmail = lead.client_email && lead.client_email.trim() ? lead.client_email.trim() : "client@paintit.app";

  return (
    <div className={`p-4 border rounded-xl space-y-3 transition-colors shadow-sm ${
      isDark
        ? "bg-neutral-950 border-neutral-900 text-white hover:bg-neutral-900/60"
        : "bg-white border-stone-200 text-stone-900 hover:bg-stone-50"
    }`}>
      {/* Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1.5">
        <div className="flex items-center gap-2">
          <span className={`text-xs font-bold tracking-tight ${isDark ? "text-white" : "text-stone-900"}`}>
            {lead.client_name || "Interested Client"}
          </span>
          <span
            className={`text-[9px] uppercase tracking-wider border px-2 py-0.5 rounded font-bold ${
              is3DFeedback
                ? "bg-[#FF8C38]/15 border-[#FF8C38]/40 text-[#FF8C38]"
                : isPopupLead
                ? "bg-[#FF8C38]/20 border-[#FF8C38]/50 text-[#FF8C38]"
                : isDark
                ? "bg-black border-neutral-800 text-neutral-400"
                : "bg-stone-100 border-stone-300 text-stone-700"
            }`}
          >
            {is3DFeedback ? "🎨 3D Color Selection" : isPopupLead ? "🎯 Subscriber" : "💼 Job Request"}
          </span>
          {lead.finish && (
            <span className="text-[9px] uppercase tracking-wider bg-[#FF8C38]/15 border border-[#FF8C38]/30 text-[#FF8C38] px-2 py-0.5 rounded font-bold">
              ✨ {lead.finish}
            </span>
          )}
        </div>
        <span className={`text-[10px] font-mono ${isDark ? "text-neutral-500" : "text-stone-500"}`}>
          {new Date(lead.created_at).toLocaleDateString(undefined, { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}
        </span>
      </div>

      {/* Clean User Note */}
      <div className={`p-3 rounded-lg border ${
        isDark ? "bg-black/50 border-neutral-900 text-neutral-300" : "bg-[#FAF8F5] border-stone-200 text-stone-800"
      }`}>
        <p className="text-xs leading-relaxed font-medium">
          {userNote || "No text attached."}
        </p>
      </div>

      {/* 3D Color Swatches Visualizer */}
      {extractedColors && Object.keys(extractedColors).length > 0 && (
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold uppercase tracking-wider text-[#FF8C38] flex items-center gap-1">
              🎨 Selected 3D Room Colors ({Object.keys(extractedColors).length} Surfaces)
            </span>
            <button
              type="button"
              onClick={() => setIsExpanded(!isExpanded)}
              className={`text-[9px] uppercase font-bold ${
                isDark ? "text-neutral-400 hover:text-white" : "text-stone-500 hover:text-stone-900"
              }`}
            >
              {isExpanded ? "Collapse ▲" : "Expand ▼"}
            </button>
          </div>

          {isExpanded && (
            <div className={`p-3 border rounded-xl grid grid-cols-2 sm:grid-cols-3 gap-2.5 ${
              isDark ? "bg-black border-neutral-800" : "bg-[#FAF8F5] border-stone-200"
            }`}>
              {Object.entries(extractedColors).map(([surface, hex]) => (
                <div key={surface} className={`flex items-center gap-2.5 p-2 border rounded-lg ${
                  isDark ? "bg-neutral-900 border-neutral-800" : "bg-white border-stone-200"
                }`}>
                  <div
                    className="w-7 h-7 rounded-md border border-black/10 shrink-0 shadow-xs"
                    style={{ backgroundColor: hex }}
                    title={`${SURFACE_LABELS[surface] || surface}: ${hex}`}
                  />
                  <div className="flex flex-col truncate">
                    <span className={`text-[10px] font-bold truncate ${isDark ? "text-white" : "text-stone-900"}`}>
                      {SURFACE_LABELS[surface] || surface}
                    </span>
                    <span className={`text-[9px] font-mono uppercase font-semibold ${isDark ? "text-neutral-400" : "text-stone-500"}`}>
                      {hex}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Footer Contact Info */}
      <div className={`flex flex-wrap items-center justify-between gap-2 pt-2 border-t text-xs ${
        isDark ? "border-neutral-900" : "border-stone-200"
      }`}>
        {lead.isLocked ? (
          <span className="text-stone-500 font-bold flex items-center gap-1 select-none text-[10px]">
            🔒 Contact details locked by system admin.
          </span>
        ) : (
          <div className="flex flex-wrap items-center gap-2.5 w-full justify-between">
            <a
              href={`mailto:${displayEmail}?subject=${encodeURIComponent(`PaintIT - Project Inquiry for ${lead.client_name || 'Client'}`)}&body=${encodeURIComponent(`Hi ${lead.client_name || 'there'},\n\nI reviewed your inquiry on PaintIT${extractedColors ? ` and your 3D color selections (${Object.keys(extractedColors).length} surfaces${lead.finish ? ` in ${lead.finish} finish` : ''})` : ''}.\n\nI would be delighted to provide a quote and assist with your project!\n\nBest regards,`)}`}
              className={`font-medium flex items-center gap-1.5 transition-colors ${
                isDark ? "text-neutral-300 hover:text-white" : "text-stone-700 hover:text-stone-900"
              }`}
            >
              ✉️ Email: <span className={`select-all font-mono font-bold px-2 py-0.5 rounded border ${
                isDark ? "bg-black text-[#FF8C38] border-neutral-800" : "bg-stone-100 text-stone-900 border-stone-300"
              }`}>{displayEmail}</span>
            </a>

            {lead.client_phone ? (
              <a
                href={`https://wa.me/${lead.client_phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(`Hello ${lead.client_name || 'there'}! I'm reviewing your inquiry on PaintIT${extractedColors ? ` regarding your 3D color selection (${Object.keys(extractedColors).length} surfaces${lead.finish ? ` in ${lead.finish} finish` : ''})` : ''}. I'd love to assist with your project and provide a quote!`)}`}
                target="_blank"
                rel="noreferrer"
                className="text-black font-bold flex items-center gap-1.5 text-[10px] uppercase tracking-wider bg-[#FF8C38] hover:bg-[#ff9e54] border border-[#FF8C38] px-3 py-1.5 rounded-xl transition-all shadow-sm active:scale-95"
              >
                💬 WhatsApp Client ➔
              </a>
            ) : (
              <a
                href={`mailto:${displayEmail}?subject=${encodeURIComponent(`PaintIT - Project Inquiry`)}`}
                className="text-black font-bold flex items-center gap-1 text-[10px] uppercase tracking-wider bg-[#FF8C38] hover:bg-[#ff9e54] px-2.5 py-1 rounded-lg transition-all shadow-sm"
              >
                ✉️ Email Client ➔
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}