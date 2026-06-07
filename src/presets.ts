/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface RegulatoryPreset {
  id: string;
  source: "FCA" | "Lloyd's" | "EIOPA";
  ruleReference: string;
  title: string;
  description: string;
  effectiveDate: string;
  textDelta: string;
}

export const REGULATORY_PRESETS: RegulatoryPreset[] = [
  {
    id: "fca-oper-resilience",
    source: "FCA",
    ruleReference: "FCA SYSC 15.12 / PS21/3",
    title: "Operational Resilience Alignment Directive",
    description: "Requires operational mapping of important business services and restricted auxiliary backups of core platforms outside primary cloud tenants.",
    effectiveDate: "2026-09-30",
    textDelta: "Firms must identify and map their important business services, set impact tolerances for maximum tolerable disruption, and conduct scenario testing. Under SYSC 15.12, any system-wide failure on a core operational platform that exceeds 24 hours must be immediately reported. Data backups and recovery processes must reside in an auxiliary infrastructure separated from the main cloud tenant, with offline air-gapping."
  },
  {
    id: "lloyds-cyber-monitoring",
    source: "Lloyd's",
    ruleReference: "Lloyd's Bulletin Y5432",
    title: "Cyber Hazard Attestation & Log Durability",
    description: "Mandates real-time exposure monitoring and 10-year WORM storage auditable log duration on transactional adjustments.",
    effectiveDate: "2026-11-15",
    textDelta: "Managing agents are required to implement real-time systemic event monitoring across all transaction and ledger modeling pipelines. Core engines must validate that clients have enabled quantum-resistant end-to-end encryption for transactional data transmission, and audit logs on ledger modifications must be retained for a minimum of 10 years in WORM (Write Once Read Many) storage."
  },
  {
    id: "eiopa-cloud-residency",
    source: "EIOPA",
    ruleReference: "EIOPA-BoS-20/002 Outsourcing Guidelines",
    title: "EEA Data Residency & Real-time Reporting",
    description: "Enforces strict European Union/EEA physical hosting for core modules and real-time SLA breach notification via XBRL API endpoints.",
    effectiveDate: "2027-01-01",
    textDelta: "Firms must ensure that critical operational systems (transaction ledgers, financial reporting) hosted on public clouds maintain direct data residency within the European Economic Area (EEA). Access controls must enforce hardware-backed FIDO2 multi-factor authentication (MFA) for all administrative logins. Reporting schemas for service level agreement (SLA) breaches must be pushed automatically to standard XBRL endpoints within 2 hours of any critical outage."
  }
];

export interface SystemFingerprint {
  platform: string;
  logRetention: string;
  hostingLocation: string;
  reportingPipeline: string;
  encryption: string;
  apiSchemas: string;
  accessControls: string;
}

export const INITIAL_FINGERPRINT: SystemFingerprint = {
  platform: "SAP S/4HANA Enterprise v22.1",
  logRetention: "1 Year (Standard CloudTrail S3 Archive)",
  hostingLocation: "AWS US-East (Northern Virginia)",
  reportingPipeline: "CSV Batch files uploaded nightly via SFTP",
  encryption: "AES-256 for data at rest; TLS 1.2 for transit",
  apiSchemas: "Restricted SOAP & REST legacy interfaces",
  accessControls: "Password-based authorization with standard SMS MFA"
};

export const FINGERPRINT_OPTIONS = {
  platforms: [
    "SAP S/4HANA Enterprise v22.1",
    "Oracle Financial Services Core Ledger",
    "Workday Enterprise Billing & Finance",
    "Legacy COBOL AS400 Ledger Engine (Bespoke)",
    "Cloud-Native Node/Go Transaction Core"
  ],
  logRetentions: [
    "90 Days (Hot Storage Only)",
    "1 Year (Standard CloudTrail S3 Archive)",
    "3 Years (WORM Glacier Vault)",
    "10 Years (WORM Compliance Vault)",
    "None / Logs deleted recursively after 30 days"
  ],
  hostingLocations: [
    "AWS US-East (Northern Virginia)",
    "AWS EU-West (Dublin, Ireland)",
    "AWS EU-Central (Frankfurt, Germany)",
    "On-Premises Private Rack (London, UK)",
    "GCP West-Europe (St. Ghislain, Belgium)"
  ],
  reportingPipelines: [
    "CSV Batch files uploaded nightly via SFTP",
    "API Push (JSON webhooks on status change)",
    "Direct XBRL Reporting Stream (Real-Time Push)",
    "No structured pipeline (Manual Excel export)"
  ],
  encryptions: [
    "AES-256 for data at rest; TLS 1.2 for transit",
    "Quantum-resistant RSA-4096; TLS 1.3 enforced",
    "AES-128 at rest; unencrypted HTTP inside private VPC",
    "No encryption applied to inactive ledger state"
  ],
  apiSchemas: [
    "Restricted SOAP & REST legacy interfaces",
    "Strict JSON Schema v7 validation endpoints",
    "GraphQL Federated queries",
    "Undocumented ad-hoc XML endpoints"
  ],
  accessControls: [
    "Password-based authorization with standard SMS MFA",
    "Hardware-backed FIDO2 WebAuthn (Yubikey Enforced)",
    "Single Sign-On (Active Directory) with No MFA",
    "Direct password authentication without secondary layer"
  ]
};

