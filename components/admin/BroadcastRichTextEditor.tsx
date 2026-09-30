"use client";

import React, { useState, useRef } from "react";

interface BroadcastRichTextEditorProps {
  title: string;
  setTitle: (val: string) => void;
  body: string;
  setBody: (val: string) => void;
  category: string;
  setCategory: (val: string) => void;
  targetRole: string;
  setTargetRole: (val: string) => void;
  actionUrl: string;
  setActionUrl: (val: string) => void;
  onSend: (e: React.FormEvent) => void;
  isBroadcasting: boolean;
}

export default function BroadcastRichTextEditor({
  title,
  setTitle,
  body,
  setBody,
  category,
  setCategory,
  targetRole,
  setTargetRole,
  actionUrl,
  setActionUrl,
  onSend,
  isBroadcasting,
}: BroadcastRichTextEditorProps) {
  const [activeTab, setActiveTab] = useState<"WRITE" | "PREVIEW">("WRITE");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Formatting Toolbar Action Helper (GitHub PR Style)
  const insertFormatting = (prefix: string, suffix: string = "") => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = body.substring(start, end) || "text";
    const replacement = `${prefix}${selectedText}${suffix}`;

    const newBody = body.substring(0, start) + replacement + body.substring(end);
    setBody(newBody);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + prefix.length, start + prefix.length + selectedText.length);
    }, 0);
  };

  // Simple Markdown Parser for Live Email Preview
  const renderMarkdownPreview = (text: string) => {
    if (!text.trim()) {
      return <p className="text-xs text-neutral-500 italic">No message content typed yet...</p>;
    }

    const lines = text.split("\n");
    return lines.map((line, idx) => {
      let content: React.ReactNode = line;

      // Headers
      if (line.startsWith("### ")) {
        return (
          <h4 key={idx} className="text-sm font-extrabold text-white mt-2 mb-1">
            {line.replace("### ", "")}
          </h4>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h3 key={idx} className="text-base font-black text-[#FF8C38] mt-3 mb-1">
            {line.replace("## ", "")}
          </h3>
        );
      }

      // Blockquotes
      if (line.startsWith("> ")) {
        return (
          <blockquote
            key={idx}
            className="border-l-2 border-[#FF8C38] pl-3 py-1 text-xs italic text-neutral-300 bg-neutral-900/60 rounded-r-lg my-1.5"
          >
            {line.replace("> ", "")}
          </blockquote>
        );
      }

      // Bullet Lists
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return (
          <li key={idx} className="text-xs text-neutral-200 ml-4 list-disc my-0.5">
            {line.substring(2)}
          </li>
        );
      }

      // Formatting regex replacements (bold, italics, code)
      let formattedLine = line;
      // Bold **text**
      const parts = formattedLine.split(/(\*\*.*?\*\*|\*.*?\*|`.*?`)/g);

      return (
        <p key={idx} className="text-xs text-neutral-200 leading-relaxed my-1">
          {parts.map((part, pIdx) => {
            if (part.startsWith("**") && part.endsWith("**")) {
              return (
                <strong key={pIdx} className="font-extrabold text-white">
                  {part.slice(2, -2)}
                </strong>
              );
            }
            if (part.startsWith("*") && part.endsWith("*")) {
              return (
                <em key={pIdx} className="italic text-amber-300">
                  {part.slice(1, -1)}
                </em>
              );
            }
            if (part.startsWith("`") && part.endsWith("`")) {
              return (
                <code
                  key={pIdx}
                  className="bg-neutral-900 border border-neutral-800 text-[#FF8C38] font-mono text-[11px] px-1.5 py-0.5 rounded"
                >
                  {part.slice(1, -1)}
                </code>
              );
            }
            return part;
          })}
        </p>
      );
    });
  };

  return (
    <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 space-y-4 shadow-xl font-sans text-white">
      {/* Header */}
      <div className="border-b border-neutral-850 pb-3 flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black uppercase text-[#FF8C38] tracking-wider flex items-center gap-2">
            <span>📢 Broadcast Message & Email Studio</span>
          </h3>
          <p className="text-[11px] text-neutral-500 mt-0.5">
            Draft announcements with rich markdown formatting and preview live email delivery output.
          </p>
        </div>

        {/* GitHub PR Style Write / Preview Tab Switcher */}
        <div className="flex items-center gap-1 bg-neutral-950 p-1 rounded-xl border border-neutral-800 shrink-0">
          <button
            type="button"
            onClick={() => setActiveTab("WRITE")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === "WRITE"
                ? "bg-[#FF8C38] text-black shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            ✏️ Write
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("PREVIEW")}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
              activeTab === "PREVIEW"
                ? "bg-[#FF8C38] text-black shadow-sm"
                : "text-neutral-400 hover:text-white"
            }`}
          >
            👁️ Preview Email
          </button>
        </div>
      </div>

      <form onSubmit={onSend} className="space-y-4">
        {/* Category & Target Audience Selectors */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
              Category
            </label>
            <select
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs font-bold text-[#FF8C38] focus:outline-none"
            >
              <option value="ANNOUNCEMENT">📢 Announcement</option>
              <option value="NEW_FEATURE">✨ New Feature Release</option>
              <option value="FIXED_ISSUE">🛠️ Fixed Issue / Bug Fix</option>
              <option value="NEW_DEVELOPMENT">🚀 Platform Development</option>
            </select>
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
              Target Audience
            </label>
            <select
              value={targetRole}
              onChange={(e) => setTargetRole(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs font-bold text-neutral-200 focus:outline-none"
            >
              <option value="ALL">🌐 All Users (Painters & Clients)</option>
              <option value="PAINTER">🎨 Painters Only</option>
              <option value="CLIENT">🏡 Clients / Homeowners Only</option>
            </select>
          </div>
        </div>

        {/* Title & Action URL Inputs */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
              Subject / Title
            </label>
            <input
              type="text"
              placeholder="e.g. 🎨 Wall Splitter Feature is Now Live!"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs font-bold text-white focus:outline-none focus:border-[#FF8C38]"
            />
          </div>

          <div>
            <label className="text-[10px] font-bold uppercase tracking-wider text-neutral-400 block mb-1">
              CTA Action Link (Optional)
            </label>
            <input
              type="text"
              placeholder="/search/designs"
              value={actionUrl}
              onChange={(e) => setActionUrl(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-2.5 text-xs text-white focus:outline-none"
            />
          </div>
        </div>

        {/* WRITE TAB vs PREVIEW TAB */}
        {activeTab === "WRITE" ? (
          <div className="space-y-2">
            {/* Formatting Toolbar */}
            <div className="flex flex-wrap items-center gap-1 bg-neutral-950 border border-neutral-800 rounded-xl p-1.5">
              <button
                type="button"
                onClick={() => insertFormatting("**", "**")}
                className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 rounded text-xs font-bold text-white border border-neutral-800"
                title="Bold (**text**)"
              >
                <strong>B</strong>
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("*", "*")}
                className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 rounded text-xs italic font-bold text-amber-300 border border-neutral-800"
                title="Italics (*text*)"
              >
                <em>I</em>
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("### ")}
                className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 rounded text-xs font-bold text-cyan-400 border border-neutral-800"
                title="Heading (### Title)"
              >
                H
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("> ")}
                className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 rounded text-xs font-bold text-neutral-300 border border-neutral-800"
                title="Quote (> Quote)"
              >
                “ ”
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("- ")}
                className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 rounded text-xs font-bold text-neutral-300 border border-neutral-800"
                title="Bullet List (- item)"
              >
                • List
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("`", "`")}
                className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 rounded text-xs font-mono text-[#FF8C38] border border-neutral-800"
                title="Monospace Code (`code`)"
              >
                &lt;/&gt;
              </button>
              <button
                type="button"
                onClick={() => insertFormatting("[Link Text](", ")")}
                className="px-2.5 py-1 bg-neutral-900 hover:bg-neutral-800 rounded text-xs font-bold text-blue-400 border border-neutral-800"
                title="Hyperlink ([Text](url))"
              >
                🔗 Link
              </button>
            </div>

            {/* Markdown Input Area */}
            <textarea
              ref={textareaRef}
              rows={7}
              placeholder="Type message in Markdown format (**bold**, *italics*, ### headings, - bullet lists)..."
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-2xl p-3.5 text-xs text-white font-mono placeholder:text-neutral-600 focus:outline-none focus:border-[#FF8C38] leading-relaxed resize-y"
            />
          </div>
        ) : (
          /* PREVIEW TAB: SIMULATES DELIVERED EMAIL & INBOX LAYOUT */
          <div className="space-y-3">
            <div className="text-[10px] font-mono uppercase text-neutral-400 flex items-center justify-between">
              <span>📧 Live Delivery Preview (Email & In-App)</span>
              <span className="text-emerald-400 font-bold">✓ Rendered HTML Output</span>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 shadow-2xl space-y-4 font-sans">
              {/* Simulated Email Header */}
              <div className="border-b border-neutral-900 pb-3 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">PaintIT Notifications</span>
                    <span className="text-[9px] font-mono text-neutral-500">&lt;notifications@paintit.app&gt;</span>
                  </div>
                  <div className="text-[10px] text-neutral-400 mt-0.5">
                    To: <span className="text-[#FF8C38] font-bold">{targetRole} Users</span>
                  </div>
                </div>

                <span className="text-[9px] font-mono uppercase bg-[#FF8C38]/15 text-[#FF8C38] border border-[#FF8C38]/30 px-2.5 py-1 rounded-full font-bold">
                  {category.replace("_", " ")}
                </span>
              </div>

              {/* Subject */}
              <h3 className="text-sm font-black text-white leading-snug">
                {title || "Untitled Notification Subject"}
              </h3>

              {/* Rendered Body */}
              <div className="py-2 border-y border-neutral-900/60">
                {renderMarkdownPreview(body)}
              </div>

              {/* CTA Button */}
              {actionUrl && (
                <div className="pt-1">
                  <a
                    href={actionUrl}
                    className="inline-block px-4 py-2.5 bg-[#FF8C38] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-md"
                  >
                    View Update Details ➔
                  </a>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Action Button */}
        <div className="pt-2">
          <button
            type="submit"
            disabled={isBroadcasting}
            className="w-full py-3 bg-[#FF8C38] hover:bg-[#ff9e54] text-black font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all active:scale-95 disabled:opacity-50"
          >
            {isBroadcasting ? "Transmitting Broadcast..." : "🚀 Send Broadcast Message Now"}
          </button>
        </div>
      </form>
    </div>
  );
}
