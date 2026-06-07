/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ShieldCheck, Cpu, RefreshCw } from "lucide-react";

export function Header() {
  return (
    <header 
      className="sticky top-0 z-50 w-full backdrop-blur-md bg-white/70 border-b border-rich-navy/10 py-4 px-6 md:px-8 flex items-center justify-between" 
      id="compliance-pulse-header"
    >
      <div className="flex items-center gap-3">
        {/* Futuristic premium enterprise-style token */}
        <div className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-tr from-deep-navy to-rich-navy text-white shadow-md shadow-accent-blue/10">
          <ShieldCheck className="w-5.5 h-5.5 text-soft-sky" />
          <div className="absolute -inset-0.5 rounded-xl bg-accent-blue opacity-10 blur-sm pointer-events-none"></div>
        </div>
        
        <div>
          <div className="flex items-center gap-2">
            <h1 className="font-display font-bold text-xl md:text-2xl leading-none tracking-tight text-deep-navy">
              Compliance<span className="text-rich-navy font-light">Pulse</span>
            </h1>
            <span className="text-[10px] font-bold font-mono tracking-widest bg-ice-blue border border-accent-blue/30 text-rich-navy px-1.5 py-0.5 rounded-md uppercase">
              v1.1.0
            </span>
          </div>
          <p className="text-[10px] text-slate-500 font-mono tracking-wider mt-1 uppercase">
            REGULATORY MONITORING & BREACH PREDICTION ENGINE
          </p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        {/* Premium Enterprise Green/Blue Monitoring Pill */}
        <span className="flex items-center gap-2 px-3 py-1.5 bg-frost-blue border border-accent-blue/30 rounded-full text-xs font-mono font-bold text-deep-navy shadow-xs">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent-blue opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-rich-navy"></span>
          </span>
          SECURE MONITOR ACTIVE
        </span>
        
        {/* Subtle details */}
        <div className="hidden lg:flex flex-col text-right font-mono text-[10px] text-slate-500 tracking-wider">
          <span>SYSTEM TIME: 2026.06.07_19:41 UTC</span>
          <span>LOCATION: EU & NORTH AMERICAN REGULATORY ZONE</span>
        </div>
      </div>
    </header>
  );
}
