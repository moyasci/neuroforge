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
  BookOpen,
  Network,
  MessageSquare,
  Calendar,
  User,
  Tag,
} from "lucide-react";

export default async function PaperDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/papers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div className="flex-1">
          <h2 className="text-2xl font-bold tracking-tight">
            Attention Is All You Need
          </h2>
          <p className="text-muted-foreground">Paper ID: {id}</p>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        <Button asChild>
          <Link href={`/papers/${id}/read`}>
            <BookOpen className="mr-2 h-4 w-4" />
            4-Pass 読解を開始
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/papers/${id}/network`}>
            <Network className="mr-2 h-4 w-4" />
            引用ネットワーク
          </Link>
        </Button>
        <Button variant="outline" asChild>
          <Link href={`/reading/${id}`}>
            <BookOpen className="mr-2 h-4 w-4" />
            没入読解モード
          </Link>
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Info */}
        <div className="space-y-6 lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>アブストラクト</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm leading-relaxed text-muted-foreground">
                The dominant sequence transduction models are based on complex
                recurrent or convolutional neural networks that include an
                encoder and a decoder. The best performing models also connect
                the encoder and decoder through an attention mechanism. We
                propose a new simple network architecture, the Transformer,
                based solely on attention mechanisms, dispensing with recurrence
                and convolutions entirely...
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MessageSquare className="h-4 w-4" />
                アノテーション・メモ
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  {
                    text: "Self-attention の計算量が O(n²) である点に注意",
                    color: "bg-yellow-500/10 border-yellow-500/30",
                  },
                  {
                    text: "Multi-head attention により異なる部分空間の情報を同時に扱える",
                    color: "bg-blue-500/10 border-blue-500/30",
                  },
                  {
                    text: "Positional encoding は正弦波関数ベース",
                    color: "bg-green-500/10 border-green-500/30",
                  },
                ].map((note, i) => (
                  <div
                    key={i}
                    className={`rounded-md border p-3 text-sm ${note.color}`}
                  >
                    {note.text}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>メタデータ</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2 text-sm">
                <User className="h-4 w-4 text-muted-foreground" />
                <span>Vaswani, Shazeer, Parmar et al.</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>2017</span>
              </div>
              <div className="flex items-center gap-2 text-sm">
                <Tag className="h-4 w-4 text-muted-foreground" />
                <div className="flex gap-1">
                  <Badge variant="outline">NLP</Badge>
                  <Badge variant="outline">Transformer</Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>読解進捗</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {["概観", "結論確認", "データ解析", "詳細精読"].map(
                  (pass, i) => (
                    <div
                      key={i}
                      className="flex items-center justify-between text-sm"
                    >
                      <span>Pass {i + 1}: {pass}</span>
                      <Badge variant={i < 3 ? "default" : "outline"}>
                        {i < 3 ? "完了" : "未着手"}
                      </Badge>
                    </div>
                  )
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
