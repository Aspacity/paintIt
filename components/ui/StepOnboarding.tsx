"use client";

import React from 'react';
import { OnboardingStep } from '@/types/index';
import { useTheme } from '@/context/ThemeContext';

interface StepOnboardingProps {
  title: string;
  subtitle: string;
  steps: OnboardingStep[];
  ctaText: string;
  onCtaClick: () => void;
  estimatedMinutes?: number;
}

export const StepOnboarding: React.FC<StepOnboardingProps> = ({
  title,
  subtitle,
  steps,
  ctaText,
  onCtaClick,
  estimatedMinutes = 3,
}) => {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <div className={`w-full max-w-sm mx-auto p-5 border rounded-2xl shadow-xl text-left relative overflow-hidden animate-fade-in transition-colors duration-300 ${
      isDark ? "bg-neutral-950 border-neutral-900 text-white" : "bg-white border-stone-200 text-stone-900"
    }`}>
      <div className="absolute top-0 left-0 w-full h-[2px] bg-gradient-to-r from-[#FF8C38] via-transparent to-transparent" />

      <div className="text-center mb-5">
        <h3 className="text-base font-bold tracking-tight text-[#FF8C38]">{title}</h3>
        <p className={`text-xs mt-1 leading-relaxed px-1 ${isDark ? "text-neutral-400" : "text-stone-600"}`}>{subtitle}</p>
      </div>

      {/* Simplified, Clean Milestone Layout */}
      <div className="space-y-2.5 mb-5">
        {steps.map((step) => (
          <div
            key={step.id}
            className={`flex items-center gap-3 p-3 border rounded-xl ${
              isDark ? "bg-black border-neutral-850" : "bg-[#FAF8F5] border-stone-200"
            }`}
          >
            <div className="flex items-center justify-center w-5 h-5 rounded-full bg-[#FF8C38]/20 text-[#FF8C38] text-[10px] font-bold shrink-0">
              {step.id}
            </div>
            <div>
              <h4 className={`text-xs font-bold tracking-wide ${isDark ? "text-white" : "text-stone-900"}`}>{step.label}</h4>
              <p className={`text-[10px] mt-0.5 leading-normal ${isDark ? "text-neutral-400" : "text-stone-600"}`}>{step.description}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onCtaClick}
        className="w-full py-3 bg-[#FF8C38] hover:bg-[#ff9e54] text-black font-bold text-xs uppercase tracking-wider rounded-xl transition-all active:scale-95 shadow-md"
      >
        {ctaText}
      </button>

      <div className="text-center mt-3">
        <span className={`text-[9px] font-bold tracking-widest uppercase ${isDark ? "text-neutral-500" : "text-stone-500"}`}>
          Setup time: ~{estimatedMinutes} mins
        </span>
      </div>
    </div>
  );
};