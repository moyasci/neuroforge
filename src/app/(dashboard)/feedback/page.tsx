import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, MessageSquare, Calendar, Brain } from "lucide-react";

const sessions = [
  {
    id: "1",
    topic: "Transformer の Self-Attention 理解度チェック",
    date: "2024-01-20",
    score: 85,
    status: "完了",
  },
  {
    id: "2",
    topic: "BERT の Pre-training 手法について",
    date: "2024-01-18",
    score: 72,
    status: "完了",
  },
  {
    id: "3",
    topic: "拡散モデルの数学的基礎",
    date: "2024-01-15",
    score: null,
    status: "進行中",
  },
  {
    id: "4",
    topic: "GNN の Message Passing フレームワーク",
    date: "2024-01-12",
    score: 90,
    status: "完了",
  },
];

export default function FeedbackPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">
            フィードバック
          </h2>
          <p className="text-muted-foreground">
            AI との対話で理解度を確認・深化
          </p>
        </div>
        <Button asChild>
          <Link href="/feedback/new">
            <Plus className="mr-2 h-4 w-4" />
            新規セッション
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        {sessions.map((session) => (
          <Link key={session.id} href={`/feedback/${session.id}`}>
            <Card className="transition-colors hover:border-primary/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{session.topic}</CardTitle>
                  <MessageSquare className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {session.date}
                  </span>
                  <div className="flex items-center gap-2">
                    {session.score !== null && (
                      <span className="flex items-center gap-1 text-sm">
                        <Brain className="h-3 w-3" />
                        {session.score}%
                      </span>
                    )}
                    <Badge
                      variant={
                        session.status === "完了" ? "default" : "secondary"
                      }
                    >
                      {session.status}
                    </Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
