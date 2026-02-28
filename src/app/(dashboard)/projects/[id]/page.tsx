import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Plus,
  FileText,
  StickyNote,
  Calendar,
} from "lucide-react";

const entries = [
  {
    type: "paper" as const,
    title: "Attention Is All You Need",
    date: "2024-01-15",
    status: "Pass 3",
  },
  {
    type: "note" as const,
    title: "Transformer アーキテクチャまとめ",
    date: "2024-01-16",
    status: "更新済み",
  },
  {
    type: "paper" as const,
    title: "BERT: Pre-training of Deep Bidirectional Transformers",
    date: "2024-01-18",
    status: "Pass 2",
  },
  {
    type: "note" as const,
    title: "BERT の事前学習手法",
    date: "2024-01-19",
    status: "更新済み",
  },
  {
    type: "paper" as const,
    title: "GPT-4 Technical Report",
    date: "2024-01-20",
    status: "Pass 1",
  },
];

export default async function ProjectDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Transformer サーベイ
          </h2>
          <p className="text-muted-foreground">Project ID: {id}</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          エントリ追加
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">論文数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">8</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">ノート数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">ステータス</CardTitle>
          </CardHeader>
          <CardContent>
            <Badge variant="secondary">進行中</Badge>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>エントリ一覧</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {entries.map((entry, i) => (
              <div
                key={i}
                className="flex items-center justify-between rounded-md border p-3"
              >
                <div className="flex items-center gap-3">
                  {entry.type === "paper" ? (
                    <FileText className="h-4 w-4 text-blue-500" />
                  ) : (
                    <StickyNote className="h-4 w-4 text-green-500" />
                  )}
                  <div>
                    <p className="text-sm font-medium">{entry.title}</p>
                    <p className="flex items-center gap-1 text-xs text-muted-foreground">
                      <Calendar className="h-3 w-3" />
                      {entry.date}
                    </p>
                  </div>
                </div>
                <Badge variant="outline">{entry.status}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
