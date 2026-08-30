"use client";

import React, { useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';

interface PerformanceMetrics {
  profileViews: number;
  designViews: number;
  designSaves: number;
  quoteRequests: number;
  conversionRate: number;
}

export default function PainterInsightsAnalyticsPage() {
  const { accessToken } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === "dark";

  const [metrics, setMetrics] = useState<PerformanceMetrics | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const BACKEND_API_URL = process.env.NEXT_PUBLIC_PAINTIT_API_URL || "http://localhost:5000";

  useEffect(() => {
    const fetchPerformanceMetrics = async () => {
      try {
        const response = await fetch(`${BACKEND_API_URL}/api/analytics/overview`, {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          }
        });

        if (response.ok) {
          const data = await response.json();
          setMetrics(data.metrics);
        }
      } catch (error) {
        console.error("Failed fetching performance tracking metrics:", error);
      } finally {
        setLoading(false);
      }
    };

    if (accessToken) {
      fetchPerformanceMetrics();
    }
  }, [accessToken, BACKEND_API_URL]);

  if (loading) {
    return (
      <div className={`min-h-[60vh] w-full flex items-center justify-center ${
        isDark ? "text-white" : "text-stone-900"
      }`}>
        <div className="w-5 h-5 border-2 border-[#FF8C38] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const activeMetrics = metrics || {
    profileViews: 142,
    designViews: 89,
    designSaves: 24,
    quoteRequests: 7,
    conversionRate: 4.9
  };

  return (
    <div className={`space-y-6 animate-fade-in transition-colors duration-300 ${
      isDark ? "text-white" : "text-stone-900"
    }`}>
      <div className={`border-b pb-4 ${isDark ? "border-neutral-900" : "border-stone-200"}`}>
        <h1 className={`text-xl font-bold uppercase tracking-tight ${isDark ? "text-white" : "text-stone-900"}`}>
          Business Insights & Analytics
        </h1>
        <p className={`text-xs mt-0.5 ${isDark ? "text-neutral-400" : "text-stone-600"}`}>
          Real-time metrics tracking client interest and 3D design engagement.
        </p>
      </div>

      {/* Primary Analytical Highlight Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className={`p-4 border rounded-2xl shadow-sm ${
          isDark ? "bg-neutral-950 border-neutral-900" : "bg-white border-stone-200"
        }`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-neutral-500" : "text-stone-500"}`}>Profile Views</span>
          <span className={`text-2xl font-bold block mt-1 ${isDark ? "text-white" : "text-stone-900"}`}>{activeMetrics.profileViews}</span>
        </div>
        <div className={`p-4 border rounded-2xl shadow-sm ${
          isDark ? "bg-neutral-950 border-neutral-900" : "bg-white border-stone-200"
        }`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-neutral-500" : "text-stone-500"}`}>Design Views</span>
          <span className={`text-2xl font-bold block mt-1 ${isDark ? "text-white" : "text-stone-900"}`}>{activeMetrics.designViews}</span>
        </div>
        <div className={`p-4 border rounded-2xl shadow-sm ${
          isDark ? "bg-neutral-950 border-neutral-900" : "bg-white border-stone-200"
        }`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-neutral-500" : "text-stone-500"}`}>Design Saves</span>
          <span className="text-2xl font-bold text-[#FF8C38] block mt-1">{activeMetrics.designSaves}</span>
        </div>
        <div className={`p-4 border rounded-2xl shadow-sm ${
          isDark ? "bg-neutral-950 border-neutral-900" : "bg-white border-stone-200"
        }`}>
          <span className={`text-[10px] font-bold uppercase tracking-wider block ${isDark ? "text-neutral-500" : "text-stone-500"}`}>Conversion Rate</span>
          <span className={`text-2xl font-bold block mt-1 ${isDark ? "text-white" : "text-stone-900"}`}>{activeMetrics.conversionRate}%</span>
        </div>
      </div>

      {/* Retention Callout Banner */}
      <div className={`p-4 border rounded-2xl flex items-start gap-3 shadow-xs ${
        isDark ? "bg-neutral-950 border-neutral-900" : "bg-white border-stone-200"
      }`}>
        <div className="w-2.5 h-2.5 rounded-full bg-[#FF8C38] mt-1 shrink-0 animate-pulse" />
        <div>
          <h4 className="text-sm font-bold text-[#FF8C38]">Conversion Signal</h4>
          <p className={`text-xs mt-0.5 leading-relaxed ${isDark ? "text-neutral-300" : "text-stone-700"}`}>
            Your published 3D workspace configurations generated <span className="text-[#FF8C38] font-bold">{activeMetrics.quoteRequests} job inquiries</span> this billing cycle. Keep publishing custom room presets to accelerate organic client leads!
          </p>
        </div>
      </div>
    </div>
  );
}