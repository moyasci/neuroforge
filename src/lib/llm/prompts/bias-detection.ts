// 認知バイアス警告システム

export interface BiasRule {
  type: "confirmation" | "automation" | "periodic";
  trigger: string;
  message: string;
}

export const BIAS_RULES: BiasRule[] = [
  {
    type: "confirmation",
    trigger: "consecutive_agreeing_queries >= 3",
    message:
      "確証バイアス警告: 同じ結論を支持する質問が続いています。反対の立場からの検討も行ってみましょう。",
  },
  {
    type: "automation",
    trigger: "note_similarity_to_llm_response > 0.9",
    message:
      "オートメーションバイアス警告: ノートがLLMの回答と非常に類似しています。自分自身の言葉で再構成することを推奨します。",
  },
  {
    type: "periodic",
    trigger: "message_count % 5 === 0",
    message:
      "リマインド: LLMの回答は参考情報です。原文と照合し、自分の判断を優先してください。",
  },
];

export function checkConfirmationBias(
  recentQueries: string[],
  threshold: number = 3,
): BiasRule | null {
  if (recentQueries.length < threshold) return null;

  // Simple heuristic: check if recent queries have similar sentiment/direction
  const recentSlice = recentQueries.slice(-threshold);
  const agreementPatterns = [
    "正しい",
    "支持",
    "賛成",
    "同意",
    "確認",
    "その通り",
    "合っている",
  ];

  const agreeCount = recentSlice.filter((q) =>
    agreementPatterns.some((p) => q.includes(p)),
  ).length;

  if (agreeCount >= threshold) {
    return BIAS_RULES.find((r) => r.type === "confirmation") ?? null;
  }
  return null;
}

export function checkAutomationBias(
  noteContent: string,
  llmResponse: string,
): BiasRule | null {
  if (!noteContent || !llmResponse) return null;

  // Simple similarity check based on shared words
  const noteWords = new Set(noteContent.split(/\s+/));
  const llmWords = new Set(llmResponse.split(/\s+/));
  const intersection = [...noteWords].filter((w) => llmWords.has(w));
  const similarity =
    (2 * intersection.length) / (noteWords.size + llmWords.size);

  if (similarity > 0.9) {
    return BIAS_RULES.find((r) => r.type === "automation") ?? null;
  }
  return null;
}

export function checkPeriodicReminder(
  messageCount: number,
): BiasRule | null {
  if (messageCount > 0 && messageCount % 5 === 0) {
    return BIAS_RULES.find((r) => r.type === "periodic") ?? null;
  }
  return null;
}

export const BIAS_DETECTION_SYSTEM_PROMPT = `## バイアス検出
あなたの回答を生成する際、以下のバイアスに注意してください：

1. **確証バイアス**: ユーザーが既に持っている結論を無批判に支持しないでください。
2. **権威バイアス**: 著名な著者・機関の研究でも批判的に検討してください。
3. **利用可能性バイアス**: 目立つ情報だけでなく、見落としやすい情報にも注意してください。
4. **アンカリング**: 最初に提示された情報に過度に引きずられないでください。

ユーザーの思考にバイアスの兆候が見られた場合、穏やかに指摘してください。
`;
