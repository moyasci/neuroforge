"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ArrowLeft, MessageSquare, FileText, Brain } from "lucide-react";

export default function NewFeedbackPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/feedback">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            新規フィードバックセッション
          </h2>
          <p className="text-muted-foreground">
            AI と対話して理解度をチェック
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="h-4 w-4" />
            セッション設定
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="topic">トピック</Label>
            <Input
              id="topic"
              placeholder="例: Transformer の Self-Attention について"
            />
          </div>

          <div className="space-y-2">
            <Label>関連リソース（任意）</Label>
            <div className="grid gap-2 sm:grid-cols-2">
              <Button variant="outline" className="h-20 flex-col gap-2">
                <FileText className="h-5 w-5" />
                <span className="text-xs">論文を選択</span>
              </Button>
              <Button variant="outline" className="h-20 flex-col gap-2">
                <Brain className="h-5 w-5" />
                <span className="text-xs">概念を選択</span>
              </Button>
            </div>
          </div>

          <div className="space-y-2">
            <Label>フィードバックタイプ</Label>
            <div className="grid gap-2 sm:grid-cols-3">
              {["理解度チェック", "ソクラテス式質問", "フリー対話"].map(
                (type) => (
                  <Button key={type} variant="outline" className="text-sm">
                    {type}
                  </Button>
                )
              )}
            </div>
          </div>

          <Button className="w-full">セッションを開始</Button>
        </CardContent>
      </Card>
    </div>
  );
}
