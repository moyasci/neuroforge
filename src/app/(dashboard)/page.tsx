import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  StickyNote,
  FolderKanban,
  Flame,
  Clock,
  BookOpen,
} from "lucide-react";

const stats = [
  { label: "論文数", value: "24", icon: FileText, color: "text-blue-500" },
  { label: "ノート数", value: "56", icon: StickyNote, color: "text-green-500" },
  {
    label: "プロジェクト数",
    value: "3",
    icon: FolderKanban,
    color: "text-purple-500",
  },
  {
    label: "学習ストリーク",
    value: "7日",
    icon: Flame,
    color: "text-orange-500",
  },
];

const recentActivity = [
  { title: "Attention Is All You Need を読了", time: "2時間前", type: "読解" },
  { title: "Transformer ノートを更新", time: "5時間前", type: "ノート" },
  { title: "新規論文を登録", time: "1日前", type: "登録" },
  { title: "フィードバックセッション完了", time: "2日前", type: "FB" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">ダッシュボード</h2>
        <p className="text-muted-foreground">
          学習の進捗と最近のアクティビティ
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <Card key={stat.label}>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.label}
              </CardTitle>
              <stat.icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-4 w-4" />
              最近のアクティビティ
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((item, i) => (
                <div
                  key={i}
                  className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                >
                  <div>
                    <p className="text-sm font-medium">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </div>
                  <Badge variant="secondary">{item.type}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Reading Progress */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-4 w-4" />
              読解進捗
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { title: "Attention Is All You Need", pass: 3, total: 4 },
                { title: "BERT: Pre-training of Deep...", pass: 2, total: 4 },
                { title: "GPT-4 Technical Report", pass: 1, total: 4 },
              ].map((paper, i) => (
                <div key={i} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="truncate font-medium">{paper.title}</span>
                    <span className="text-muted-foreground">
                      Pass {paper.pass}/{paper.total}
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-primary"
                      style={{
                        width: `${(paper.pass / paper.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
