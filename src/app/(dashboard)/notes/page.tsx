import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, StickyNote, Calendar } from "lucide-react";

const notes = [
  {
    id: "1",
    title: "Transformer アーキテクチャまとめ",
    excerpt: "Self-attention, Multi-head attention, Positional encoding の仕組みを整理...",
    paper: "Attention Is All You Need",
    updatedAt: "2時間前",
    tags: ["NLP", "Transformer"],
  },
  {
    id: "2",
    title: "BERT の事前学習手法",
    excerpt: "Masked Language Model と Next Sentence Prediction の詳細...",
    paper: "BERT",
    updatedAt: "1日前",
    tags: ["NLP", "Pre-training"],
  },
  {
    id: "3",
    title: "拡散モデルの数学的基礎",
    excerpt: "Forward process と Reverse process の確率的定式化...",
    paper: null,
    updatedAt: "3日前",
    tags: ["生成モデル", "数学"],
  },
  {
    id: "4",
    title: "Scaling Laws メモ",
    excerpt: "モデルサイズ・データサイズ・計算量のスケーリング則...",
    paper: "Scaling Laws for Neural Language Models",
    updatedAt: "5日前",
    tags: ["ML", "Scaling"],
  },
  {
    id: "5",
    title: "GNN 基礎概念ノート",
    excerpt: "Message passing, Aggregation, Update のフレームワーク...",
    paper: "Graph Neural Networks: A Review",
    updatedAt: "1週間前",
    tags: ["Graph", "GNN"],
  },
  {
    id: "6",
    title: "RAG パイプライン設計メモ",
    excerpt: "Retriever と Generator の接続方法、チャンク戦略...",
    paper: "RAG for Knowledge-Intensive Tasks",
    updatedAt: "1週間前",
    tags: ["RAG", "NLP"],
  },
];

export default function NotesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">ノート</h2>
          <p className="text-muted-foreground">
            論文メモとフェイマン・ノート
          </p>
        </div>
        <Button asChild>
          <Link href="/notes/new">
            <Plus className="mr-2 h-4 w-4" />
            新規ノート
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {notes.map((note) => (
          <Link key={note.id} href={`/notes/${note.id}`}>
            <Card className="transition-colors hover:border-primary/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-1 text-base">
                    {note.title}
                  </CardTitle>
                  <StickyNote className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="line-clamp-2 text-sm text-muted-foreground">
                  {note.excerpt}
                </p>
                {note.paper && (
                  <p className="mt-2 truncate text-xs text-muted-foreground">
                    📄 {note.paper}
                  </p>
                )}
                <div className="mt-3 flex items-center justify-between">
                  <div className="flex gap-1">
                    {note.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>
                  <span className="flex items-center gap-1 text-xs text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {note.updatedAt}
                  </span>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
