import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Network, Layout, Search } from "lucide-react";

export default function KnowledgePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">ナレッジグラフ</h2>
          <p className="text-muted-foreground">
            概念間の関係を可視化・探索
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link href="/knowledge/canvas">
              <Layout className="mr-2 h-4 w-4" />
              Canvas
            </Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/search">
              <Search className="mr-2 h-4 w-4" />
              GraphRAG 検索
            </Link>
          </Button>
        </div>
      </div>

      {/* Graph Container */}
      <Card>
        <CardContent className="p-0">
          <div className="flex h-[calc(100vh-16rem)] items-center justify-center">
            <div className="text-center">
              <Network className="mx-auto h-16 w-16 text-muted-foreground" />
              <p className="mt-4 text-lg font-medium text-muted-foreground">
                ナレッジグラフ
              </p>
              <p className="mt-1 text-sm text-muted-foreground">
                概念ノード・論文ノード・ノートノードの関係を表示
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                (React Flow / D3.js で実装予定)
              </p>
              <div className="mt-4 flex justify-center gap-2">
                <Badge variant="outline">概念: 42</Badge>
                <Badge variant="outline">論文: 24</Badge>
                <Badge variant="outline">ノート: 56</Badge>
                <Badge variant="outline">エッジ: 128</Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
