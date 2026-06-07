/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Lazy-initialized Gemini client to prevent startup crash if API key is missing
let aiClient: GoogleGenAI | null = null;

function getGeminiClient(): GoogleGenAI {
  if (!aiClient) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey || apiKey === "MY_GEMINI_API_KEY" || apiKey.trim() === "") {
      throw new Error(
        "GEMINI_API_KEY is not configured. Please supply your API key in the AI Studio environment settings."
      );
    }
    aiClient = new GoogleGenAI({
      apiKey: apiKey,
      httpOptions: {
        headers: {
          "User-Agent": "aistudio-build",
        },
      },
    });
  }
  return aiClient;
}

// API endpoint for health check
app.get("/api/health", (req, res) => {
  res.json({ status: "healthy", timestamp: new Date().toISOString() });
});

// Regulatory breach prediction API
app.post("/api/predict", async (req, res) => {
  try {
    const { regBody, regDeltaText, systemFingerprint } = req.body;

    if (!regBody || !regDeltaText) {
      return res.status(400).json({ error: "Missing required parameters: regBody or regDeltaText." });
    }

    const ai = getGeminiClient();

    // Prepare prompt instructing the model to parse the delta, run breach prediction, and create a remediation ticket.
    const prompt = `
      You are CompliancePulse, an enterprise regulatory breach prediction engine for SaaS, Cloud, FinTech, and Enterprise IT teams.
      Evaluate the following regulatory change delta under the ${regBody} framework and correlate it against our current IT System Fingerprint.
      
      --- REGULATORY DELTA TEXT ---
      ${regDeltaText}
      
      --- CURRENT IT SYSTEM FINGERPRINT ---
      - Core System Platform: ${systemFingerprint?.platform || "Not provided / Unknown"}
      - Audit Log Retention Period: ${systemFingerprint?.logRetention || "Not provided / Unknown"}
      - Data Hosting & Residency: ${systemFingerprint?.hostingLocation || "Not provided / Unknown"}
      - Reporting Pipeline Format: ${systemFingerprint?.reportingPipeline || "Not provided / Unknown"}
      - Encryption Standards (Rest & Transit): ${systemFingerprint?.encryption || "Not provided / Unknown"}
      - Secondary Attributes (API Schemas): ${systemFingerprint?.apiSchemas || "Not provided / Unknown"}
      - Secondary Attributes (Access Controls): ${systemFingerprint?.accessControls || "Not provided / Unknown"}

      Your job is NOT to summarize regulations.
      Your job is to analyze the IT system configuration, find gaps, and predict exactly which systems will become non-compliant and when.
      Flag if a single regulatory change triggers breaches across multiple systems simultaneously by returning multiple predictions in the array.
      
      Ensure you specify "Days to Breach" as a precise relative number from today. If the effective date in the delta text is absolute, calculate the days remaining from today's date (which is June 7, 2026). If the effective date is unknown or unspecified, calculate representing a default "60-day default" or specific estimations.
    `;

    // Define strict response schema in JSON format to avoid parsing errors
    const responseSchema = {
      type: Type.OBJECT,
      properties: {
        delta: {
          type: Type.OBJECT,
          properties: {
            source: { type: Type.STRING, description: "The regulatory body: FCA, Lloyd's, or EIOPA." },
            ruleReference: { type: Type.STRING, description: "Rule reference, e.g. DORA Article 17, PS24/6, Lloyd's Market Bulletin Y5432." },
            effectiveDate: { type: Type.STRING, description: "The absolute date when the rule is in effect." },
            whatChanged: { type: Type.STRING, description: "1-2 sentences in plain English explaining what changed." },
            technicalTrigger: { type: Type.STRING, description: "The specific system technical attribute touched by this rule (e.g., encryption, schema, log retention, reporting speed)." }
          },
          required: ["source", "ruleReference", "effectiveDate", "whatChanged", "technicalTrigger"]
        },
        predictions: {
          type: Type.ARRAY,
          description: "List of systems that will violate the regulatory change, with details.",
          items: {
            type: Type.OBJECT,
            properties: {
              affectedSystem: { type: Type.STRING, description: "The specific system, database, or network component affected." },
              currentState: { type: Type.STRING, description: "The current technical configuration of that system (fingerprinted)." },
              requiredState: { type: Type.STRING, description: "The required technical state mandated by the regulatory delta." },
              daysToBreach: { type: Type.INTEGER, description: "Estimated physical integer days to breach based on effective date from June 7, 2026. Use 60 if effective date TBC." },
              breachSeverity: { type: Type.STRING, description: "Breach Severity Level: Critical, High, Medium, or Low" },
              confidence: { type: Type.STRING, description: "Confidence in prediction: High, Medium, or Low" },
              confidenceReason: { type: Type.STRING, description: "Brief justification for the confidence rating." },
              technicalReason: { type: Type.STRING, description: "Comprehensive, highly technical reason stating exactly how and why the current state triggers a breach." }
            },
            required: ["affectedSystem", "currentState", "requiredState", "daysToBreach", "breachSeverity", "confidence", "confidenceReason", "technicalReason"]
          }
        },
        ticket: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING, description: "An action-oriented sprint-ready engineering task title." },
            priority: { type: Type.STRING, description: "Tickets Priority: P0, P1, or P2." },
            estimatedEffort: { type: Type.STRING, description: "Brief sizing indicator, e.g., '5 story points' or '8 days'." },
            acceptanceCriteria: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Precise, verified technical criteria to pass the ticket."
            },
            dependencies: { type: Type.STRING, description: "Specific upstream platforms, cloud updates, or data schema migrations needed." }
          },
          required: ["title", "priority", "estimatedEffort", "acceptanceCriteria", "dependencies"]
        }
      },
      required: ["delta", "predictions", "ticket"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: responseSchema,
        systemInstruction: "You are an elite, senior cybersecurity and IT systems compliance architect for Lloyds, EIOPA, and FCA regulated multi-national insurers. You make real technical predictions based on system capabilities, not high-level advisory summaries. Today's date is June 7, 2026.",
        temperature: 0.2
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Empty text returned from Gemini API.");
    }

    const predictionResult = JSON.parse(textOutput.trim());
    res.json(predictionResult);

  } catch (err: any) {
    console.error("Prediction endpoint error:", err);
    res.status(500).json({
      error: "An error occurred during prediction analysis.",
      message: err.message || String(err)
    });
  }
});

