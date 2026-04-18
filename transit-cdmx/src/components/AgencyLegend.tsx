"use client";

import { useState } from "react";
import { AGENCY_COLORS, AGENCY_NAMES } from "@/lib/constants";

interface AgencyLegendProps {
  agencies: string[];
  selectedAgency: string | null;
  onSelectAgency: (agency: string | null) => void;
}

export default function AgencyLegend({
  agencies,
  selectedAgency,
  onSelectAgency,
}: AgencyLegendProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="absolute top-4 left-4 z-[500] bg-[#0a0a0a]/95 backdrop-blur rounded-lg border border-white/10 shadow-2xl transition-all duration-300 w-[200px] sm:w-[220px]">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between p-3 sm:cursor-default"
      >
        <h3 className="text-sm font-bold text-[#e8734a]">Sistemas</h3>
        <span className="sm:hidden text-gray-400">{isOpen ? "▲" : "▼"}</span>
      </button>

      <div
        className={`${
          isOpen ? "block" : "hidden sm:block"
        } p-3 pt-0 max-h-[60vh] overflow-y-auto border-t border-white/5`}
      >
        <button
          onClick={() => {
            onSelectAgency(null);
            if (window.innerWidth < 640) setIsOpen(false);
          }}
          className={`w-full text-left text-xs px-2 py-1.5 rounded mb-1 transition-colors ${
            selectedAgency === null
              ? "bg-[#e8734a] text-white"
              : "text-gray-400 hover:text-white hover:bg-white/10"
          }`}
        >
          Todos
        </button>
        {agencies.map((aid) => (
          <button
            key={aid}
            onClick={() => {
              onSelectAgency(aid === selectedAgency ? null : aid);
              if (window.innerWidth < 640) setIsOpen(false);
            }}
            className={`w-full text-left text-xs px-2 py-1.5 rounded mb-0.5 flex items-center gap-2 transition-colors ${
              selectedAgency === aid
                ? "bg-white/20 text-white"
                : "text-gray-400 hover:text-white hover:bg-white/10"
            }`}
          >
            <span
              className="w-3 h-3 rounded-full inline-block flex-shrink-0"
              style={{ backgroundColor: AGENCY_COLORS[aid] || "#888" }}
            />
            {AGENCY_NAMES[aid] || aid}
          </button>
        ))}
      </div>
    </div>
  );
}
