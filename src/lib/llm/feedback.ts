// Feedback orchestrator - combines prompt techniques with context
import { SOCRATIC_SYSTEM_PROMPT } from "./prompts/socratic";
import { RSIP_SYSTEM_PROMPT } from "./prompts/rsip";
import { CAD_SYSTEM_PROMPT } from "./prompts/cad";
import { CCP_SYSTEM_PROMPT } from "./prompts/ccp";
import { BIAS_DETECTION_SYSTEM_PROMPT } from "./prompts/bias-detection";
import { READING_GUIDES, READING_GUIDE_SYSTEM_PROMPT } from "./prompts/reading-guide";
import type { PromptTechnique, ReadingDomain } from "@/types";
import type { GraphRAGContext } from "./client";

const TECHNIQUE_PROMPTS: Record<PromptTechnique, string> = {
  socratic: SOCRATIC_SYSTEM_PROMPT,
  rsip: RSIP_SYSTEM_PROMPT,
  cad: CAD_SYSTEM_PROMPT,
  ccp: CCP_SYSTEM_PROMPT,
  general: CCP_SYSTEM_PROMPT, // General uses CCP as baseline
};

export function buildSystemPrompt(options: {
  technique: PromptTechnique;
  domain?: ReadingDomain;
  graphContext?: GraphRAGContext;
  isReadingPhase?: boolean;
}): string {
  const parts: string[] = [];

  // Base technique prompt
  parts.push(TECHNIQUE_PROMPTS[options.technique]);

  // Bias detection (always included)
  parts.push(BIAS_DETECTION_SYSTEM_PROMPT);

  // Domain-specific reading guide
  if (options.domain) {
    const guide = READING_GUIDES[options.domain];
    if (guide) {
      parts.push(`\n## 分野別読解ガイド: ${guide.label}`);
      parts.push(`優先事項: ${guide.priorities.join(", ")}`);
      parts.push(`評価軸: ${guide.evaluationAxes.join(", ")}`);
      parts.push(`批判的質問の例:\n${guide.criticalQuestions.map((q) => `- ${q}`).join("\n")}`);
    }
  }

  // Reading phase guide
  if (options.isReadingPhase) {
    parts.push(READING_GUIDE_SYSTEM_PROMPT);
  }

  // GraphRAG context
  if (options.graphContext) {
    parts.push("\n## ナレッジグラフからのコンテキスト");
    if (options.graphContext.concepts.length > 0) {
      parts.push("### 関連概念:");
      for (const c of options.graphContext.concepts) {
        parts.push(`- **${c.name}**: ${c.description}`);
      }
    }
    if (options.graphContext.relations.length > 0) {
      parts.push("### 概念間の関係:");
      for (const r of options.graphContext.relations) {
        parts.push(`- ${r.from} --[${r.type}]--> ${r.to}`);
      }
    }
    if (options.graphContext.relatedPapers.length > 0) {
      parts.push("### 関連論文:");
      for (const p of options.graphContext.relatedPapers) {
        parts.push(`- "${p.title}": ${p.abstract.slice(0, 200)}...`);
      }
    }
  }

  return parts.join("\n\n");
}