export interface ComparisonPreset {
  id: string;
  source: "FCA" | "Lloyd's" | "EIOPA";
  title: string;
  baselineReference: string;
  baselineEffectiveDate: string;
  baselineText: string;
  newReference: string;
  newEffectiveDate: string;
  newText: string;
  description: string;
}

export const COMPARISON_PRESETS: ComparisonPreset[] = [
  {
    id: "comp-fca-oper-resilience",
    source: "FCA",
    title: "SYSC 15.11 (Legacy Backup) vs SYSC 15.12 (Air-Gapped Active Maps)",
    baselineReference: "FCA SYSC 15.11 (Active 2024 Baseline)",
    baselineEffectiveDate: "2024-03-31",
    baselineText: "Firms must maintain generic disaster recovery procedures for backing up customer accounts with standard offsite backups twice a week. Under SYSC 15.11 standard procedures, target recovery time stands at 48 to 72 hours for major outages, with cumulative reporting scheduled on weekly cycles.",
    newReference: "FCA SYSC 15.12 (Effective 2026 Directive) PS21/3",
    newEffectiveDate: "2026-09-30",
    newText: "Firms must identify and map their important business services, set impact tolerances for maximum tolerable disruption, and conduct scenario testing. Under SYSC 15.12, any system-wide failure on a core operational platform that exceeds 24 hours must be immediately reported. Data backups and recovery processes must reside in an auxiliary infrastructure separated from the main cloud tenant, with offline air-gapping.",
    description: "Evaluates the leap from scheduled weekly-cycle offsite backups to strict 24h air-gapped offline recovery bounds and instant failure warning schedules."
  },
  {
    id: "comp-lloyds-durability",
    source: "Lloyd's",
    title: "Bulletin Y5431 (1Y Storage Policy) vs Bulletin Y5432 (10Y WORM Vault)",
    baselineReference: "Lloyd's Bulletin Y5431 (Active 2023 Baseline)",
    baselineEffectiveDate: "2023-06-01",
    baselineText: "Managing agents are required to archive transaction audits and parameter modifications in standard log streams (e.g., standard CloudTrail log pools or direct localized backups) for at least 365 days (1 year) to allow standard quarterly reviews.",
    newReference: "Lloyd's Bulletin Y5432 (Effective 2026 Directive)",
    newEffectiveDate: "2026-11-15",
    newText: "Managing agents are required to implement real-time systemic event monitoring across all transaction and ledger modeling pipelines. Core engines must validate that clients have enabled quantum-resistant end-to-end encryption for transactional data transmission, and audit logs on ledger modifications must be retained for a minimum of 10 years in WORM (Write Once Read Many) storage.",
    description: "Evaluates the transition of ledger modifier logs from simple 1-year general hot streams to 10-year immutable WORM (Write Once Read Many) compliance vaults with real-time transaction tracing."
  },
  {
    id: "comp-eiopa-residency",
    source: "EIOPA",
    title: "Outsourcing Guidelines (Legacy Cloud) vs DORA Framework (EEA Physical Residency)",
    baselineReference: "EIOPA Outsourcing Recommendations 2020 (Legacy Baseline)",
    baselineEffectiveDate: "2020-10-01",
    baselineText: "Cloud services housing transactional ledger indices should enforce logical data partitioning. System administrative logins must comply with scheduled rotating passwords and standard password policies without physical proximity requirements.",
    newReference: "EIOPA Outsourcing Guidelines 2027 (Effective 2027 DORA)",
    newEffectiveDate: "2027-01-01",
    newText: "Firms must ensure that critical operational systems (transaction ledgers, financial reporting) hosted on public clouds maintain direct data residency within the European Economic Area (EEA). Access controls must enforce hardware-backed FIDO2 multi-factor authentication (MFA) for all administrative logins. Reporting schemas for service level agreement (SLA) breaches must be pushed automatically to standard XBRL endpoints within 2 hours of any critical outage.",
    description: "Tracks requirements moving from manual logical passwords to strict EEA physical regions, hardware compliance security keys (FIDO2), and automatic XBRL API breach alerts within 2 hours."
  }
];
