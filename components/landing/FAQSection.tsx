"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQS: FAQItem[] = [
  {
    question: "What is PaintIT Studio?",
    answer: "PaintIT Studio is a specialized paint and interior visualization platform designed to let you see room color ideas, lighting shifts, and surface finishes in realistic context before committing money, time, or labor.",
  },
  {
    question: "Who is PaintIT built for?",
    answer: "PaintIT serves two primary audiences: homeowners planning room projects who want to decide with confidence, and professional painters/contractors who want to present visual concepts to clients and win jobs faster.",
  },
  {
    question: "Does PaintIT replace a professional painter?",
    answer: "No. PaintIT is strictly a visualization tool. Professional painters bring the physical craftsmanship, surface prep, and application skill to life. PaintIT helps painters and homeowners communicate clearly before work begins.",
  },
  {
    question: "Can I try different colours and lighting conditions?",
    answer: "Yes! You can explore curated paint manufacturer swatches, custom hex codes, and simulate daylight conditions ranging from cool morning sunlight to warm evening lamp light.",
  },
  {
    question: "Can I use PaintIT for client presentations?",
    answer: "Absolutely. Painting professionals use PaintIT on tablets during initial client consultations or generate shareable web links to present polished visual directions.",
  },
  {
    question: "Is PaintIT free to use?",
    answer: "PaintIT offers a free interactive demo studio mode so you can explore room swatches and features. Advanced team workspace features for high-volume contractor portfolios are available under early access plans.",
  },
];

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <section id="faq" className="py-16 sm:py-24 bg-neutral-950 text-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 sm:mb-16">
          <span className="text-xs font-bold uppercase tracking-widest text-[#FF8C38] mb-2 block">
            Frequently Asked Questions
          </span>
          <h2 className="text-3xl sm:text-5xl font-bold tracking-tight text-white font-sans leading-tight">
            Clear answers to <span className="font-serif italic text-[#FF8C38]">common questions.</span>
          </h2>
        </div>

        {/* Accordion List */}
        <div className="space-y-4">
          {FAQS.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={faq.question}
                className="rounded-2xl bg-neutral-900 border border-neutral-800 overflow-hidden transition-all"
              >
                <button
                  onClick={() => setOpenIndex(isOpen ? null : idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 focus:outline-none"
                >
                  <span className="text-base sm:text-lg font-bold text-white">
                    {faq.question}
                  </span>
                  <span className="w-8 h-8 rounded-full bg-black border border-neutral-800 flex items-center justify-center text-[#FF8C38] font-bold shrink-0 text-sm">
                    {isOpen ? "−" : "+"}
                  </span>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3 }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-6 sm:px-6 sm:pb-6 pt-0 text-xs sm:text-sm text-neutral-400 leading-relaxed border-t border-neutral-800/80">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