// Regulatory baseline vs update comparison predictive analysis
app.post("/api/compare", async (req, res) => {
  try {
    const { regBody, baselineRuleText, newRuleText, systemFingerprint } = req.body;

    if (!regBody || !baselineRuleText || !newRuleText) {
      return res.status(400).json({ error: "Missing required parameters: regBody, baselineRuleText, or newRuleText." });
    }

    const ai = getGeminiClient();

    const prompt = `
      You are CompliancePulse, an enterprise regulatory breach prediction engine for SaaS, Cloud, FinTech, and Enterprise IT teams.
      Evaluate a side-by-side technical breach gap risk analysis when comparing an updated rule/policy directive against a previous baseline policy version under ${regBody}.
      
      Analyze how our current IT System Fingerprint interacts with BOTH versions:
      
      --- CURRENT IT SYSTEM FINGERPRINT ---
      - Core System Platform: ${systemFingerprint?.platform || "Not provided / Unknown"}
      - Audit Log Retention Period: ${systemFingerprint?.logRetention || "Not provided / Unknown"}
      - Data Hosting & Residency: ${systemFingerprint?.hostingLocation || "Not provided / Unknown"}
      - Reporting Pipeline Format: ${systemFingerprint?.reportingPipeline || "Not provided / Unknown"}
      - Encryption Standards (Rest & Transit): ${systemFingerprint?.encryption || "Not provided / Unknown"}
      - Secondary Attributes (API Schemas): ${systemFingerprint?.apiSchemas || "Not provided / Unknown"}
      - Secondary Attributes (Access Controls): ${systemFingerprint?.accessControls || "Not provided / Unknown"}

      --- BASELINE REGULATORY TEXT (VERSION A) ---
      ${baselineRuleText}

      --- NEW REGULATORY TEXT (VERSION B - THE UPDATE) ---
      ${newRuleText}

      Compare them side-by-side. 
      Today's date is June 7, 2026. Calculate remaining Days to Breach from today.
      If the baseline contains no breaches, or longer margins (e.g. 180 days), but the new update introduces immediate triggers (e.g. 15 days), state that clearly!
      Predict the relative risk changes for affected elements. Keep descriptions technical and detailed.
    `;

    const comparisonSchema = {
      type: Type.OBJECT,
      properties: {
        baselineDelta: {
          type: Type.OBJECT,
          properties: {
            ruleReference: { type: Type.STRING },
            effectiveDate: { type: Type.STRING },
            whatChanged: { type: Type.STRING },
            technicalTrigger: { type: Type.STRING }
          },
          required: ["ruleReference", "effectiveDate", "whatChanged", "technicalTrigger"]
        },
        newDelta: {
          type: Type.OBJECT,
          properties: {
            ruleReference: { type: Type.STRING },
            effectiveDate: { type: Type.STRING },
            whatChanged: { type: Type.STRING },
            technicalTrigger: { type: Type.STRING }
          },
          required: ["ruleReference", "effectiveDate", "whatChanged", "technicalTrigger"]
        },
        riskEvolutionSummary: { type: Type.STRING, description: "A high-level technical summary of how the upgrade in regulation increases system risks." },
        baselineTotalDays: { type: Type.INTEGER, description: "Average days to breach under baseline rule constraints. Use high numbers like 180 if fully compliant." },
        newTotalDays: { type: Type.INTEGER, description: "Average days to breach under new rule constraints. If imminent, use small numbers." },
        predictions: {
          type: Type.ARRAY,
          description: "Comparison predictions for affected nodes.",
          items: {
            type: Type.OBJECT,
            properties: {
              affectedSystem: { type: Type.STRING },
              currentState: { type: Type.STRING },
              baselineRisk: {
                type: Type.OBJECT,
                properties: {
                  daysToBreach: { type: Type.INTEGER },
                  severity: { type: Type.STRING },
                  isCompliant: { type: Type.BOOLEAN },
                  technicalReason: { type: Type.STRING }
                },
                required: ["daysToBreach", "severity", "isCompliant", "technicalReason"]
              },
              newRisk: {
                type: Type.OBJECT,
                properties: {
                  daysToBreach: { type: Type.INTEGER },
                  severity: { type: Type.STRING },
                  isCompliant: { type: Type.BOOLEAN },
                  technicalReason: { type: Type.STRING }
                },
                required: ["daysToBreach", "severity", "isCompliant", "technicalReason"]
              },
              deltaBreachRisk: { type: Type.STRING, description: "In-depth description of the exact change in vulnerability between baseline and new version." }
            },
            required: ["affectedSystem", "currentState", "baselineRisk", "newRisk", "deltaBreachRisk"]
          }
        },
        transitionTicket: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            priority: { type: Type.STRING },
            estimatedEffort: { type: Type.STRING },
            acceptanceCriteria: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            deltaDependencies: { type: Type.STRING }
          },
          required: ["title", "priority", "estimatedEffort", "acceptanceCriteria", "deltaDependencies"]
        }
      },
      required: ["baselineDelta", "newDelta", "riskEvolutionSummary", "baselineTotalDays", "newTotalDays", "predictions", "transitionTicket"]
    };

    const response = await ai.models.generateContent({
      model: "gemini-flash-latest",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: comparisonSchema,
        systemInstruction: "You are an elite, senior cybersecurity and IT systems compliance architect comparing regulatory baselines for FCA, EIOPA, and Lloyd's systems. Provide deeply rigorous technical predictions without platitudes. Today's date is June 7, 2026.",
        temperature: 0.2
      }
    });

    const textOutput = response.text;
    if (!textOutput) {
      throw new Error("Empty text returned from Gemini API.");
    }

    const comparisonResult = JSON.parse(textOutput.trim());
    res.json(comparisonResult);

  } catch (err: any) {
    console.error("Comparison endpoint error:", err);
    res.status(500).json({
      error: "An error occurred during comparative analysis.",
      message: err.message || String(err)
    });
  }
});

// Configure Vite middleware or static serving
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    console.log("Starting server in development mode with Vite HMR wrapper...");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    console.log("Starting server in production mode serving static dist files...");
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`CompliancePulse engine running on http://localhost:${PORT}`);
  });
}

startServer().catch((error) => {
  console.error("Failed to start server:", error);
});
