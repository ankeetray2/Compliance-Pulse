/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { ShieldAlert, Server } from "lucide-react";

export function Footer() {
  return (
    <footer 
      className="w-full bg-[#0F172A] border-t border-rich-navy/20 py-8 px-6 md:px-8 mt-12 text-slate-400 text-xs font-mono" 
      id="compliance-pulse-footer"
    >
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-rich-navy flex items-center justify-center text-white border border-accent-blue/30 shadow-xs">
            <Server className="w-4 h-4 text-ice-blue" />
          </div>
          <div>
            <span className="font-bold text-white tracking-widest uppercase block text-[11px]">
              CompliancePulse Systems Inc.
            </span>
            <span className="text-slate-400 text-[10px] uppercase">
              FCA / Lloyd's / EIOPA Regulatory Alignment Core
            </span>
          </div>
        </div>

        <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-[10px] uppercase tracking-wider text-slate-400">
          <span>SEC_PULSE_ID: <span className="text-accent-blue font-bold">CP-99201-ENTERPRISE</span></span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span>Compliance Stage: <span className="text-emerald-400 font-bold">ACTIVE SECURE</span></span>
          <span className="hidden md:inline text-slate-600">|</span>
          <span>DATE: June 7, 2026</span>
        </div>
      </div>
      <div className="max-w-7xl mx-auto border-t border-slate-800 mt-6 pt-4 text-center md:text-left text-[9px] text-slate-500 uppercase tracking-widest leading-relaxed">
        This platform runs real-time deep neural model predictions in sandboxed runtime clusters to evaluate technical gap drift. Unauthorized correlation runs are subject to audit logs checks under DORA SYSC 15.12 terms.
      </div>
    </footer>
  );
}
