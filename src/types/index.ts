// Paper field types
export const PAPER_FIELDS = [
  "neuroscience",
  "cell_biology",
  "psychology",
  "engineering",
  "ai",
  "interdisciplinary",
] as const;
export type PaperField = (typeof PAPER_FIELDS)[number];

// Reading phases
export const READING_PHASES = [
  "not_started",
  "pass_1_overview",
  "pass_2_conclusion",
  "pass_3_data",
  "pass_4_deep",
  "completed",
] as const;
export type ReadingPhase = (typeof READING_PHASES)[number];

// Annotation colors with semantic meaning
export const ANNOTATION_COLORS = {
  red: { label: "懐疑・反論", description: "自分が疑問を持つ主張" },
  yellow: { label: "主要テーゼ", description: "論文の核心的主張" },
  green: { label: "引用予定", description: "自分の研究で直接使うテキスト" },
  purple: { label: "構造マーカー", description: "章・節の見出し" },
  blue: { label: "関連文献", description: "他の論文・著者との関連性" },
  orange: { label: "定義・用語", description: "キーワード、定義" },
  gray: { label: "背景情報", description: "一般的な文脈情報" },
} as const;
export type AnnotationColor = keyof typeof ANNOTATION_COLORS;

// Note types
export const NOTE_TYPES = [
  "summary",
  "concept",
  "reflection",
  "critique",
] as const;
export type NoteType = (typeof NOTE_TYPES)[number];

// Project status
export const PROJECT_STATUSES = [
  "planning",
  "in_progress",
  "completed",
] as const;
export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

// Prompt techniques for LLM feedback
export const PROMPT_TECHNIQUES = [
  "socratic",
  "rsip",
  "cad",
  "ccp",
  "general",
] as const;
export type PromptTechnique = (typeof PROMPT_TECHNIQUES)[number];

// Feedback context types
export const CONTEXT_TYPES = [
  "note",
  "project",
  "reading",
  "concept",
] as const;
export type ContextType = (typeof CONTEXT_TYPES)[number];

// Confidence levels for CCP
export type ConfidenceLevel = 1 | 2 | 3 | 4 | 5;

// Bias warning types
export interface BiasWarning {
  type: "confirmation" | "automation" | "periodic";
  message: string;
  timestamp: string;
}

// Reading guide domains
export const READING_DOMAINS = [
  "stem",
  "social_science",
  "humanities",
  "applied",
] as const;
export type ReadingDomain = (typeof READING_DOMAINS)[number];

// Neo4j relationship types
export const CONCEPT_RELATIONS = [
  "IS_A",
  "PART_OF",
  "CAUSES",
  "INHIBITS",
  "USES",
  "CONTRADICTS",
  "EXTENDS",
  "RELATED_TO",
] as const;
export type ConceptRelation = (typeof CONCEPT_RELATIONS)[number];
