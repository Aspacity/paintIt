"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";

const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface CampaignStats {
  totalWaitlist: number;
  newUnsent: number;
  pendingRegistration: number;
  convertedFoundingUsers: number;
}

interface CampaignHistoryItem {
  id: number;
  subject: string;
  target_group: string;
  success_count: number;
  total_recipients: number;
  created_at: string;
}

export default function AdminCampaignsComposer() {
  const { accessToken } = useAuth();
  const { showToast } = useAlert();

  const [activeTab, setActiveTab] = useState<"write" | "preview">("write");
  const [subject, setSubject] = useState<string>("🎨 You're Invited: Create Your PaintIT Account Today");
  const [bodyContent, setBodyContent] = useState<string>(`A little while ago, you joined the PaintIT waitlist because you believed in what we're building.

Today, I'm excited to let you know that **you can now create your account and become one of our first early users.**

PaintIT is building tools that make it easier for professionals to present ideas, win clients, and bring spaces to life through interactive 3D experiences.

For this first phase, we're focused on supporting **professional painters**.

### What you can do

* Create your professional profile.
* Showcase your previous painting projects.
* Share interactive 3D room previews with clients.
* Help shape the future of PaintIT.

### Why we're inviting you early

This isn't just early access.

You're joining as a **founding user**.

That means your ideas, suggestions, and feedback will directly influence how PaintIT grows.

As you use the platform, we'd love to hear:

* What you enjoyed.
* What felt confusing.
* Features you'd like to see.
* Bugs or issues you encounter.
* Anything that would make your work easier.

Your feedback is incredibly valuable to us.

### What we're asking in return

All we're asking is that you:

* Explore the platform.
* Use it in your workflow where possible.
* Share honest feedback.
* Tell us how we can make PaintIT better for you.

### Get Started

Create your account here:
https://paint-it-six.vercel.app/register

Thank you for believing in PaintIT from the beginning.

We're excited to build this journey with you.

See you inside!`);

  const [targetGroup, setTargetGroup] = useState<string>("WAITLIST_PENDING");
  const [sending, setSending] = useState<boolean>(false);
  const [stats, setStats] = useState<CampaignStats | null>(null);
  const [history, setHistory] = useState<CampaignHistoryItem[]>([]);
  const [results, setResults] = useState<{ successCount: number; totalRecipients: number } | null>(null);

  // Fetch real-time campaign intelligence stats from backend
  const fetchCampaignStats = async () => {
    try {
      const token = accessToken || localStorage.getItem("paintit_access_token") || "";
      const res = await fetch(`${BACKEND_API_URL}/api/admin/campaign-stats`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setStats(data.stats || null);
        setHistory(data.history || []);
      }
    } catch (err) {
      console.error("Stats fetch err:", err);
    }
  };

  useEffect(() => {
    queueMicrotask(() => {
      fetchCampaignStats();
    });
  }, [accessToken]);

  // Insert markdown shortcuts
  const insertFormatting = (prefix: string, suffix: string = "") => {
    setBodyContent((prev) => `${prev}\n${prefix}Sample Text${suffix}`);
  };

  // Convert raw body text into the exact HTML email preview (with dynamic recipient name demonstration)
  const generateHtmlPreview = () => {
    let processed = bodyContent
      .replace(/### (.*)/g, '<h3 style="color: #10b981; font-size: 14px; font-weight: 700; margin-top: 24px; margin-bottom: 10px; text-transform: uppercase; letter-spacing: 0.05em;">$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong style="color: #f4f4f5;">$1</strong>')
      .replace(/^\* (.*)/gm, '<li style="font-size: 13px; color: #d4d4d8; margin-bottom: 6px;">$1</li>')
      .replace(/(https:\/\/paint-it-six\.vercel\.app\/[^\s]+)/g, '<div style="text-align: center; margin: 28px 0;"><a href="$1" style="display: inline-block; background-color: #10b981; color: #052e16; font-weight: 800; font-size: 14px; text-decoration: none; padding: 14px 32px; border-radius: 12px; box-shadow: 0 4px 14px rgba(16, 185, 129, 0.35);">Create Your Account Now ➔</a></div>');

    processed = processed.replace(/(<li[\s\S]*?<\/li>\n?)+/g, '<ul style="background-color: #16161a; padding: 16px 16px 16px 36px; border-radius: 12px; border: 1px solid #27272a; margin: 16px 0;">$&</ul>');

    const paragraphs = processed.split('\n\n').map(p => p.startsWith('<') ? p : `<p style="margin: 14px 0;">${p}</p>`).join('');

    return `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; max-width: 580px; margin: 0 auto; padding: 32px 24px; background-color: #0c0c0e; color: #f4f4f5; border-radius: 20px; border: 1px solid #27272a; line-height: 1.6;">
        <div style="display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #1f1f23; padding-bottom: 18px; margin-bottom: 24px;">
          <h2 style="color: #10b981; font-weight: 850; font-size: 20px; margin: 0; letter-spacing: -0.02em;">PaintIT</h2>
          <span style="font-size: 10px; color: #71717a; font-weight: 600; text-transform: uppercase; letter-spacing: 0.1em;">Founding User Invitation</span>
        </div>
        <p style="font-size: 15px; color: #f4f4f5; font-weight: 500; margin-top: 0;">Hi <span style="color: #10b981; font-weight: 700;">Tijesunimi</span> <span style="font-size: 11px; color: #71717a; font-weight: normal;">(Recipient's Database Name Injected Automatically)</span>,</p>
        <div style="font-size: 14px; color: #a1a1aa; line-height: 1.6;">
          ${paragraphs}
        </div>
        <div style="border-top: 1px solid #1f1f23; padding-top: 20px; margin-top: 28px;">
          <p style="font-size: 14px; font-weight: 700; color: #f4f4f5; margin: 0;">Tijesunimi S. Idowu</p>
          <p style="font-size: 12px; color: #10b981; margin: 2px 0 0 0; font-weight: 500;">Founder, PaintIT</p>
        </div>
      </div>
    `;
  };

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subject.trim() || !bodyContent.trim()) {
      showToast({ message: "⚠️ Subject and message body content are required.", severity: "error" });
      return;
    }

    setSending(true);
    setResults(null);

    try {
      const token = accessToken || localStorage.getItem("paintit_access_token") || "";
      const res = await fetch(`${BACKEND_API_URL}/api/admin/broadcast`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          subject: subject.trim(),
          bodyContent: bodyContent.trim(),
          targetGroup
        })
      });

      const data = await res.json();

      if (res.ok) {
        setResults({
          successCount: data.successCount || 0,
          totalRecipients: data.totalRecipients || 0
        });
        showToast({ message: `📣 Broadcast completed! ${data.successCount || 0} emails dispatched.`, severity: "success" });
        fetchCampaignStats();
      } else {
        showToast({ message: `❌ Broadcast failed: ${data.error || "Server error"}`, severity: "error" });
      }
    } catch (err) {
      console.error(err);
      showToast({ message: "💥 Server network error.", severity: "error" });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="p-6 md:p-8 space-y-8 bg-neutral-950 min-h-screen text-white font-sans">
      {/* Header Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-neutral-900 pb-6">
        <div>
          <h1 className="text-2xl font-black uppercase tracking-tight text-neutral-100 flex items-center gap-2">
            <span>📣 Campaign Studio & Luxury Audience Intelligence</span>
          </h1>
          <p className="text-xs text-neutral-400 font-medium mt-1">
            Compose markdown campaign emails, target specific conversion segments (Unsent, Reminders, Converted), and preview live recipient HTML.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveTab("write")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "write"
                ? "bg-[#FF8C38] text-neutral-950 shadow-lg font-black"
                : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
            }`}
          >
            ✏️ Write & Format
          </button>
          <button
            onClick={() => setActiveTab("preview")}
            className={`px-4 py-2 text-xs font-bold rounded-xl transition-all ${
              activeTab === "preview"
                ? "bg-[#FF8C38] text-neutral-950 shadow-lg font-black"
                : "bg-neutral-900 text-neutral-400 hover:text-white border border-neutral-800"
            }`}
          >
            👁️ Live Email Preview
          </button>
        </div>
      </div>

      {/* Audience Segment Counters Grid */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-2xl space-y-1">
            <span className="text-[10px] font-mono text-neutral-500 uppercase">⏳ New Signups (Never Emailed)</span>
            <span className="text-2xl font-black text-amber-400 block">{stats.newUnsent}</span>
            <span className="text-[9px] text-neutral-600 font-medium">Ready for initial invite</span>
          </div>

          <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-2xl space-y-1">
            <span className="text-[10px] font-mono text-neutral-500 uppercase">🔔 Haven&apos;t Registered Yet</span>
            <span className="text-2xl font-black text-rose-400 block">{stats.pendingRegistration}</span>
            <span className="text-[9px] text-neutral-600 font-medium">Target for follow-up reminders</span>
          </div>

          <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-2xl space-y-1">
            <span className="text-[10px] font-mono text-neutral-500 uppercase">✨ Converted Founding Users</span>
            <span className="text-2xl font-black text-[#FF8C38] block">{stats.convertedFoundingUsers}</span>
            <span className="text-[9px] text-neutral-600 font-medium">Already created account</span>
          </div>

          <div className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-2xl space-y-1">
            <span className="text-[10px] font-mono text-neutral-500 uppercase">👥 Total Waitlist Leads</span>
            <span className="text-2xl font-black text-white block">{stats.totalWaitlist}</span>
            <span className="text-[9px] text-neutral-600 font-medium">Overall waitlist database</span>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Main Composition / Preview Container */}
        <div className="lg:col-span-8 space-y-6">
          <form onSubmit={handleBroadcastSubmit} className="space-y-6">
            {/* Target Select & Subject Line */}
            <div className="p-6 bg-neutral-900/90 border border-neutral-800 rounded-2xl space-y-4 backdrop-blur-md">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-[#FF8C38] font-bold">
                    🎯 Smart Target Audience Segment
                  </label>
                  <select
                    value={targetGroup}
                    onChange={(e) => setTargetGroup(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#FF8C38] rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none transition-all font-medium"
                  >
                    <option value="WAITLIST_PENDING">🔔 Waitlist Leads Who Haven&apos;t Registered Yet (Reminder Target)</option>
                    <option value="WAITLIST_NEW">⏳ New Waitlist Signups Only (Never Emailed)</option>
                    <option value="WAITLIST_CONVERTED">✨ Converted Founding Users (Already Registered)</option>
                    <option value="WAITLIST">📋 All Waitlist Leads (Entire Waitlist)</option>
                    <option value="PAINTER">🎨 Registered Professional Painters</option>
                    <option value="DESIGNER">📐 Registered Interior Designers</option>
                    <option value="CONSUMER">🏠 Registered Homeowners</option>
                    <option value="ARCHITECT">🏛️ Registered Architects</option>
                    <option value="ALL">👥 All Platform Users</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400 font-bold">
                    ✉️ Email Subject Line
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Enter email subject..."
                    value={subject}
                    onChange={(e) => setSubject(e.target.value)}
                    className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#FF8C38] rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-700 focus:outline-none transition-all font-medium"
                  />
                </div>
              </div>
            </div>

            {/* TAB 1: WRITE & FORMAT */}
            {activeTab === "write" && (
              <div className="p-6 bg-neutral-900/90 border border-neutral-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
                  <span className="text-xs font-black uppercase tracking-wider text-neutral-300">
                    Markdown Campaign Body Editor
                  </span>
                  
                  {/* Formatting Toolbar */}
                  <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
                    <button
                      type="button"
                      onClick={() => insertFormatting("### ")}
                      className="px-2.5 py-1 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-[10px] font-mono font-bold text-neutral-300"
                      title="Header 3"
                    >
                      H3
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting("**", "**")}
                      className="px-2.5 py-1 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-[10px] font-mono font-bold text-neutral-300"
                      title="Bold Text"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting("* ")}
                      className="px-2.5 py-1 bg-neutral-950 hover:bg-neutral-800 border border-neutral-800 rounded-lg text-[10px] font-mono font-bold text-neutral-300"
                      title="Bullet List"
                    >
                      • List
                    </button>
                    <button
                      type="button"
                      onClick={() => insertFormatting("https://paint-it-six.vercel.app/register")}
                      className="px-2.5 py-1 bg-[#FF8C38]/15 border border-[#FF8C38]/40 text-[#FF8C38] rounded-lg text-[10px] font-mono font-bold"
                      title="CTA Button Link"
                    >
                      + Button Link
                    </button>
                  </div>
                </div>

                <textarea
                  required
                  rows={18}
                  value={bodyContent}
                  onChange={(e) => setBodyContent(e.target.value)}
                  className="w-full bg-neutral-950 border border-neutral-800 focus:border-[#FF8C38] rounded-xl p-4 text-xs text-neutral-200 placeholder-neutral-700 focus:outline-none transition-all resize-none font-mono leading-relaxed"
                  placeholder="Paste or type markdown email content here..."
                />
              </div>
            )}

            {/* TAB 2: LIVE EMAIL PREVIEW */}
            {activeTab === "preview" && (
              <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-black uppercase tracking-wider text-[#FF8C38]">
                    👁️ Recipient Inbox Live HTML Preview
                  </span>
                  <span className="text-[10px] text-neutral-500 font-mono">
                    Subject: {subject}
                  </span>
                </div>

                <div className="w-full p-4 bg-neutral-950 border border-neutral-850 rounded-2xl overflow-y-auto max-h-[600px]">
                  <div dangerouslySetInnerHTML={{ __html: generateHtmlPreview() }} />
                </div>
              </div>
            )}

            {/* Submit Action Bar */}
            <div className="flex items-center gap-4">
              <button
                type="submit"
                disabled={sending}
                className="flex-1 py-3.5 bg-[#FF8C38] hover:bg-[#FF8C38] text-neutral-950 text-xs font-black uppercase tracking-wider rounded-xl shadow-xl transition-all active:scale-[0.98] disabled:bg-neutral-800 disabled:text-neutral-500 flex items-center justify-center gap-2 cursor-pointer"
              >
                {sending ? (
                  <>
                    <div className="w-4 h-4 border-2 border-neutral-950 border-t-transparent rounded-full animate-spin" />
                    <span>Dispatching Broadcast...</span>
                  </>
                ) : (
                  <span>📣 Dispatch Campaign Broadcast ➔</span>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Sidebar: Audience Analytics & History Log */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-neutral-200">
              📊 Campaign Intelligence
            </h3>
            <div className="space-y-3 text-xs text-neutral-400 font-medium">
              <div className="p-3 bg-neutral-950 border border-neutral-850 rounded-xl flex items-center justify-between">
                <span>Selected Segment:</span>
                <span className="text-[#FF8C38] font-bold font-mono text-[11px]">{targetGroup}</span>
              </div>
              <div className="p-3 bg-neutral-950 border border-neutral-850 rounded-xl flex items-center justify-between">
                <span>Formatting Mode:</span>
                <span className="text-neutral-200 font-bold font-mono">Rich Dark HTML</span>
              </div>
              <div className="p-3 bg-neutral-950 border border-neutral-850 rounded-xl flex items-center justify-between">
                <span>Recipient Name Injection:</span>
                <span className="text-[#FF8C38] font-bold font-mono">Dynamic DB Match</span>
              </div>
            </div>
          </div>

          {/* Broadcast History */}
          {history.length > 0 && (
            <div className="p-6 bg-neutral-900 border border-neutral-800 rounded-2xl space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-neutral-200">
                📜 Broadcast History Log
              </h3>
              <div className="space-y-2 max-h-[300px] overflow-y-auto no-scrollbar">
                {history.map((item) => (
                  <div key={item.id} className="p-3 bg-neutral-950 border border-neutral-850 rounded-xl text-xs space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-white">
                      <span className="truncate max-w-[180px]">{item.subject}</span>
                      <span className="text-[#FF8C38] font-mono">{item.success_count}/{item.total_recipients}</span>
                    </div>
                    <div className="flex items-center justify-between text-[9px] text-neutral-500 font-mono">
                      <span>Target: {item.target_group}</span>
                      <span>{new Date(item.created_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Results Summary */}
          {results && (
            <div className="p-6 bg-neutral-900 border border-[#FF8C38]/40 rounded-2xl space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#FF8C38]">
                🎉 Delivery Report
              </h3>
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-center">
                  <span className="text-[9px] font-mono text-neutral-500 uppercase block">Delivered</span>
                  <span className="text-xl font-black text-[#FF8C38] mt-1 block">{results.successCount}</span>
                </div>
                <div className="p-3 bg-neutral-950 border border-neutral-800 rounded-xl text-center">
                  <span className="text-[9px] font-mono text-neutral-500 uppercase block">Total Leads</span>
                  <span className="text-xl font-black text-white mt-1 block">{results.totalRecipients}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
