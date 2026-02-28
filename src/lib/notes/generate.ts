import type { Annotation } from "@/lib/annotations/actions";
import type { NoteType } from "@/types";

const NOTE_TYPE_PROMPTS: Record<NoteType, string> = {
  summary: `以下のアノテーション群と論文コンテキストから、論文の要約ノートを生成してください。

要件:
- 主要な発見と結論を簡潔にまとめる
- アノテーションで強調された部分を中心に構成する
- 自分の理解を深めるための整理された形式で書く
- HTML形式で出力する（<h2>, <p>, <ul>, <li> タグを使用）`,

  concept: `以下のアノテーション群と論文コンテキストから、概念ノートを生成してください。

要件:
- 論文で扱われている中心概念を抽出し整理する
- 各概念の定義、関係性、適用範囲を明確にする
- アノテーションで強調された定義や用語を中心にする
- HTML形式で出力する（<h2>, <p>, <ul>, <li> タグを使用）`,

  reflection: `以下のアノテーション群と論文コンテキストから、考察ノートを生成してください。

要件:
- 論文の主張に対する自分の考えを深める問いを提示する
- アノテーションのコメントや疑問点を発展させる
- 他の研究との関連性を考える視点を提供する
- HTML形式で出力する（<h2>, <p>, <ul>, <li> タグを使用）`,

  critique: `以下のアノテーション群と論文コンテキストから、批評ノートを生成してください。

要件:
- 論文の方法論、データ解釈、結論の妥当性を評価する
- アノテーションで懐疑的にマークされた部分を中心に分析する
- 強みと弱みをバランスよく指摘する
- HTML形式で出力する（<h2>, <p>, <ul>, <li> タグを使用）`,
};

export interface GenerateNoteRequest {
  annotations: Annotation[];
  noteType: NoteType;
  paperTitle: string;
  paperAbstract?: string;
}

export function buildNoteGenerationPrompt(request: GenerateNoteRequest): {
  system: string;
  user: string;
} {
  const system = `あなたは研究者の論文読解を支援するAIアシスタントです。
アノテーション（ハイライト + コメント）から構造化されたノートを生成します。
レスポンスはHTMLで返してください。余計な説明は不要です。`;

  const annotationText = request.annotations
    .map((a) => {
      const parts = [`[${a.color}] "${a.text}"`];
      if (a.comment) parts.push(`コメント: ${a.comment}`);
      if (a.section) parts.push(`セクション: ${a.section}`);
      return parts.join(" | ");
    })
    .join("\n");

  const user = `${NOTE_TYPE_PROMPTS[request.noteType]}

## 論文情報
タイトル: ${request.paperTitle}
${request.paperAbstract ? `アブストラクト: ${request.paperAbstract}` : ""}

## アノテーション一覧
${annotationText}`;

  return { system, user };
}

export async function generateNote(
  request: GenerateNoteRequest,
  apiKey: string,
): Promise<string> {
  const { system, user } = buildNoteGenerationPrompt(request);

  const response = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": apiKey,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model: "claude-sonnet-4-5-20250929",
      max_tokens: 4096,
      system,
      messages: [{ role: "user", content: user }],
    }),
  });

  if (!response.ok) {
    throw new Error(`API error: ${response.status}`);
  }

  const data = await response.json();
  return data.content[0].text;
}
