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
  Lightbulb,
  FileText,
  StickyNote,
  Link2,
} from "lucide-react";

export default async function ConceptDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/knowledge">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <div className="flex items-center gap-2">
            <Lightbulb className="h-5 w-5 text-yellow-500" />
            <h2 className="text-2xl font-bold tracking-tight">
              Self-Attention
            </h2>
          </div>
          <p className="text-sm text-muted-foreground">Concept ID: {id}</p>
        </div>
      </div>

      {/* Description */}
      <Card>
        <CardHeader>
          <CardTitle>概要</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm leading-relaxed text-muted-foreground">
            Self-Attention（自己注意機構）は、入力シーケンス内の各要素が他のすべての要素との
            関連度を計算する機構。Query, Key, Value の3つの変換行列を用い、
            Scaled Dot-Product Attention により重み付き和を算出する。
            計算量は O(n^2) だが、並列計算が可能であり RNN と比べて学習効率が高い。
          </p>
          <div className="mt-3 flex gap-2">
            <Badge>NLP</Badge>
            <Badge>Transformer</Badge>
            <Badge variant="outline">基礎概念</Badge>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Related Papers */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              関連論文
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                { title: "Attention Is All You Need", relation: "提案論文" },
                { title: "BERT", relation: "応用" },
                { title: "Vision Transformer", relation: "拡張" },
              ].map((paper, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <span className="text-sm font-medium">{paper.title}</span>
                  <Badge variant="outline">{paper.relation}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Related Notes */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <StickyNote className="h-4 w-4" />
              関連ノート
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {[
                "Transformer アーキテクチャまとめ",
                "Attention 計算の最適化手法",
                "Multi-head vs Single-head 比較",
              ].map((note, i) => (
                <div key={i} className="rounded-md border p-3 text-sm font-medium">
                  {note}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Related Concepts */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Link2 className="h-4 w-4" />
              関連概念
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {[
                "Multi-Head Attention",
                "Scaled Dot-Product",
                "Positional Encoding",
                "Layer Normalization",
                "Feed-Forward Network",
                "Encoder-Decoder",
                "Cross-Attention",
                "Masked Attention",
              ].map((concept) => (
                <Badge
                  key={concept}
                  variant="secondary"
                  className="cursor-pointer px-3 py-1 text-sm"
                >
                  {concept}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
