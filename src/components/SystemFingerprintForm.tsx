/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React from "react";
import { Laptop, RotateCcw, ShieldCheck, KeyRound, HardDrive, Database, Settings } from "lucide-react";
import { SystemFingerprint, INITIAL_FINGERPRINT, FINGERPRINT_OPTIONS } from "../presets";

interface SystemFingerprintFormProps {
  fingerprint: SystemFingerprint;
  onChange: (fg: SystemFingerprint) => void;
}

export function SystemFingerprintForm({ fingerprint, onChange }: SystemFingerprintFormProps) {
  const handleReset = () => {
    onChange(INITIAL_FINGERPRINT);
  };

  const updateField = (field: keyof SystemFingerprint, value: string) => {
    onChange({
      ...fingerprint,
      [field]: value,
    });
  };

  return (
    <div 
      className="bg-white rounded-2xl border border-[#1E3A5F]/10 p-6 md:p-8 shadow-sm flex flex-col gap-6"
      id="system-fingerprint-form-card"
    >
      <div className="flex items-center justify-between pb-3 border-b border-[#1E3A5F]/10">
        <div className="flex items-center gap-2.5">
          <Settings className="w-5 h-5 text-deep-navy" />
          <h2 className="font-display font-bold text-base text-deep-navy uppercase tracking-tight">
            IT System Fingerprint
          </h2>
        </div>
        <button
          onClick={handleReset}
          className="inline-flex items-center gap-1 text-[11px] font-mono font-bold text-[#1E3A5F] hover:text-deep-navy bg-ice-blue border border-accent-blue/30 px-2.5 py-1 rounded-md uppercase transition-all hover:bg-[#D6ECFF]"
          title="Reset to default enterprise system setup"
        >
          <RotateCcw className="w-3 h-3" /> Reset
        </button>
      </div>

      <p className="text-xs text-slate-500 leading-relaxed">
        Establish your operational technical baseline underneath. CompliancePulse correlates these hosting, cryptographical, and protocol parameters to calculate individual compliance risk runways.
      </p>

      <div className="space-y-4">
        {/* Core Underwriting Platform */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-deep-navy/70 uppercase tracking-wider font-mono">
            Core Policy / Underwriting Platform
          </label>
          <select
            value={fingerprint.platform}
            onChange={(e) => updateField("platform", e.target.value)}
            className="w-full text-xs rounded-xl border border-[#1E3A5F]/15 bg-frost-blue p-3 text-deep-navy hover:bg-white focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent font-sans cursor-pointer transition-all shadow-2xs"
          >
            {FINGERPRINT_OPTIONS.platforms.map((p, idx) => (
              <option key={idx} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {/* Audit Log Retention */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-deep-navy/70 uppercase tracking-wider font-mono">
            Audit Log Retention Policy
          </label>
          <select
            value={fingerprint.logRetention}
            onChange={(e) => updateField("logRetention", e.target.value)}
            className="w-full text-xs rounded-xl border border-[#1E3A5F]/15 bg-frost-blue p-3 text-deep-navy hover:bg-white focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent font-sans cursor-pointer transition-all shadow-2xs"
          >
            {FINGERPRINT_OPTIONS.logRetentions.map((lr, idx) => (
              <option key={idx} value={lr}>{lr}</option>
            ))}
          </select>
        </div>

        {/* Data Hosting Region */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-deep-navy/70 uppercase tracking-wider font-mono">
            Physical Cloud Hosting Region
          </label>
          <select
            value={fingerprint.hostingLocation}
            onChange={(e) => updateField("hostingLocation", e.target.value)}
            className="w-full text-xs rounded-xl border border-[#1E3A5F]/15 bg-frost-blue p-3 text-deep-navy hover:bg-white focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent font-sans cursor-pointer transition-all shadow-2xs"
          >
            {FINGERPRINT_OPTIONS.hostingLocations.map((hl, idx) => (
              <option key={idx} value={hl}>{hl}</option>
            ))}
          </select>
        </div>

        {/* Reporting Pipeline Format */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-deep-navy/70 uppercase tracking-wider font-mono">
            Reporting Stream Format
          </label>
          <select
            value={fingerprint.reportingPipeline}
            onChange={(e) => updateField("reportingPipeline", e.target.value)}
            className="w-full text-xs rounded-xl border border-[#1E3A5F]/15 bg-frost-blue p-3 text-deep-navy hover:bg-white focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent font-sans cursor-pointer transition-all shadow-2xs"
          >
            {FINGERPRINT_OPTIONS.reportingPipelines.map((rp, idx) => (
              <option key={idx} value={rp}>{rp}</option>
            ))}
          </select>
        </div>

        {/* Encryption standard */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-[#1E3A5F] uppercase tracking-wider font-mono">
            In-flight & Resting Encryption Standard
          </label>
          <select
            value={fingerprint.encryption}
            onChange={(e) => updateField("encryption", e.target.value)}
            className="w-full text-xs rounded-xl border border-[#1E3A5F]/15 bg-frost-blue p-3 text-deep-navy hover:bg-white focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent font-sans cursor-pointer transition-all shadow-2xs"
          >
            {FINGERPRINT_OPTIONS.encryptions.map((enc, idx) => (
              <option key={idx} value={enc}>{enc}</option>
            ))}
          </select>
        </div>

        {/* Access controls */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-deep-navy/70 uppercase tracking-wider font-mono">
            Access Controls / Auth Layer
          </label>
          <select
            value={fingerprint.accessControls}
            onChange={(e) => updateField("accessControls", e.target.value)}
            className="w-full text-xs rounded-xl border border-[#1E3A5F]/15 bg-frost-blue p-3 text-deep-navy hover:bg-white focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent font-sans cursor-pointer transition-all shadow-2xs"
          >
            {FINGERPRINT_OPTIONS.accessControls.map((ac, idx) => (
              <option key={idx} value={ac}>{ac}</option>
            ))}
          </select>
        </div>

        {/* Custom secondary system attributes */}
        <div className="flex flex-col gap-1.5">
          <label className="text-[10px] font-bold text-deep-navy/70 uppercase tracking-wider font-mono">
            Secondary System Attributes
          </label>
          <input
            type="text"
            placeholder="e.g., SOAP web service layers, internal LDAP..."
            value={fingerprint.apiSchemas}
            onChange={(e) => updateField("apiSchemas", e.target.value)}
            className="w-full text-xs rounded-xl border border-[#1E3A5F]/15 bg-frost-blue p-3 text-deep-navy hover:bg-white focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent font-mono shadow-2xs"
          />
        </div>
      </div>

      <div className="bg-[#FAFBFD] p-4.5 rounded-xl border border-[#1E3A5F]/5 space-y-3">
        <span className="text-[10px] font-bold font-mono text-[#1E3A5F] block uppercase tracking-wider">
          💡 Operational Factsheets
        </span>
        <div className="text-[11px] text-[#334155] space-y-2 leading-relaxed">
          <p>
            <strong>FCA Targets:</strong> Interlocks backup structures and tests isolated, air-gapped auxiliary cold storage limits.
          </p>
          <p>
            <strong>Lloyd's Bulletins:</strong> Cross-references premium logging pipelines with minimum 10-year WORM compliance rulesets.
          </p>
          <p>
            <strong>EIOPA / DORA rules:</strong> Enforces strictly local EEA clouds boundaries and automated 2-hour API reporting webhooks.
          </p>
        </div>
      </div>
    </div>
  );
}
