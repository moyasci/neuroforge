"use client";

import { use } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, Maximize2, BookOpen } from "lucide-react";

export default function ImmersiveReadingPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);

  return (
    <div className="flex h-[calc(100vh-3.5rem)] flex-col">
      {/* Minimal Header */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" asChild>
            <Link href={`/papers/${id}`}>
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <p className="text-sm font-medium">没入読解モード</p>
            <p className="text-xs text-muted-foreground">
              Attention Is All You Need
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 rounded-md border px-3 py-1.5">
            <Clock className="h-4 w-4 text-muted-foreground" />
            <span className="font-mono text-sm">00:25:30</span>
          </div>
          <Badge variant="secondary">Pass 1</Badge>
          <Button variant="ghost" size="icon">
            <Maximize2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Reading Area */}
      <div className="flex flex-1 items-center justify-center bg-muted/30">
        <div className="text-center">
          <BookOpen className="mx-auto h-16 w-16 text-muted-foreground" />
          <p className="mt-4 text-lg text-muted-foreground">
            没入読解ビューア
          </p>
          <p className="mt-1 text-sm text-muted-foreground">
            PDF レンダリングエリア
          </p>
          <p className="mt-4 text-xs text-muted-foreground">
            集中タイマーが進行中です。ハイライトやアノテーションを追加できます。
          </p>
        </div>
      </div>
    </div>
  );
}
