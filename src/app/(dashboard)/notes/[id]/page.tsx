"use client";

import { use } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  ArrowLeft,
  Save,
  MessageSquare,
  Lightbulb,
  AlertTriangle,
} from "lucide-react";

export default function NoteEditorPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/notes">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-lg font-bold tracking-tight">
              Transformer アーキテクチャまとめ
            </h2>
            <p className="text-xs text-muted-foreground">Note ID: {id}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="secondary">自動保存済み</Badge>
          <Button size="sm">
            <Save className="mr-2 h-4 w-4" />
            保存
          </Button>
        </div>
      </div>

      <div className="grid h-[calc(100vh-12rem)] gap-4 lg:grid-cols-3">
        {/* Editor Area */}
        <Card className="lg:col-span-2">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm">エディタ</CardTitle>
          </CardHeader>
          <CardContent className="h-full">
            <div className="flex h-[calc(100%-2rem)] items-center justify-center rounded-lg border-2 border-dashed">
              <div className="text-center">
                <p className="text-muted-foreground">
                  Tiptap リッチテキストエディタ
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  マークダウン / 数式 / コードブロック対応
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* AI Feedback Panel */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="flex items-center gap-2 text-sm">
              <MessageSquare className="h-4 w-4" />
              AI フィードバック
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border border-green-500/30 bg-green-500/10 p-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <Lightbulb className="h-4 w-4 text-green-500" />
                理解度チェック
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Self-attention の説明が正確です。Query, Key,
                Value の役割を自分の言葉で説明できています。
              </p>
            </div>

            <div className="rounded-md border border-yellow-500/30 bg-yellow-500/10 p-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <AlertTriangle className="h-4 w-4 text-yellow-500" />
                改善提案
              </div>
              <p className="mt-1 text-xs text-muted-foreground">
                Positional Encoding の説明にもう少し数式的な裏付けを
                追加すると、理解が深まります。
              </p>
            </div>

            <div className="rounded-md border p-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <MessageSquare className="h-4 w-4" />
                関連質問
              </div>
              <ul className="mt-1 space-y-1 text-xs text-muted-foreground">
                <li>- Multi-head attention はなぜ有効？</li>
                <li>- Layer normalization の位置は？</li>
                <li>- Decoder の masked attention とは？</li>
              </ul>
            </div>

            <Button variant="outline" className="w-full" size="sm">
              フィードバックを更新
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
