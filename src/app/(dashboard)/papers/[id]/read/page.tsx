"use client";

import { use } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, CheckCircle2, Circle, BookOpen } from "lucide-react";

const passes = [
  {
    key: "overview",
    label: "Pass 1: 概観",
    description: "タイトル・アブストラクト・見出し・結論を確認し、論文の全体像を把握する",
    tasks: [
      { text: "タイトルと著者を確認", done: true },
      { text: "アブストラクトを読む", done: true },
      { text: "セクション見出しを確認", done: false },
      { text: "結論を流し読み", done: false },
    ],
  },
  {
    key: "conclusion",
    label: "Pass 2: 結論確認",
    description: "図表・結論・参考文献を中心に、研究の主張と根拠を把握する",
    tasks: [
      { text: "図表をすべて確認", done: false },
      { text: "結論を精読", done: false },
      { text: "参考文献の重要度を評価", done: false },
    ],
  },
  {
    key: "analysis",
    label: "Pass 3: データ解析",
    description: "実験手法・データ・結果を詳細に分析する",
    tasks: [
      { text: "実験設定を理解", done: false },
      { text: "結果の再現可能性を評価", done: false },
      { text: "統計的手法の妥当性を確認", done: false },
    ],
  },
  {
    key: "detail",
    label: "Pass 4: 詳細精読",
    description: "数式・証明・前提条件を含めた完全な理解を目指す",
    tasks: [
      { text: "数式の導出を追う", done: false },
      { text: "前提条件・仮定を整理", done: false },
      { text: "限界と今後の課題を特定", done: false },
      { text: "自分の言葉で要約する", done: false },
    ],
  },
];

export default function ReadPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/papers/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h2 className="text-xl font-bold tracking-tight">
            4-Pass 読解
          </h2>
          <p className="text-sm text-muted-foreground">
            Attention Is All You Need
          </p>
        </div>
        <Badge variant="secondary">Pass 1 進行中</Badge>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="grid w-full grid-cols-4">
          {passes.map((pass) => (
            <TabsTrigger key={pass.key} value={pass.key}>
              {pass.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {passes.map((pass) => (
          <TabsContent key={pass.key} value={pass.key}>
            <div className="grid gap-6 lg:grid-cols-3">
              {/* Reading Area */}
              <Card className="lg:col-span-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <BookOpen className="h-4 w-4" />
                    読解エリア
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex h-96 items-center justify-center rounded-lg border-2 border-dashed">
                    <p className="text-muted-foreground">
                      PDF ビューア / テキスト表示エリア
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Tasks Panel */}
              <Card>
                <CardHeader>
                  <CardTitle>{pass.label}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    {pass.description}
                  </p>
                  <div className="space-y-3">
                    {pass.tasks.map((task, i) => (
                      <div key={i} className="flex items-center gap-3">
                        {task.done ? (
                          <CheckCircle2 className="h-4 w-4 text-green-500" />
                        ) : (
                          <Circle className="h-4 w-4 text-muted-foreground" />
                        )}
                        <span
                          className={`text-sm ${task.done ? "line-through text-muted-foreground" : ""}`}
                        >
                          {task.text}
                        </span>
                      </div>
                    ))}
                  </div>
                  <Button className="mt-4 w-full" variant="outline">
                    このパスを完了にする
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
}
