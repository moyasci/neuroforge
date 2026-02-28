"use client";

import { use } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Send, Bot, User } from "lucide-react";

const messages = [
  {
    role: "ai" as const,
    content:
      "Self-Attention について確認しましょう。まず、Self-Attention の基本的な仕組みを自分の言葉で説明してみてください。",
  },
  {
    role: "user" as const,
    content:
      "Self-Attention は、入力シーケンスの各トークンが他のすべてのトークンとの関連度を計算する仕組みです。Query, Key, Value の3つのベクトルを使って注意重みを計算します。",
  },
  {
    role: "ai" as const,
    content:
      "良い説明ですね！ Query, Key, Value について理解できています。では、なぜ Scaled Dot-Product を使うのか、スケーリングの役割を説明できますか？",
  },
  {
    role: "user" as const,
    content:
      "次元数が大きくなると内積の値が大きくなりすぎて softmax が極端な値になるため、√d_k で割ることで安定させています。",
  },
  {
    role: "ai" as const,
    content:
      "正確です！ スケーリングの目的を正しく理解しています。次に、Multi-Head Attention について質問します。なぜ単一のAttention ではなく複数のヘッドを使うのでしょうか？",
  },
];

export default function FeedbackChatPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="flex h-[calc(100vh-7rem)] flex-col">
      {/* Header */}
      <div className="flex items-center justify-between border-b pb-4">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/feedback">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-lg font-bold">
              Self-Attention 理解度チェック
            </h2>
            <p className="text-xs text-muted-foreground">
              Session ID: {id}
            </p>
          </div>
        </div>
        <Badge variant="secondary">進行中</Badge>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-auto py-4">
        <div className="mx-auto max-w-2xl space-y-4">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
            >
              <div
                className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${
                  msg.role === "ai"
                    ? "bg-primary text-primary-foreground"
                    : "bg-muted"
                }`}
              >
                {msg.role === "ai" ? (
                  <Bot className="h-4 w-4" />
                ) : (
                  <User className="h-4 w-4" />
                )}
              </div>
              <Card
                className={`max-w-md ${msg.role === "user" ? "bg-primary text-primary-foreground" : ""}`}
              >
                <CardContent className="p-3">
                  <p className="text-sm">{msg.content}</p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {/* Input */}
      <div className="border-t pt-4">
        <div className="mx-auto flex max-w-2xl gap-2">
          <Input placeholder="回答を入力..." className="flex-1" />
          <Button size="icon">
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
