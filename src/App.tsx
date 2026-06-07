/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from "react";
import {
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Server,
  Calendar,
  RefreshCw,
  AlertTriangle,
  Copy,
  Terminal,
  KeyRound,
  HardDrive,
  Check,
  Sparkles,
  Layers,
  ChevronRight,
  Shield,
  GitCompare,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  History,
  CheckCircle2,
  FileText,
  Clock,
  ArrowRight,
  Info,
  Download
} from "lucide-react";
import {
  REGULATORY_PRESETS,
  INITIAL_FINGERPRINT,
  FINGERPRINT_OPTIONS,
  SystemFingerprint,
  RegulatoryPreset,
  COMPARISON_PRESETS,
  ComparisonPreset
} from "./presets";
import { Header } from "./components/Header";
import { Footer } from "./components/Footer";
import { SystemFingerprintForm } from "./components/SystemFingerprintForm";

export default function App() {
  // Primary state
  const [selectedBody, setSelectedBody] = useState<"FCA" | "Lloyd's" | "EIOPA">("FCA");
  const [fingerprint, setFingerprint] = useState<SystemFingerprint>(() => {
    const saved = localStorage.getItem("compliance_pulse_fingerprint2");
    return saved ? JSON.parse(saved) : INITIAL_FINGERPRINT;
  });
  
  // Custom or Preset Selection
  const [customDeltaText, setCustomDeltaText] = useState("");
  const [activePresetId, setActivePresetId] = useState<string>("fca-oper-resilience");
  
  // Execution Analysis states
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analyzingStage, setAnalyzingStage] = useState(0);
  const [analyzingLogs, setAnalyzingLogs] = useState<string[]>([]);
  const [analysisResult, setAnalysisResult] = useState<any>(null);
  const [analysisError, setAnalysisError] = useState<string | null>(null);
  
  // Interactive Checklist states for remediation ticket
  const [checkedCriteria, setCheckedCriteria] = useState<{ [key: string]: boolean }>({});
  const [copiedTicket, setCopiedTicket] = useState(false);

  // Side-by-Side Comparison state variables
  const [appMode, setAppMode] = useState<"single" | "compare">("single");
  const [comparePresetId, setComparePresetId] = useState<string>("comp-fca-oper-resilience");
  const [baselineText, setBaselineText] = useState("");
  const [newRuleCompareText, setNewRuleCompareText] = useState("");
  const [isComparing, setIsComparing] = useState(false);
  const [comparisonLogs, setComparisonLogs] = useState<string[]>([]);
  const [comparisonStage, setComparisonStage] = useState(0);
  const [comparisonResult, setComparisonResult] = useState<any | null>(null);
  const [compareError, setCompareError] = useState<string | null>(null);

  const [compareCheckedCriteria, setCompareCheckedCriteria] = useState<{ [key: string]: boolean }>({});
  const [compareCopiedTicket, setCompareCopiedTicket] = useState(false);

  // Sync active comparison preset automatically when comparePresetId changes
  useEffect(() => {
    const preset = COMPARISON_PRESETS.find(p => p.id === comparePresetId);
    if (preset) {
      setBaselineText(preset.baselineText);
      setNewRuleCompareText(preset.newText);
    }
  }, [comparePresetId]);

  // Sync active comparison preset when body changes
  useEffect(() => {
    const matchingComparePresets = COMPARISON_PRESETS.filter(p => p.source === selectedBody);
    if (matchingComparePresets.length > 0) {
      setComparePresetId(matchingComparePresets[0].id);
    } else {
      setComparePresetId("");
      setBaselineText("");
      setNewRuleCompareText("");
    }
  }, [selectedBody]);

  // Save fingerprint on modification
  useEffect(() => {
    localStorage.setItem("compliance_pulse_fingerprint2", JSON.stringify(fingerprint));
  }, [fingerprint]);

  // Sync active preset text or selection when body change
  useEffect(() => {
    const matchingPresets = REGULATORY_PRESETS.filter(p => p.source === selectedBody);
    if (matchingPresets.length > 0) {
      setActivePresetId(matchingPresets[0].id);
      setCustomDeltaText("");
    } else {
      setActivePresetId("");
    }
  }, [selectedBody]);

  // Handle Preset selection
  const handlePresetSelect = (preset: RegulatoryPreset) => {
    setActivePresetId(preset.id);
    setCustomDeltaText("");
  };

  const currentPreset = REGULATORY_PRESETS.find(p => p.id === activePresetId);
  const deltaTextToSubmit = customDeltaText ? customDeltaText : (currentPreset?.textDelta || "");

  // Simulated live analysis stage outputs
  useEffect(() => {
    let timer: any;
    if (isAnalyzing) {
      const logs = [
        `[INIT] Launching CompliancePulse Predictive Core v1.1.0 ...`,
        `[AUDIT] Structuring firm configuration parameters: ${fingerprint.platform}...`,
        `[AUDIT] Interfacing geographic datacenter nodes: ${fingerprint.hostingLocation}`,
        `[AUDIT] Parsing audit log retention framework: ${fingerprint.logRetention}`,
        `[AUDIT] Verifying payload data route format: ${fingerprint.reportingPipeline}`,
        `[MODEL] Aligning current encryption parameters: ${fingerprint.encryption}`,
        `[COMPUTING] Mapping rule targets to physical state matrices ...`,
        `[REMEDY] Compiling automatic Jira sprint workflow nodes...`,
        `[COMPLETED] Structural compliance gap synthesis validated.`
      ];

      timer = setInterval(() => {
        setAnalyzingStage((prev) => {
          if (prev < logs.length - 1) {
            setAnalyzingLogs((curr) => [...curr, logs[prev]]);
            return prev + 1;
          } else {
            clearInterval(timer);
            return prev;
          }
        });
      }, 300);
    } else {
      setAnalyzingStage(0);
      setAnalyzingLogs([]);
    }
    return () => clearInterval(timer);
  }, [isAnalyzing, fingerprint]);

  // API Call to trigger analysis
  const triggerBreachAnalysis = async () => {
    if (!deltaTextToSubmit.trim()) {
      setAnalysisError("Please provide a regulatory change delta text or select a standard preset.");
      return;
    }

    setIsAnalyzing(true);
    setAnalysisError(null);
    setAnalysisResult(null);
    setCheckedCriteria({});

    try {
      const response = await fetch("/api/predict", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          regBody: selectedBody,
          regDeltaText: deltaTextToSubmit,
          systemFingerprint: fingerprint
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || errData.error || "Failed with status " + response.status);
      }

      const data = await response.json();
      setAnalysisResult(data);
    } catch (err: any) {
      console.error(err);
      setAnalysisError(err.message || "An unexpected communication error occurred with the AI model.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const selectPredefinedBodyAndPreset = (body: "FCA" | "Lloyd's" | "EIOPA", id: string) => {
    setSelectedBody(body);
    setActivePresetId(id);
    setCustomDeltaText("");
  };

  // Build copyable markdown representation of the ticket
  const copyRemediationTicketAsMarkdown = () => {
    if (!analysisResult) return;
    const { ticket, delta } = analysisResult;
    const criteriaList = ticket.acceptanceCriteria.map((c: string) => `- [ ] ${c}`).join("\n");
    const docMd = `### REMEDIATION TICKET: ${ticket.title}
**Priority:** ${ticket.priority} | **Effort Estimate:** ${ticket.estimatedEffort}
**Source Directive:** ${delta.ruleReference}

**Acceptance Criteria:**
${criteriaList}

**Systemic Dependencies & Outbound Actions:**
${ticket.dependencies}

*Generated automatically via CompliancePulse on June 7, 2026*`;

    navigator.clipboard.writeText(docMd);
    setCopiedTicket(true);
    setTimeout(() => setCopiedTicket(false), 2000);
  };

  // Helper to escape values for CSV safety (handling quotes, commas, and newlines properly)
  const escapeCSV = (val: any) => {
    if (val === undefined || val === null) return "";
    const stringVal = String(val);
    if (stringVal.includes(",") || stringVal.includes('"') || stringVal.includes("\n") || stringVal.includes("\r")) {
      return `"${stringVal.replace(/"/g, '""')}"`;
    }
    return stringVal;
  };

  // Export current predictions report to CSV
  const downloadPredictionsCSV = () => {
    if (!analysisResult) return;
    const { delta, predictions } = analysisResult;

    const headers = [
      "Regulatory Authority",
      "Rule Reference",
      "Effective Date",
      "Directive Core Provision",
      "Technical Trigger",
      "Affected Infrastructure Node",
      "Current Technical State",
      "Mandated Compliance State",
      "Days to Breach",
      "Breach Severity",
      "Prediction Confidence",
      "Confidence Reason",
      "Technical Gap Reason"
    ];

    const rows = predictions.map((p: any) => [
      delta.source || selectedBody,
      delta.ruleReference,
      delta.effectiveDate,
      delta.whatChanged,
      delta.technicalTrigger,
      p.affectedSystem,
      p.currentState,
      p.requiredState,
      p.daysToBreach,
      p.breachSeverity,
      p.confidence,
      p.confidenceReason,
      p.technicalReason
    ]);

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row: any[]) => row.map(escapeCSV).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filename = `CompliancePulse_BreachReport_${(delta.source || selectedBody).replace(/[^a-zA-Z0-9]/g, "_")}_${delta.ruleReference.replace(/[^a-zA-Z0-9]/g, "_")}.csv`;
    
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export comparison drift report to CSV
  const downloadComparisonCSV = () => {
    if (!comparisonResult) return;
    const { baselineDelta, newDelta, riskEvolutionSummary, predictions } = comparisonResult;

    const headers = [
      "Regulatory Body",
      "Baseline Reference",
      "Baseline Effective Date",
      "New Reference",
      "New Effective Date",
      "Risk Evolution Summary",
      "Affected System",
      "Current Technical State",
      "Baseline Days to Breach",
      "Baseline Severity",
      "Baseline Compliance Status",
      "Baseline Technical Reason",
      "New Days to Breach",
      "New Severity",
      "New Compliance Status",
      "New Technical Reason"
    ];

    const rows = predictions.map((p: any) => [
      selectedBody,
      baselineDelta.ruleReference,
      baselineDelta.effectiveDate,
      newDelta.ruleReference,
      newDelta.effectiveDate,
      riskEvolutionSummary,
      p.affectedSystem,
      p.currentState,
      p.baselineRisk.daysToBreach,
      p.baselineRisk.severity,
      p.baselineRisk.isCompliant ? "Compliant" : "Breached",
      p.baselineRisk.technicalReason,
      p.newRisk.daysToBreach,
      p.newRisk.severity,
      p.newRisk.isCompliant ? "Compliant" : "Breached",
      p.newRisk.technicalReason
    ]);

    const csvContent = [
      headers.map(escapeCSV).join(","),
      ...rows.map((row: any[]) => row.map(escapeCSV).join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    const filename = `CompliancePulse_DriftReport_${selectedBody}_${baselineDelta.ruleReference.replace(/[^a-zA-Z0-9]/g, "_")}_vs_${newDelta.ruleReference.replace(/[^a-zA-Z0-9]/g, "_")}.csv`;
    
    link.setAttribute("href", url);
    link.setAttribute("download", filename);
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // API Call to trigger rule comparison analysis
  const triggerRuleComparison = async () => {
    if (!baselineText.trim() || !newRuleCompareText.trim()) {
      setCompareError("Please supply valid baseline (Version A) and updated (Version B) regulatory rule text.");
      return;
    }

    setIsComparing(true);
    setCompareError(null);
    setComparisonResult(null);
    setCompareCheckedCriteria({});

    const compLogs = [
      `[INIT] Spinup Version Contrast Optimizer Framework ...`,
      `[MAPPING] Analyzing baseline ruleset target coordinates (Version A)`,
      `[MAPPING] Extracting updated emergency consultation targets (Version B)`,
      `[AUDIT] Factoring current infrastructure active maps`,
      `[DRIFT] Correlating system platforms: ${fingerprint.platform}`,
      `[DRIFT] Quantifying residency restrictions: ${fingerprint.hostingLocation}`,
      `[PREDICTING] Modeling differential days-to-breach drift bounds...`,
      `[TRANSITION] Assembling sprint transition ticketry nodes...`,
      `[COMPLETED] Differential compliance baseliner analysis achieved.`
    ];

    setComparisonLogs([]);
    setComparisonStage(0);

    // Dynamic terminal stages
    let simIdx = 0;
    const interval = setInterval(() => {
      if (simIdx < compLogs.length) {
        setComparisonLogs(prev => [...prev, compLogs[simIdx]]);
        simIdx++;
      } else {
        clearInterval(interval);
      }
    }, 200);

    try {
      const response = await fetch("/api/compare", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          regBody: selectedBody,
          baselineRuleText: baselineText,
          newRuleText: newRuleCompareText,
          systemFingerprint: fingerprint
        })
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.message || errData.error || "Failed with status " + response.status);
      }

      const data = await response.json();
      setComparisonResult(data);
    } catch (err: any) {
      console.error(err);
      setCompareError(err.message || "An unexpected error occurred during comparative risk modeling.");
    } finally {
      clearInterval(interval);
      setIsComparing(false);
    }
  };

  const copyTransitionTicketAsMarkdown = () => {
    if (!comparisonResult) return;
    const { transitionTicket, baselineDelta, newDelta } = comparisonResult;
    const criteriaList = transitionTicket.acceptanceCriteria.map((c: string) => `- [ ] ${c}`).join("\n");
    const docMd = `### TRANSITION WORK UNIT: ${transitionTicket.title}
**Gap Priority:** ${transitionTicket.priority} | **Incremental Effort:** ${transitionTicket.estimatedEffort}
**Baseline Reference:** ${baselineDelta.ruleReference}
**Updated Directive Target:** ${newDelta.ruleReference}

**Transition Acceptance Criteria:**
${criteriaList}

**Delta Infrastructure Dependencies:**
${transitionTicket.deltaDependencies}

*Generated automatically via CompliancePulse on June 7, 2026*`;

    navigator.clipboard.writeText(docMd);
    setCompareCopiedTicket(true);
    setTimeout(() => setCompareCopiedTicket(false), 2000);
  };

  return (
    <div 
      className="min-h-screen bg-main-bg text-slate-700 font-sans flex flex-col relative selection:bg-accent-blue selection:text-deep-navy" 
      id="compliance-pulse-container"
    >
      {/* Decorative background gradients for the pure Azure + Stripe feel */}
      <div className="absolute top-0 left-0 right-0 h-[450px] bg-gradient-to-b from-[#EAF6FF] via-[#F4FAFF] to-transparent pointer-events-none z-0"></div>
      
      {/* Soft glowing ambient circle for OpenAI + AXA look */}
      <div className="absolute top-24 left-[15%] w-[350px] h-[350px] rounded-full bg-accent-blue/10 blur-3xl pointer-events-none z-0"></div>
      <div className="absolute top-48 right-[10%] w-[400px] h-[400px] rounded-full bg-soft-sky/15 blur-3xl pointer-events-none z-0"></div>

      {/* Mounting the Frosted Navigation Bar */}
      <Header />

      {/* Hero Section Container */}
      <section className="relative z-10 w-full pt-10 pb-4 px-6 md:px-8 max-w-7xl mx-auto" id="hero-block">
        <div className="bg-gradient-to-br from-white via-frost-blue to-soft-sky bg-opacity-90 rounded-2xl border border-rich-navy/[0.06] p-8 md:p-10 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-8 mb-4">
          <div className="max-w-3xl flex-1">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-ice-blue border border-accent-blue/40 rounded-full text-xs font-mono font-bold text-deep-navy mb-4">
              <Sparkles className="w-3.5 h-3.5 text-rich-navy" />
              INTELLIGENT COMPLIANCE AUTOMATION
            </span>
            <h2 className="font-display font-bold text-2xl md:text-3.5xl lg:text-4xl text-deep-navy tracking-tight leading-tight">
              Enterprise Predictor for Systemic Gaps
            </h2>
            <p className="text-xs md:text-[13px] text-slate-600 mt-3 font-sans leading-relaxed">
              Align critical Guidewire, Duck Creek, or legacy COBOL architectures against emerging FCA guidelines, Lloyd's cyber Bulletins, and physical EEA DORA directives. Predict exact operational breach windows and automatically synthesize sprint blueprints.
            </p>
          </div>
          <div className="hidden lg:flex flex-wrap gap-3 shrink-0">
            <div className="bg-white p-4 rounded-xl border border-[#1E3A5F]/8 shadow-2xs text-center min-w-[120px]">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Active Auditing</span>
              <span className="font-display font-black text-xl text-deep-navy block mt-1">3 Zones</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-[#1E3A5F]/8 shadow-2xs text-center min-w-[120px]">
              <span className="text-[10px] text-slate-500 font-mono uppercase block">Predict Runway</span>
              <span className="font-display font-black text-xl text-deep-navy block mt-1">Real-time</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Grid Workspace Layout */}
      <main className="relative z-10 flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 grid grid-cols-1 lg:grid-cols-12 gap-8" id="main-grid-layout">
        
        {/* Left Column (Span 4) - IT System Fingerprint Form */}
        <section className="lg:col-span-4 flex flex-col gap-6" id="sidebar-fingerprint-section">
          {/* Form component */}
          <SystemFingerprintForm 
            fingerprint={fingerprint} 
            onChange={setFingerprint} 
          />
        </section>

        {/* Right Column (Span 8) - Work Area / Dashboards */}
        <section className="lg:col-span-8 flex flex-col gap-6" id="workspace-action-section">

          {/* SaaS Switcher - Direct Predictor vs Version Baseliner */}
          <div className="bg-white rounded-2xl border border-rich-navy/10 p-1.5 shadow-xs flex gap-2" id="pulse-mode-switcher">
            <button
              onClick={() => {
                setAppMode("single");
                setAnalysisResult(null);
                setComparisonResult(null);
                setCompareError(null);
                setAnalysisError(null);
              }}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-sans font-semibold tracking-tight uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                appMode === "single"
                  ? "bg-deep-navy text-white shadow-md shadow-deep-navy/10"
                  : "text-slate-500 hover:text-deep-navy hover:bg-frost-blue"
              }`}
            >
              <ShieldAlert className="w-4 h-4" />
              Direct Breach Predictor
            </button>
            <button
              onClick={() => {
                setAppMode("compare");
                setAnalysisResult(null);
                setComparisonResult(null);
                setCompareError(null);
                setAnalysisError(null);
                const matching = COMPARISON_PRESETS.filter(p => p.source === selectedBody);
                if (matching.length > 0) {
                  setComparePresetId(matching[0].id);
                }
              }}
              className={`flex-1 py-3 px-4 rounded-xl text-xs font-sans font-semibold tracking-tight uppercase flex items-center justify-center gap-2 transition-all cursor-pointer ${
                appMode === "compare"
                  ? "bg-deep-navy text-white shadow-md shadow-deep-navy/10"
                  : "text-slate-500 hover:text-deep-navy hover:bg-frost-blue"
              }`}
            >
              <GitCompare className="w-4 h-4" />
              Version Baseliner
            </button>
          </div>

          {/* Main Action Form and Presets Selection */}
          <div className="bg-white rounded-2xl border border-rich-navy/10 p-6 md:p-8 shadow-sm flex flex-col gap-6">
            <div>
              <span className="text-[#1E3A5F] font-mono text-xs tracking-wider font-extrabold uppercase block mb-1">
                [{appMode === "single" ? "FRAMEWORK INTERSECTION MONITOR" : "VERSION PROGRESSION GAPS"}]
              </span>
              <h2 className="font-display font-medium text-xl md:text-2xl tracking-tight text-deep-navy">
                {appMode === "single" ? "Select Regulatory Consultation Delta" : "Continuous Regulatory Baselining"}
              </h2>
              <p className="text-xs text-slate-500 mt-1.5 leading-relaxed">
                {appMode === "single" 
                  ? "Cross-verify your operational blueprint against newly proposed framework directives to identify critical compliance gaps."
                  : "Contrast legacy policy baselines with incoming emergency supervisory guidelines to evaluate required operational transitions."}
              </p>
            </div>

            {/* Framework Filter Tags */}
            <div className="flex grid grid-cols-3 border-b border-[#1E3A5F]/10" id="regulatory-framework-tabs">
              {(["FCA", "Lloyd's", "EIOPA"] as const).map((body) => (
                <button
                  key={body}
                  onClick={() => setSelectedBody(body)}
                  className={`py-3 text-xs font-semibold tracking-wider uppercase transition-all font-sans cursor-pointer text-center relative ${
                    selectedBody === body
                      ? "text-deep-navy font-bold"
                      : "text-slate-400 hover:text-slate-600"
                  }`}
                >
                  {body} Authority
                  {selectedBody === body && (
                    <div className="absolute bottom-0 left-1/4 right-1/4 h-[3px] bg-deep-navy rounded-full"></div>
                  )}
                </button>
              ))}
            </div>

            {appMode === "single" ? (
              <>
                {/* Single mode presets list style */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4" id="presets-grid">
                  {REGULATORY_PRESETS.filter(p => p.source === selectedBody).map((preset) => (
                    <button
                      key={preset.id}
                      onClick={() => handlePresetSelect(preset)}
                      className={`text-left p-4.5 rounded-2xl border transition-all text-xs flex flex-col gap-2.5 cursor-pointer shadow-2xs ${
                        activePresetId === preset.id && !customDeltaText
                          ? "border-accent-blue bg-frost-blue text-deep-navy ring-1 ring-accent-blue/30"
                          : "border-[#1E3A5F]/8 bg-white text-slate-600 hover:border-[#1E3A5F]/20 hover:bg-[#FAFBFD]"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-mono text-[9px] bg-ice-blue border border-accent-blue/40 text-deep-navy px-2 py-0.5 rounded-md font-bold tracking-wider">
                          {preset.ruleReference}
                        </span>
                        {activePresetId === preset.id && !customDeltaText && (
                          <span className="w-2 h-2 rounded-full bg-accent-blue animate-pulse"></span>
                        )}
                      </div>
                      <span className="font-display font-semibold tracking-tight text-deep-navy text-[13px]">
                        {preset.title}
                      </span>
                      <span className="text-slate-500 font-sans leading-relaxed text-[11px] line-clamp-2">
                        {preset.description}
                      </span>
                    </button>
                  ))}
                  
                  {/* Custom delta text option item */}
                  <button
                    onClick={() => {
                      setActivePresetId("");
                      setCustomDeltaText(customDeltaText || "Underwriting models must support real-time cryptographic audit trails...");
                    }}
                    className={`text-left p-4.5 rounded-2xl border transition-all text-xs flex flex-col justify-center items-center gap-1.5 min-h-[110px] cursor-pointer shadow-2xs ${
                      customDeltaText
                        ? "border-accent-blue bg-frost-blue text-[#0F172A] ring-1 ring-accent-blue/30"
                        : "border-[#1E3A5F]/10 border-dashed bg-transparent text-slate-500 hover:border-[#1E3A5F]/20 hover:bg-white"
                    }`}
                  >
                    <div className="text-center font-sans">
                      <span className="font-semibold block tracking-wide text-xs text-deep-navy">
                        [+] PASTE RAW DIRECTIVE TEXT
                      </span>
                      <span className="text-[10px] text-slate-400 block mt-1 uppercase">Custom Operational Brief</span>
                    </div>
                  </button>
                </div>

                {/* Directive Delta Edit Box */}
                <div className="flex flex-col gap-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold font-mono tracking-wider text-slate-500 uppercase">
                      {customDeltaText ? "Custom Directive Delta Editor" : `DIRECTIVE RAW TEXT (${currentPreset?.ruleReference || selectedBody})`}
                    </label>
                    {customDeltaText && (
                      <button
                        onClick={() => {
                          setCustomDeltaText("");
                          const firstPreset = REGULATORY_PRESETS.find(p => p.source === selectedBody);
                          if (firstPreset) setActivePresetId(firstPreset.id);
                        }}
                        className="text-[10px] text-rich-navy hover:underline uppercase tracking-wider font-mono font-bold cursor-pointer"
                      >
                        Reset to standard library
                      </button>
                    )}
                  </div>
                  <textarea
                    value={customDeltaText ? customDeltaText : (currentPreset?.textDelta || "")}
                    onChange={(e) => {
                      setCustomDeltaText(e.target.value);
                      setActivePresetId("");
                    }}
                    placeholder="Paste regulatory policies, consultative papers, or supervisory circular guidelines here..."
                    className="w-full text-xs font-mono rounded-xl border border-[#1E3A5F]/15 bg-frost-blue p-4 min-h-[130px] text-deep-navy leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all shadow-2xs"
                  />
                </div>

                {/* Submitting Buttons row */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-mono tracking-wide uppercase flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    Secure Sandbox Pipeline
                  </span>
                  <button
                    onClick={triggerBreachAnalysis}
                    disabled={isAnalyzing}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-deep-navy hover:bg-rich-navy disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold font-sans tracking-tight text-xs rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
                    id="predict-breach-button"
                  >
                    {isAnalyzing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                        Analyzing system parameters...
                      </>
                    ) : (
                      <>
                        <ShieldAlert className="w-4 h-4 text-white" />
                        Predict Compliance Breach
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Baselining Multi-Version selection */}
                <div className="flex flex-col gap-3">
                  <div>
                    <span className="text-deep-navy font-mono text-[10px] tracking-wider font-bold uppercase block mb-1">
                      [COMPARATIVE RISK SCENARIOS]
                    </span>
                    <h3 className="font-sans font-bold text-xs text-slate-700 uppercase tracking-tight">
                      Compare Historical Standards vs Modern Updates
                    </h3>
                  </div>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3.5" id="compare-presets-grid">
                    {COMPARISON_PRESETS.filter(p => p.source === selectedBody).map((preset) => (
                      <button
                        key={preset.id}
                        onClick={() => setComparePresetId(preset.id)}
                        className={`text-left p-3.5 rounded-xl border transition-all text-xs flex flex-col gap-2.5 cursor-pointer shadow-2xs ${
                          comparePresetId === preset.id
                            ? "border-accent-blue bg-frost-blue text-deep-navy ring-1 ring-accent-blue/30"
                            : "border-[#1E3A5F]/8 bg-white text-slate-600 hover:border-[#1E3A5F]/20 hover:bg-[#FAFBFD]"
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-[9px] bg-ice-blue border border-accent-blue/40 text-deep-navy px-1.5 py-0.5 rounded-md font-bold tracking-wider">
                            {preset.source} HISTORIC
                          </span>
                        </div>
                        <span className="font-display font-semibold tracking-tight text-deep-navy text-[11px] line-clamp-2 leading-snug">
                          {preset.title}
                        </span>
                      </button>
                    ))}
                    
                    <button
                      onClick={() => {
                        setComparePresetId("");
                        setBaselineText("");
                        setNewRuleCompareText("");
                      }}
                      className={`text-left p-3.5 rounded-xl border transition-all text-xs flex flex-col justify-center items-center gap-1 min-h-[90px] border-dashed shadow-2xs ${
                        comparePresetId === ""
                          ? "border-accent-blue bg-frost-blue text-deep-navy ring-1 ring-accent-blue/30"
                          : "border-[#1E3A5F]/10 bg-transparent text-slate-500 hover:border-[#1E3A5F]/20 hover:bg-white"
                      }`}
                    >
                      <span className="font-sans font-bold text-[10px] text-deep-navy uppercase">
                        [+] CUSTOM SETUP
                      </span>
                      <span className="text-[9px] text-slate-400 uppercase">Input manual diff texts</span>
                    </button>
                  </div>
                </div>

                {/* Side-by-side comparing fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Baseline Rule A */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold font-mono tracking-wider text-slate-500 uppercase">
                        Baseline Version (A) Rule
                      </label>
                      {comparePresetId && (
                        <span className="text-[9px] text-[#1E3A5F] font-mono">
                          PRESET ACTIVE
                        </span>
                      )}
                    </div>
                    <textarea
                      value={baselineText}
                      onChange={(e) => {
                        setBaselineText(e.target.value);
                        setComparePresetId("");
                      }}
                      placeholder="Input historical baseline regulatory mandate..."
                      className="w-full text-xs font-mono rounded-xl border border-[#1E3A5F]/15 bg-frost-blue p-4 min-h-[130px] text-deep-navy leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all shadow-2xs"
                    />
                  </div>

                  {/* New Target Rule B */}
                  <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                      <label className="text-[10px] font-bold font-mono tracking-wider text-deep-navy uppercase">
                        Updated Version (B) Rule
                      </label>
                    </div>
                    <textarea
                      value={newRuleCompareText}
                      onChange={(e) => {
                        setNewRuleCompareText(e.target.value);
                        setComparePresetId("");
                      }}
                      placeholder="Input incoming updated supervisory guideline..."
                      className="w-full text-xs font-mono rounded-xl border border-[#1E3A5F]/15 bg-frost-blue p-4 min-h-[130px] text-deep-navy leading-relaxed focus:outline-none focus:ring-2 focus:ring-accent-blue focus:border-transparent transition-all shadow-2xs"
                    />
                  </div>
                </div>

                {/* Run comparison evaluate row */}
                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400 font-mono tracking-wide uppercase flex items-center gap-1">
                    <Info className="w-3.5 h-3.5 text-slate-400" />
                    Multi-Version Diff Analyzer
                  </span>
                  <button
                    onClick={triggerRuleComparison}
                    disabled={isComparing}
                    className="inline-flex items-center gap-2 px-6 py-3 bg-deep-navy hover:bg-rich-navy disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold font-sans tracking-tight text-xs rounded-xl transition-all shadow-sm hover:shadow-md cursor-pointer"
                    id="calculate-comparison-button"
                  >
                    {isComparing ? (
                      <>
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
                        Calculating compliance drift...
                      </>
                    ) : (
                      <>
                        <GitCompare className="w-4 h-4 text-white" />
                        Evaluate Compliance Drift
                      </>
                    )}
                  </button>
                </div>
              </>
            )}
          </div>

          {/* DIAGNOSTIC AUDITING MONITOR TERM - ICE BLUE SAAS STYLING */}
          {isAnalyzing && (
            <div className="bg-white rounded-2xl border border-accent-blue/40 p-6 font-mono text-xs flex flex-col gap-4 shadow-sm" id="loading-terminal">
              <div className="flex items-center justify-between border-b border-[#1E3A5F]/10 pb-2.5">
                <span className="flex items-center gap-2.5 text-deep-navy font-bold font-sans">
                  <Terminal className="text-rich-navy w-4.5 h-4.5 animate-pulse" />
                  CompliancePulse Active Audit Pipe
                </span>
                <span className="text-[9px] bg-ice-blue border border-accent-blue/30 text-rich-navy font-bold px-2 py-0.5 rounded">RUNNING DIAGNOSTICS</span>
              </div>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto text-slate-600 font-mono text-left scrollbar-thin scrollbar-thumb-accent-blue/20">
                {analyzingLogs.map((log, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-slate-400 select-none">[{index + 1}]</span>
                    <span>{log}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-[#1E3A5F] animate-pulse font-bold mt-1 text-[11px]">
                  <span>&gt; Merging platform fingerprint coordinates against neural predictive weights...</span>
                </div>
              </div>
            </div>
          )}

          {isComparing && (
            <div className="bg-white rounded-2xl border border-accent-blue/40 p-6 font-mono text-xs flex flex-col gap-4 shadow-sm" id="loading-compare-terminal">
              <div className="flex items-center justify-between border-b border-[#1E3A5F]/10 pb-2.5">
                <span className="flex items-center gap-2.5 text-deep-navy font-bold font-sans">
                  <Terminal className="text-rich-navy w-4.5 h-4.5 animate-pulse" />
                  Continuous Baseline Progression Audit
                </span>
                <span className="text-[9px] bg-ice-blue border border-accent-blue/30 text-rich-navy font-bold px-2 py-0.5 rounded">COMPARE ACTIVE</span>
              </div>
              <div className="space-y-1.5 max-h-[140px] overflow-y-auto text-slate-600 font-mono text-left scrollbar-thin scrollbar-thumb-accent-blue/20">
                {comparisonLogs.map((log, index) => (
                  <div key={index} className="flex gap-2">
                    <span className="text-slate-400 select-none">[{index + 1}]</span>
                    <span>{log}</span>
                  </div>
                ))}
                <div className="flex items-center gap-2 text-[#1E3A5F] animate-pulse font-bold mt-1 text-[11px]">
                  <span>&gt; Generating differential risk delta between Baseline (A) and Target Update (B)...</span>
                </div>
              </div>
            </div>
          )}

          {/* SINGLE MODE REDIRECT ACTION CHANNELS ERROR */}
          {analysisError && (
            <div className="bg-[#FAFBFD] border-2 border-red-200 rounded-2xl p-6 flex flex-col gap-4" id="error-container">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-red-100 rounded-xl text-red-600">
                  <AlertTriangle className="w-5.5 h-5.5 shrink-0" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-deep-navy uppercase text-sm">Regulatory Engine Diagnostic Error</h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {analysisError}
                  </p>
                </div>
              </div>

              {analysisError.includes("GEMINI_API_KEY") && (
                <div className="bg-white border border-[#1E3A5F]/15 rounded-xl p-4 text-xs text-slate-600 flex flex-col gap-2.5 shadow-2xs">
                  <span className="font-mono font-bold text-[10px] uppercase tracking-wider text-deep-navy flex items-center gap-1.5">
                    <KeyRound className="w-4.5 h-4.5 text-accent-blue" />
                    Supplying your Secret API Credentials:
                  </span>
                  <div className="space-y-1.5 list-decimal pl-1 font-sans text-slate-500 text-[11px]">
                    <p>1. Open the operational <strong className="text-deep-navy">Secrets</strong> engine panel inside the workspace settings (bottom-left area).</p>
                    <p>2. Complete the key-value parameters map by defining a <strong className="font-mono text-deep-navy">GEMINI_API_KEY</strong> attribute.</p>
                    <p>3. Input a standard Google Gemini API credential and initiate the prediction matrix once more.</p>
                  </div>
                </div>
              )}
            </div>
          )}

          {compareError && (
            <div className="bg-[#FAFBFD] border-2 border-red-200 rounded-2xl p-6 flex flex-col gap-4" id="compare-error-container">
              <div className="flex items-start gap-4">
                <div className="p-2 bg-red-100 rounded-xl text-red-600">
                  <AlertTriangle className="w-5.5 h-5.5 shrink-0" />
                </div>
                <div>
                  <h3 className="font-sans font-bold text-deep-navy uppercase text-sm">Differential Comparator Engine Error</h3>
                  <p className="text-xs text-slate-600 mt-1.5 leading-relaxed">
                    {compareError}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* SINGLE MODE - RESULTS DASHBOARD PANEL */}
          {analysisResult && (
            <div className="flex flex-col gap-6" id="predictions-report-container">
              
              {/* Premium Report Header */}
              <div className="bg-white rounded-2xl border border-rich-navy/10 overflow-hidden shadow-sm">
                <div className="p-6 bg-gradient-to-r from-frost-blue to-white border-b border-rich-navy/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex flex-col gap-1.5">
                    <span className="text-[9px] font-bold tracking-wider font-mono bg-ice-blue border border-accent-blue/30 text-deep-navy rounded px-2 py-0.5 uppercase self-start">
                      CRUCIAL SEGREGATION GAP REPORT
                    </span>
                    <h3 className="font-display font-semibold text-lg md:text-xl text-deep-navy leading-snug">
                      Compliance Prediction Draft: {analysisResult.delta.ruleReference}
                    </h3>
                  </div>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 md:gap-4 shrink-0">
                    <div className="flex items-center gap-1.5 font-mono text-xs text-slate-500">
                      <Calendar className="w-4 h-4 text-accent-blue" />
                      Mandate Target: {analysisResult.delta.effectiveDate}
                    </div>
                    <button
                      id="download-predictions-csv"
                      onClick={downloadPredictionsCSV}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-deep-navy hover:bg-[#1E3A5F] text-white rounded-lg text-xs font-sans font-bold uppercase transition-all shadow-xs cursor-pointer select-none"
                      title="Download Breach Predictions Report as CSV"
                    >
                      <Download className="w-3.5 h-3.5 text-white/90" />
                      Download CSV
                    </button>
                  </div>
                </div>

                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6 bg-white">
                  <div className="space-y-1.5">
                     <span className="text-[10px] text-slate-400 font-mono block uppercase font-extrabold tracking-wider">
                       Directive Core Provision
                     </span>
                     <p className="text-xs text-slate-600 leading-relaxed font-sans">
                       {analysisResult.delta.whatChanged}
                     </p>
                  </div>
                  <div className="space-y-1.5">
                     <span className="text-[10px] text-slate-400 font-mono block uppercase font-extrabold tracking-wider">
                       Supervisory Technical Constraint
                     </span>
                     <p className="text-xs text-deep-navy font-mono bg-[#FAFBFD] border border-accent-blue/30 rounded-lg px-3 py-2 inline-block uppercase tracking-wide font-bold">
                       {analysisResult.delta.technicalTrigger}
                     </p>
                  </div>
                </div>
              </div>

              {/* Node Gaps Countdown Cards */}
              <div className="space-y-6" id="prediction-cards-container">
                {analysisResult.predictions.map((p: any, idx: number) => {
                  const severityConfig = {
                    Critical: {
                      accent: "text-red-600 bg-red-50 border-red-200",
                      badge: "text-red-700 bg-red-50 border-red-200"
                    },
                    High: {
                      accent: "text-amber-600 bg-amber-50 border-amber-250",
                      badge: "text-amber-700 bg-amber-50 border-amber-200"
                    },
                    Medium: {
                      accent: "text-yellow-600 bg-yellow-50 border-yellow-250",
                      badge: "text-yellow-700 bg-yellow-50 border-yellow-200"
                    },
                    Low: {
                      accent: "text-[#1E3A5F] bg-blue-50 border-blue-150",
                      badge: "text-[#1E3A5F] bg-blue-50 border-blue-150"
                    }
                  }[p.breachSeverity as string] || { accent: "text-slate-700 bg-[#FAFBFD] border-slate-100", badge: "text-slate-600 bg-slate-50 border-slate-100" };

                  return (
                    <div key={idx} className="bg-white rounded-2xl border border-rich-navy/10 p-6 shadow-sm space-y-6">
                      
                      {/* Node Gap Header Flex Bar */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#1E3A5F]/10 pb-4">
                        <div className="flex items-center gap-3">
                          <span className="p-2.5 bg-frost-blue text-deep-navy border border-accent-blue/20 rounded-xl">
                            <Server className="w-4 h-4" />
                          </span>
                          <div>
                            <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-bold font-mono">
                              AFFECTED INFRASTRUCTURE TARGET NODE
                            </span>
                            <h4 className="font-display font-semibold text-deep-navy text-[15px] tracking-tight">
                              {p.affectedSystem}
                            </h4>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 self-start sm:self-center">
                          <span className={`px-2.5 py-1 text-[10px] font-bold font-mono uppercase tracking-wider rounded-lg border ${severityConfig.badge}`}>
                            {p.breachSeverity} Priority
                          </span>
                          <span className="px-2.5 py-1 text-[10px] font-mono text-slate-500 border border-slate-100 bg-[#FAFBFD] rounded-lg uppercase">
                            Confidence: {p.confidence}
                          </span>
                        </div>
                      </div>

                      {/* Technical Comparison Block Container */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="p-4 bg-frost-blue rounded-xl border border-rich-navy/5 flex flex-col gap-1.5">
                          <span className="text-[10px] text-slate-500 tracking-wider uppercase font-bold font-sans">
                            Current Configuration
                          </span>
                          <p className="text-xs text-slate-800 font-mono tracking-tight leading-relaxed">
                            {p.currentState}
                          </p>
                        </div>

                        <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 flex flex-col gap-1.5">
                          <span className="text-[10px] text-emerald-800 tracking-wider uppercase font-bold font-sans">
                            Mandated Operational Compliance State
                          </span>
                          <p className="text-xs text-emerald-900 font-mono tracking-tight leading-relaxed">
                            {p.requiredState}
                          </p>
                        </div>
                      </div>

                      {/* Giant Modern Light-Themed Countdown Board */}
                      <div className="bg-[#FAFBFD] rounded-xl border border-[#1E3A5F]/8 p-6 grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                        {/* Huge typography countdown with Stripe styling */}
                        <div className="md:col-span-4 flex flex-col items-center justify-center text-center p-3 border-b md:border-b-0 md:border-r border-[#1E3A5F]/10">
                          <span className="text-deep-navy text-6xl md:text-7xl lg:text-8xl font-display font-bold leading-none tracking-tighter select-none">
                            {p.daysToBreach}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono tracking-wider uppercase font-bold mt-2">
                            Days to potential breach
                          </span>
                        </div>

                        {/* Analysis reasoning details block */}
                        <div className="md:col-span-8 flex flex-col gap-2.5 text-left">
                          <span className="text-deep-navy font-mono text-[10px] font-extrabold uppercase tracking-widest block">
                            [PHYSICAL SYSTEMS GAP OUTBREAK FORECAST]
                          </span>
                          <p className="text-xs text-slate-600 leading-relaxed font-sans">
                            {p.technicalReason}
                          </p>
                          <p className="text-[10px] text-slate-400 font-sans italic mt-1 uppercase tracking-tight">
                            Confidence justification: {p.confidenceReason}
                          </p>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* REMEDIATION TICKETS WORK UNIT - ENTERPRISE STRIPE ACCENTS */}
              <div className="bg-white rounded-2xl border-rich-navy/10 overflow-hidden shadow-sm" id="remediation-ticket-section">
                
                {/* Upper banner container */}
                <div className="p-5 bg-gradient-to-r from-frost-blue to-white border-b border-[#1E3A5F]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 bg-accent-blue rounded-full shadow-[0_0_8px_#4DA3FF]"></div>
                    <span className="text-xs font-sans font-bold tracking-tight uppercase text-deep-navy">
                      Autonomous Active Remediation Action Blueprint
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={copyRemediationTicketAsMarkdown}
                      className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-accent-blue/30 text-deep-navy bg-ice-blue hover:bg-[#D6ECFF] rounded-lg text-[10px] font-bold tracking-wider font-sans uppercase transition-all cursor-pointer"
                    >
                      {copiedTicket ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          [Copied Outline]
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5 text-rich-navy" />
                          Copy Ticket Outline
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Ticket fields detail */}
                <div className="p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-frost-blue p-5 rounded-xl border border-accent-blue/15">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider block mb-1">
                        SPRINT ATOMIC TARGETS / ENGINEER WORK UNIT
                      </span>
                      <h4 className="font-display font-bold text-[#0F172A] text-base uppercase leading-tight tracking-tight">
                        {analysisResult.ticket.title}
                      </h4>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <span className="px-3 py-1.5 bg-red-100 text-red-700 border border-red-200 text-[10px] rounded-lg font-mono font-bold uppercase tracking-wide">
                        {analysisResult.ticket.priority}
                      </span>
                      <span className="px-3 py-1.5 bg-white text-slate-700 border border-slate-200 text-[10px] rounded-lg font-mono font-bold uppercase tracking-wide">
                        {analysisResult.ticket.estimatedEffort}
                      </span>
                    </div>
                  </div>

                  {/* Criteria checklists */}
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono font-bold tracking-wider uppercase block mb-3">
                      [ENGINEERING WORK CHECKPOINTS / DEFINITION OF COMPLIANCE TO VERIFY]
                    </span>
                    
                    <div className="space-y-2">
                      {analysisResult.ticket.acceptanceCriteria.map((criterion: string, i: number) => {
                        const ckId = `criterion-${i}`;
                        const isChecked = !!checkedCriteria[ckId];
                        return (
                          <div
                            key={i}
                            onClick={() => setCheckedCriteria({ ...checkedCriteria, [ckId]: !isChecked })}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-4 select-none text-xs leading-relaxed font-sans ${
                              isChecked
                                ? "border-emerald-200 bg-emerald-50/40 text-emerald-700 line-through decoration-emerald-500/50"
                                : "border-[#1E3A5F]/10 bg-white text-slate-700 hover:border-[#1E3A5F]/20"
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                              isChecked ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white"
                            }`}>
                              {isChecked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                            </div>
                            <span>{criterion}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Outbound system dependencies warning */}
                  <div className="bg-[#FAFBFD] border border-[#1E3A5F]/10 rounded-xl p-5 flex gap-3 text-xs font-sans shadow-2xs">
                    <div className="w-2 h-2 rounded-full bg-accent-blue mt-1.5 shrink-0 animate-pulse"></div>
                    <div>
                      <span className="font-mono font-bold text-slate-600 block uppercase tracking-wider text-[10px] mb-1">
                        INTEGRAL SYSTEM DEVIATION DEPENDENCIES
                      </span>
                      <p className="text-slate-600 leading-relaxed font-sans text-xs">
                        {analysisResult.ticket.dependencies}
                      </p>
                    </div>
                  </div>

                  {/* Backlog trigger */}
                  <button 
                    onClick={() => {
                      alert("Remediation sprint priority synchronised to corporate development board.");
                    }}
                    className="w-full py-4.5 bg-[#0F172A] hover:bg-rich-navy text-white font-bold uppercase rounded-xl text-xs tracking-wide shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <span>PUSH WORK ITEMS TO DEVELOPMENT BACKLOG</span>
                    <ChevronRight className="w-4.5 h-4.5" />
                  </button>

                </div>
              </div>

            </div>
          )}

          {/* COMPASS REPORT RESULTS SYSTEM */}
          {comparisonResult && (
            <div className="flex flex-col gap-6" id="comparison-report-dashboard">
              
              {/* High level visual comparison metrics */}
              <div className="bg-white rounded-2xl border border-rich-navy/10 p-6 shadow-sm">
                <div className="flex flex-col md:flex-row items-center justify-between gap-6 border-b border-[#1E3A5F]/10 pb-6">
                  <div>
                    <span className="text-[10px] bg-ice-blue border border-accent-blue/30 text-deep-navy px-2.5 py-1 rounded-md font-mono font-bold uppercase tracking-wider">
                      SUPERVISORY REGULATION DRIFT ANALYSIS
                    </span>
                    <h3 className="font-display font-semibold text-xl md:text-2xl mt-1.5 text-deep-navy uppercase">
                      {selectedBody} Version Gap Matrix
                    </h3>
                    <p className="text-xs text-slate-500 mt-1.5 font-sans leading-snug">
                      Comparing: <strong>{comparisonResult.baselineDelta.ruleReference}</strong> vs <strong>{comparisonResult.newDelta.ruleReference}</strong>
                    </p>
                  </div>

                  {/* Dual Gauge count indicator with Export Action */}
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-6">
                    <button
                      id="download-comparison-csv"
                      onClick={downloadComparisonCSV}
                      className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 bg-deep-navy hover:bg-[#1E3A5F] text-white rounded-lg text-xs font-sans font-bold uppercase transition-all shadow-xs cursor-pointer select-none"
                      title="Download Drift Comparison Report as CSV"
                    >
                      <Download className="w-3.5 h-3.5 text-white/90" />
                      Download CSV
                    </button>

                    <div className="flex gap-6 items-center justify-center">
                      <div className="text-center">
                        <span className="block text-[10px] uppercase text-slate-400 font-mono font-bold font-semibold tracking-wider">A: Baseline Runway</span>
                        <div className="mt-1 flex items-baseline justify-center gap-1">
                          <span className="text-lg font-mono text-emerald-600 font-bold">
                            {comparisonResult.baselineTotalDays === 180 ? "180+ Days" : `${comparisonResult.baselineTotalDays} Days`}
                          </span>
                          <span className="text-[9px] uppercase font-mono text-emerald-600/70">Compliant</span>
                        </div>
                      </div>

                      <ArrowLeftRight className="w-4.5 h-4.5 text-slate-300" />

                      <div className="text-center">
                        <span className="block text-[10px] uppercase text-slate-400 font-mono font-bold font-semibold tracking-wider">B: Updated Target Runway</span>
                        <div className="mt-1 flex items-baseline justify-center gap-1">
                          <span className="text-lg font-mono text-red-600 font-bold animate-pulse">
                            {comparisonResult.newTotalDays} Days
                          </span>
                          <span className="text-[9px] uppercase font-mono text-red-600/70">Imminent Breach</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Left and right text elements explanations side by side */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                  <div className="bg-frost-blue p-4.5 rounded-xl border border-rich-navy/5 space-y-1">
                    <span className="text-[9px] text-[#1E3A5F] font-mono uppercase tracking-wider font-bold block mb-1">
                      Baseline Target Rules (A)
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans">
                      {comparisonResult.baselineDelta.whatChanged}
                    </p>
                    <div className="pt-2 text-[9px] text-[#1E3A5F] font-mono uppercase">
                      Rule trigger: {comparisonResult.baselineDelta.technicalTrigger}
                    </div>
                  </div>

                  <div className="bg-red-50/30 p-4.5 rounded-xl border border-red-100 space-y-1">
                    <span className="text-[9px] text-red-700 font-mono uppercase tracking-wider font-bold block mb-1">
                      Updated Emergent Rules (B)
                    </span>
                    <p className="text-xs text-slate-600 leading-relaxed font-sans">
                      {comparisonResult.newDelta.whatChanged}
                    </p>
                    <div className="pt-2 text-[9px] text-red-600 font-mono uppercase">
                      Update trigger: {comparisonResult.newDelta.technicalTrigger}
                    </div>
                  </div>
                </div>

                {/* Verdict summary banner */}
                <div className="bg-ice-blue p-4.5 rounded-xl border border-accent-blue/30 mt-6 flex gap-3 text-xs leading-relaxed text-deep-navy shadow-2xs">
                  <Sparkles className="w-4 h-4 text-accent-blue shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <strong className="text-deep-navy uppercase font-mono block text-[10px] tracking-wider mb-1">
                      AI COMPLIANCE DRIFT SUMMARY
                    </strong>
                    <span className="font-sans text-slate-700">
                      {comparisonResult.riskEvolutionSummary}
                    </span>
                  </div>
                </div>
              </div>

              {/* Side-by-Side node level results dashboard listing */}
              <div className="space-y-6">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-accent-blue" />
                  <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-500">
                    NODE-LEVEL RISK PROFILE DRIFT EVALUATION
                  </span>
                </div>

                {comparisonResult.predictions.map((p: any, idx: number) => {
                  return (
                    <div key={idx} className="bg-white rounded-2xl border border-rich-navy/10 overflow-hidden shadow-sm flex flex-col">
                      
                      {/* Node Identification Header */}
                      <div className="bg-[#FAFBFD] border-b border-[#1E3A5F]/10 px-6 py-4 flex items-center justify-between">
                        <div>
                          <span className="text-[9px] font-mono text-slate-500 uppercase font-bold tracking-wider">
                            ACTIVE SYSTEM COMPONENT
                          </span>
                          <h4 className="font-display font-semibold text-deep-navy text-[15px]">
                            {p.affectedSystem}
                          </h4>
                        </div>
                        <div className="text-right font-mono text-xs">
                          <span className="text-slate-400 block text-[9px] uppercase">FINGERPRINT</span>
                          <span className="text-slate-700 p-1 rounded font-semibold text-[11px] bg-white border border-slate-100">{p.currentState}</span>
                        </div>
                      </div>

                      {/* Parallel version comparative grid cards */}
                      <div className="grid grid-cols-1 md:grid-cols-2 border-b border-slate-100">
                        {/* Baseline A assessment */}
                        <div className="p-6 border-r border-[#1E3A5F]/10 flex flex-col gap-4 bg-frost-blue/40">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-slate-500 font-bold uppercase tracking-wider">
                              [A] BASELINE ASSESSMENT
                            </span>
                            <span className={`px-2 py-0.5 text-[9px] font-mono font-bold uppercase rounded ${
                              p.baselineRisk.isCompliant 
                                ? "text-emerald-700 bg-emerald-50 border border-emerald-200" 
                                : "text-amber-700 bg-amber-50 border border-amber-200"
                            }`}>
                              {p.baselineRisk.isCompliant ? "COMPLIANT" : "NON-COMPLIANT"}
                            </span>
                          </div>

                          <div className="bg-white p-4.5 rounded-xl border border-slate-100 font-sans text-xs">
                            <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-100">
                              <span className="text-slate-400 text-[10px] font-mono uppercase">BREACH RUNWAY</span>
                              <span className="text-emerald-600 font-bold text-xs tracking-tight">
                                {p.baselineRisk.daysToBreach === 180 ? "180+ Days" : `${p.baselineRisk.daysToBreach} Days`}
                              </span>
                            </div>
                            <p className="text-slate-600 text-[11px] leading-relaxed">
                              {p.baselineRisk.technicalReason}
                            </p>
                          </div>
                        </div>

                        {/* Updated B assessment */}
                        <div className="p-6 flex flex-col gap-4 bg-red-50/10">
                          <div className="flex items-center justify-between">
                            <span className="text-[10px] font-mono text-red-800 font-bold uppercase tracking-wider">
                              [B] INCOMING REGULATION ASSESSMENT
                            </span>
                            <span className={`px-2 py-0.5 text-[9px] rounded font-mono font-bold uppercase ${
                              p.newRisk.isCompliant 
                                ? "text-emerald-700 bg-emerald-50 border border-emerald-200" 
                                : "text-red-700 bg-red-50 border border-red-200 animate-pulse"
                            }`}>
                              {p.newRisk.isCompliant ? "COMPLIANT" : "BREACH DETECTED"}
                            </span>
                          </div>

                          <div className="bg-white p-4.5 rounded-xl border border-slate-100 font-sans text-xs">
                            <div className="flex justify-between items-center mb-2 pb-1 border-b border-slate-100">
                              <span className="text-slate-400 text-[10px] font-mono uppercase">BREACH RUNWAY</span>
                              <span className="text-red-600 font-bold text-xs tracking-tight">
                                {p.newRisk.daysToBreach} Days
                              </span>
                            </div>
                            <p className="text-slate-600 text-[11px] leading-relaxed">
                              {p.newRisk.technicalReason}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Incremental vulnerability drift alert */}
                      <div className="p-4 bg-ice-blue border-t border-[#1E3A5F]/5 font-sans text-xs flex gap-3 leading-relaxed">
                        <ArrowLeftRight className="w-4 h-4 text-accent-blue shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-deep-navy uppercase text-[9px] tracking-wider block mb-1">
                            INCREMENTAL TRANSITION DRIFT PATHWAY
                          </strong>
                          <p className="text-slate-600 leading-relaxed text-[11px]">
                            {p.deltaBreachRisk}
                          </p>
                        </div>
                      </div>

                    </div>
                  );
                })}
              </div>

              {/* TRANSITION WORK UNITS DETAILS */}
              <div className="bg-white rounded-2xl border-rich-navy/10 overflow-hidden shadow-sm" id="transition-ticket-section">
                
                {/* Header bar */}
                <div className="p-5 bg-gradient-to-r from-frost-blue to-white border-b border-[#1E3A5F]/10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-center gap-2.5">
                    <div className="w-2.5 h-2.5 bg-accent-blue rounded-full shadow-[0_0_8px_#4DA3FF]"></div>
                    <span className="text-xs font-sans font-bold tracking-tight uppercase text-deep-navy">
                      Incremental Regulatory Transition Work Ticket
                    </span>
                  </div>

                  <button
                    onClick={copyTransitionTicketAsMarkdown}
                    className="inline-flex items-center gap-2 px-3.5 py-1.5 border border-accent-blue/30 text-deep-navy bg-ice-blue hover:bg-[#D6ECFF] rounded-lg text-[10px] font-bold tracking-wider font-sans uppercase transition-all cursor-pointer"
                  >
                    {compareCopiedTicket ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        [Copied Outline]
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-rich-navy" />
                        Copy Transition Plan
                      </>
                    )}
                  </button>
                </div>

                {/* Ticket Details */}
                <div className="p-6 space-y-6">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 bg-frost-blue p-5 rounded-xl border border-accent-blue/15">
                    <div>
                      <span className="text-[9px] font-mono text-slate-500 font-bold uppercase tracking-wider block mb-1">
                        TRANSITION TARGET DRIFT / DEFINITION OF MIGRATION
                      </span>
                      <h4 className="font-display font-bold text-[#0F172A] text-base uppercase leading-tight tracking-tight">
                        {comparisonResult.transitionTicket.title}
                      </h4>
                    </div>

                    <div className="flex gap-2 shrink-0">
                      <span className="px-3 py-1.5 bg-red-100 text-red-700 border border-red-200 text-[10px] rounded-lg font-mono font-bold uppercase tracking-wide">
                        {comparisonResult.transitionTicket.priority}
                      </span>
                      <span className="px-3 py-1.5 bg-white text-slate-700 border border-slate-200 text-[10px] rounded-lg font-mono font-bold uppercase tracking-wide">
                        {comparisonResult.transitionTicket.estimatedEffort}
                      </span>
                    </div>
                  </div>

                  {/* Criteria Checklist check-offs */}
                  <div>
                    <span className="text-[9px] text-slate-500 font-mono font-bold tracking-wider uppercase block mb-3">
                      [MIGRATION SPRINT CHECKLIST POINTS / VERIFIED TESTING CONDITIONS]
                    </span>
                    
                    <div className="space-y-2">
                      {comparisonResult.transitionTicket.acceptanceCriteria.map((criterion: string, i: number) => {
                        const ckId = `compare-criterion-${i}`;
                        const isChecked = !!compareCheckedCriteria[ckId];
                        return (
                          <div
                            key={i}
                            onClick={() => setCompareCheckedCriteria({ ...compareCheckedCriteria, [ckId]: !isChecked })}
                            className={`p-3.5 rounded-xl border transition-all cursor-pointer flex items-start gap-4 select-none text-xs leading-relaxed font-sans ${
                              isChecked
                                ? "border-emerald-200 bg-emerald-50/40 text-emerald-700 line-through decoration-emerald-500/50"
                                : "border-[#1E3A5F]/10 bg-white text-slate-700 hover:border-[#1E3A5F]/20"
                            }`}
                          >
                            <div className={`w-4 h-4 rounded-md border flex items-center justify-center shrink-0 mt-0.5 transition-all ${
                              isChecked ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 bg-white"
                            }`}>
                              {isChecked && <Check className="w-3 h-3 text-white stroke-[3]" />}
                            </div>
                            <span>{criterion}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Outbound system dependencies container */}
                  <div className="bg-[#FAFBFD] border border-[#1E3A5F]/10 rounded-xl p-5 flex gap-3 text-xs font-sans shadow-2xs">
                    <div className="w-2 h-2 rounded-full bg-accent-blue mt-1.5 shrink-0 animate-pulse"></div>
                    <div>
                      <span className="font-mono font-bold text-slate-600 block uppercase tracking-wider text-[10px] mb-1">
                        TRANSITION RECOVERY ENGINES
                      </span>
                      <p className="text-slate-600 leading-relaxed font-sans text-xs">
                        {comparisonResult.transitionTicket.deltaDependencies}
                      </p>
                    </div>
                  </div>

                  {/* Push scope button */}
                  <button 
                    onClick={() => {
                      alert("Differential transition tickets validated and delivered to underwriting systems backlog pipe.");
                    }}
                    className="w-full py-4.5 bg-[#0F172A] hover:bg-rich-navy text-white font-bold uppercase rounded-xl text-xs tracking-wide shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <span>PUSH MIGRATION SCOPE TO ENGINEERING BACKLOG</span>
                    <ChevronRight className="w-4.5 h-4.5" />
                  </button>

                </div>
              </div>

            </div>
          )}

          {/* ONBOARDING SANBOX - BEFORE GENERATING OUTPUT SINGLE REPORT */}
          {appMode === "single" && !analysisResult && !isAnalyzing && (
            <div className="bg-white rounded-2xl border border-rich-navy/10 p-10 text-center flex flex-col items-center justify-center py-16" id="onboarding-sandbox">
              <span className="w-14 h-14 bg-frost-blue border border-accent-blue/30 rounded-2xl flex items-center justify-center text-accent-blue mb-6 shadow-2xs">
                <Shield className="w-6 h-6 text-rich-navy" />
              </span>
              <h3 className="font-display font-semibold text-deep-navy text-base uppercase tracking-tight">
                Awaiting Regulatory Input Target
              </h3>
              <p className="text-xs text-slate-500 mt-2.5 max-w-md mx-auto leading-relaxed">
                Click a preset above to load pre-configured FCA, Lloyd's, or EIOPA consultation text, or supply your custom consultative segments to initiate direct systemic predictions.
              </p>
              
              <div className="flex flex-wrap justify-center gap-3 mt-8">
                <button
                  onClick={() => selectPredefinedBodyAndPreset("FCA", "fca-oper-resilience")}
                  className="px-4 py-2 bg-frost-blue hover:bg-[#D6ECFF] border border-accent-blue/20 text-deep-navy font-sans text-[11px] font-bold rounded-lg uppercase transition-all cursor-pointer shadow-3xs"
                >
                  FCA Operational Resilience
                </button>
                <button
                  onClick={() => selectPredefinedBodyAndPreset("Lloyd's", "lloyds-cyber-monitoring")}
                  className="px-4 py-2 bg-frost-blue hover:bg-[#D6ECFF] border border-accent-blue/20 text-deep-navy font-sans text-[11px] font-bold rounded-lg uppercase transition-all cursor-pointer shadow-3xs"
                >
                  Lloyd's Exposure Logs
                </button>
                <button
                  onClick={() => selectPredefinedBodyAndPreset("EIOPA", "eiopa-cloud-residency")}
                  className="px-4 py-2 bg-frost-blue hover:bg-[#D6ECFF] border border-accent-blue/20 text-deep-navy font-sans text-[11px] font-bold rounded-lg uppercase transition-all cursor-pointer shadow-3xs"
                >
                  EIOPA Cloud Residency
                </button>
              </div>
            </div>
          )}

          {/* ONBOARDING SANDBOX - BEFORE GENERATING OUTPUT VERSION COMPARER */}
          {appMode === "compare" && !comparisonResult && !isComparing && (
            <div className="bg-white rounded-2xl border border-rich-navy/10 p-10 text-center flex flex-col items-center justify-center py-16" id="compare-onboarding-sandbox">
              <span className="w-14 h-14 bg-frost-blue border border-accent-blue/30 rounded-2xl flex items-center justify-center text-accent-blue mb-6 shadow-2xs">
                <GitCompare className="w-6 h-6 text-rich-navy" />
              </span>
              <h3 className="font-display font-semibold text-deep-navy text-base uppercase tracking-tight">
                Awaiting Multi-Version Baseliner Input
              </h3>
              <p className="text-xs text-slate-500 mt-2.5 max-w-md mx-auto leading-relaxed">
                Select a multi-version preset from our scenario catalog at the top or copy historical and upcoming policy rules to begin mapping incremental risk runways.
              </p>
              
              <div className="flex flex-wrap justify-center gap-3 mt-8">
                <button
                  onClick={() => {
                    setSelectedBody("FCA");
                    setComparePresetId("comp-fca-oper-resilience");
                  }}
                  className="px-4 py-2 bg-frost-blue hover:bg-[#D6ECFF] border border-accent-blue/20 text-deep-navy font-sans text-[11px] font-bold rounded-lg uppercase transition-all cursor-pointer shadow-3xs"
                >
                  FCA SYSC 15.11 vs 15.12
                </button>
                <button
                  onClick={() => {
                    setSelectedBody("Lloyd's");
                    setComparePresetId("comp-lloyds-durability");
                  }}
                  className="px-4 py-2 bg-frost-blue hover:bg-[#D6ECFF] border border-accent-blue/20 text-deep-navy font-sans text-[11px] font-bold rounded-lg uppercase transition-all cursor-pointer shadow-3xs"
                >
                  Lloyd's Bulletin Y5431 vs Y5432
                </button>
                <button
                  onClick={() => {
                    setSelectedBody("EIOPA");
                    setComparePresetId("comp-eiopa-residency");
                  }}
                  className="px-4 py-2 bg-frost-blue hover:bg-[#D6ECFF] border border-accent-blue/20 text-deep-navy font-sans text-[11px] font-bold rounded-lg uppercase transition-all cursor-pointer shadow-3xs"
                >
                  EIOPA Guidelines vs DORA Cloud
                </button>
              </div>
            </div>
          )}

        </section>
      </main>

      {/* Corporate footer block */}
      <Footer />
    </div>
  );
}
