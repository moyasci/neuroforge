import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Layout, MousePointer2, Square, Type, Link2 } from "lucide-react";

export default function CanvasPage() {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" asChild>
            <Link href="/knowledge">
              <ArrowLeft className="h-4 w-4" />
            </Link>
          </Button>
          <div>
            <h2 className="text-xl font-bold tracking-tight">
              Canvas ワークスペース
            </h2>
            <p className="text-sm text-muted-foreground">
              自由にノードを配置して知識を整理
            </p>
          </div>
        </div>
        <div className="flex items-center gap-1 rounded-md border p-1">
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <MousePointer2 className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Square className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Type className="h-4 w-4" />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8">
            <Link2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <div className="flex h-[calc(100vh-12rem)] items-center justify-center">
            <div className="text-center">
              <Layout className="mx-auto h-16 w-16 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium text-muted-foreground">
                Canvas ワークスペース
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                ドラッグ＆ドロップで概念・論文・ノートを自由に配置
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                (React Flow で実装予定)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
