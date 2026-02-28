"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  FileText,
  StickyNote,
  Lightbulb,
  Sparkles,
} from "lucide-react";

const sampleResults = [
  {
    type: "paper",
    title: "Attention Is All You Need",
    excerpt: "...self-attention mechanism allows the model to attend to all positions...",
    relevance: 0.95,
  },
  {
    type: "note",
    title: "Transformer アーキテクチャまとめ",
    excerpt: "...Multi-head attention により異なる部分空間の情報を同時に扱える...",
    relevance: 0.88,
  },
  {
    type: "concept",
    title: "Self-Attention",
    excerpt: "入力シーケンス内の各要素が他のすべての要素との関連度を計算する機構...",
    relevance: 0.92,
  },
  {
    type: "paper",
    title: "BERT: Pre-training of Deep Bidirectional Transformers",
    excerpt: "...uses a multi-layer bidirectional Transformer encoder...",
    relevance: 0.79,
  },
];

const typeIcon = {
  paper: FileText,
  note: StickyNote,
  concept: Lightbulb,
};

const typeLabel = {
  paper: "論文",
  note: "ノート",
  concept: "概念",
};

export default function SearchPage() {
  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          GraphRAG 検索
        </h2>
        <p className="text-muted-foreground">
          ナレッジグラフを活用したセマンティック検索
        </p>
      </div>

      <div className="flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            className="pl-10"
            placeholder="例: Self-Attention の仕組みと応用"
          />
        </div>
        <Button>検索</Button>
      </div>

      {/* Results */}
      <div className="space-y-3">
        <p className="text-sm text-muted-foreground">
          検索結果: {sampleResults.length}件
        </p>
        {sampleResults.map((result, i) => {
          const Icon =
            typeIcon[result.type as keyof typeof typeIcon] || FileText;
          const label =
            typeLabel[result.type as keyof typeof typeLabel] || result.type;

          return (
            <Card
              key={i}
              className="cursor-pointer transition-colors hover:border-primary/50"
            >
              <CardHeader className="pb-2">
                <div className="flex items-start justify-between">
                  <CardTitle className="flex items-center gap-2 text-base">
                    <Icon className="h-4 w-4" />
                    {result.title}
                  </CardTitle>
                  <Badge variant="outline">{label}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {result.excerpt}
                </p>
                <div className="mt-2">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-muted-foreground">
                      関連度:
                    </span>
                    <div className="h-1.5 w-24 rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-primary"
                        style={{ width: `${result.relevance * 100}%` }}
                      />
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {Math.round(result.relevance * 100)}%
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
