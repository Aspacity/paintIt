"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { useAlert } from "@/context/AlertContext";
import { ClientInquiryCard } from "@/components/ui/ClientInquiryCard";

interface InboundLead {
  id: number;
  client_name: string;
  client_email: string;
  client_phone: string | null;
  project_description: string;
  conversion_source: string;
  created_at: string;
  isLocked?: boolean;
  roomColors?: Record<string, string> | null;
  finish?: string | null;
}

interface RawBackendLead {
  id: number;
  email: string;
  conversion_source: string;
  meta_tracking_data?: string | Record<string, unknown> | null;
  project_description?: string;
  created_at: string;
  isLocked?: boolean;
}

export default function PainterLeadsAndGigsPage() {
  const { accessToken } = useAuth();
  const { showToast } = useAlert();

  const [leads, setLeads] = useState<InboundLead[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [filterSource, setFilterSource] = useState<string>("ALL");

  const BACKEND_API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

  useEffect(() => {
    const fetchLeads = async () => {
      if (!accessToken) {
        setLoading(false);
        return;
      }

      try {
        const res = await fetch(`${BACKEND_API_URL}/api/leads/me`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${accessToken}`,
            "Content-Type": "application/json",
          },
        });

        if (res.ok) {
          const data = await res.json();
          const rawLeads: RawBackendLead[] = data.pipelineLeads || data.leads || [];

          const formattedLeads: InboundLead[] = rawLeads.map((item) => {
            let meta: Record<string, unknown> = {};
            if (typeof item.meta_tracking_data === "string") {
              try {
                meta = JSON.parse(item.meta_tracking_data);
              } catch {
                meta = {};
              }
            } else if (item.meta_tracking_data && typeof item.meta_tracking_data === "object") {
              meta = item.meta_tracking_data as Record<string, unknown>;
            }

            const rawEmail =
              (item as unknown as { client_email?: string }).client_email ||
              item.email ||
              (meta.email as string) ||
              (meta.clientEmail as string) ||
              (meta.client_email as string);
            const resolvedEmail = rawEmail && rawEmail.trim() ? rawEmail.trim() : "client@paintit.app";

            const rawName =
              (item as unknown as { client_name?: string }).client_name ||
              (meta.clientName as string) ||
              (meta.client_name as string);
            const resolvedName =
              rawName && rawName.trim()
                ? rawName.trim()
                : resolvedEmail.includes("@")
                ? resolvedEmail.split("@")[0]
                : "Interested Client";

            const rawPhone =
              (item as unknown as { client_phone?: string }).client_phone ||
              (meta.phone as string) ||
              (meta.clientPhone as string) ||
              null;

            return {
              id: item.id,
              client_name: resolvedName,
              client_email: resolvedEmail,
              client_phone: rawPhone,
              project_description:
                item.project_description ||
                (meta.message as string) ||
                "Interested in custom painting services.",
              conversion_source: item.conversion_source || "Business Profile",
              created_at: item.created_at,
              isLocked: false,
              roomColors: (meta.roomColors as Record<string, string>) || null,
              finish: (meta.finish as string) || null,
            };
          });

          setLeads(formattedLeads);
        }
      } catch (err) {
        console.error("Error fetching leads:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchLeads();
  }, [accessToken, BACKEND_API_URL]);

  const filteredLeads = leads.filter((lead) => {
    if (filterSource === "ALL") return true;
    return lead.conversion_source.toLowerCase().includes(filterSource.toLowerCase());
  });

  return (
    <div className="w-full text-white space-y-6 animate-fade-in pb-12">
      {/* Header Section */}
      <div className="border-b border-neutral-900 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-black uppercase tracking-tight text-neutral-100 flex items-center gap-2">
            <span>📩 Customer Inquiries & Job Leads</span>
          </h1>
          <p className="text-xs text-neutral-500 mt-0.5 font-medium">
            Manage incoming messages, project specs, and 3D color choices from clients.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[10px] bg-[#FF8C38]/15 border border-[#FF8C38]/40 text-[#FF8C38] px-3 py-1.5 rounded-xl font-bold uppercase tracking-wider">
            {leads.length} Total Leads
          </span>
        </div>
      </div>

      {/* Leads Summary Statistics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-2xl shadow-md">
          <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Total Inquiries</span>
          <span className="text-xl font-black text-white block mt-0.5">{leads.length}</span>
        </div>
        <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-2xl shadow-md">
          <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">WhatsApp Direct</span>
          <span className="text-xl font-black text-[#FF8C38] block mt-0.5">
            {leads.filter((l) => !!l.client_phone).length}
          </span>
        </div>
        <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-2xl shadow-md">
          <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">3D Color Picks</span>
          <span className="text-xl font-black text-cyan-400 block mt-0.5">
            {leads.filter((l) => !!l.roomColors).length}
          </span>
        </div>
        <div className="p-4 bg-neutral-950 border border-neutral-900 rounded-2xl shadow-md">
          <span className="text-[9px] text-neutral-500 font-bold uppercase tracking-wider block">Response Rate</span>
          <span className="text-xl font-black text-white block mt-0.5">100%</span>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-neutral-900 pb-3">
        {["ALL", "Profile", "3D Studio", "Direct"].map((source) => (
          <button
            key={source}
            onClick={() => setFilterSource(source)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterSource === source
                ? "bg-[#FF8C38] text-neutral-950 font-black shadow-md"
                : "bg-neutral-950 border border-neutral-850 text-neutral-400 hover:text-white"
            }`}
          >
            {source === "ALL" ? "All Messages" : source}
          </button>
        ))}
      </div>

      {/* Main Inbox Feed */}
      {loading ? (
        <div className="py-16 text-center">
          <div className="w-5 h-5 border-2 border-[#FF8C38] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
          <p className="text-xs text-neutral-500">Loading your client inquiries...</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="py-16 bg-neutral-950 border border-neutral-900 rounded-3xl text-center space-y-3">
          <span className="text-3xl block">📩</span>
          <h3 className="text-xs font-black uppercase text-neutral-300">No Inquiries Found</h3>
          <p className="text-[11px] text-neutral-500 max-w-sm mx-auto">
            Share your business link with potential clients on WhatsApp to start receiving direct job requests!
          </p>
          <button
            onClick={() => {
              const link = `${window.location.origin}/profile`;
              navigator.clipboard.writeText(link);
              showToast({ message: "Profile link copied to clipboard!", severity: "success" });
            }}
            className="px-4 py-2 bg-[#FF8C38] hover:bg-[#FF8C38] text-neutral-950 text-xs font-black uppercase rounded-xl shadow-md transition-all"
          >
            🔗 Copy Profile Link
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLeads.map((lead) => (
            <ClientInquiryCard key={lead.id} lead={lead} isPlanQualified={true} />
          ))}
        </div>
      )}
    </div>
  );
}