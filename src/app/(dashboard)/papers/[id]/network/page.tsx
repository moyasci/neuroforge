import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Network, ExternalLink } from "lucide-react";

export default async function NetworkPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const citations = [
    { title: "Sequence to Sequence Learning with Neural Networks", year: 2014 },
    { title: "Neural Machine Translation by Jointly Learning to Align", year: 2015 },
    { title: "Convolutional Sequence to Sequence Learning", year: 2017 },
  ];

  const citedBy = [
    { title: "BERT: Pre-training of Deep Bidirectional Transformers", year: 2019 },
    { title: "GPT-2: Language Models are Unsupervised Multitask Learners", year: 2019 },
    { title: "Vision Transformer (ViT)", year: 2021 },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href={`/papers/${id}`}>
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <Network className="h-5 w-5" />
            引用ネットワーク
          </h2>
          <p className="text-sm text-muted-foreground">
            Attention Is All You Need
          </p>
        </div>
      </div>

      {/* Graph Visualization Area */}
      <Card>
        <CardContent className="p-0">
          <div className="flex h-80 items-center justify-center rounded-lg border-2 border-dashed m-4">
            <div className="text-center">
              <Network className="mx-auto h-12 w-12 text-muted-foreground" />
              <p className="mt-2 text-muted-foreground">
                インタラクティブ引用グラフ表示エリア
              </p>
              <p className="text-xs text-muted-foreground">
                (D3.js / React Flow で実装予定)
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* References */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              参考文献
              <Badge variant="secondary">{citations.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {citations.map((paper, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{paper.title}</p>
                    <p className="text-xs text-muted-foreground">{paper.year}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Cited By */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              被引用
              <Badge variant="secondary">{citedBy.length}</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {citedBy.map((paper, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between rounded-md border p-3"
                >
                  <div>
                    <p className="text-sm font-medium">{paper.title}</p>
                    <p className="text-xs text-muted-foreground">{paper.year}</p>
                  </div>
                  <ExternalLink className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
