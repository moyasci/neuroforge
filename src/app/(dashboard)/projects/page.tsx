import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, FolderKanban, FileText, StickyNote } from "lucide-react";

const projects = [
  {
    id: "1",
    title: "Transformer サーベイ",
    description: "Transformer 系アーキテクチャの網羅的調査",
    papers: 8,
    notes: 12,
    status: "進行中",
  },
  {
    id: "2",
    title: "拡散モデル研究",
    description: "Diffusion Models の理論と応用の整理",
    papers: 5,
    notes: 7,
    status: "進行中",
  },
  {
    id: "3",
    title: "GNN 基礎学習",
    description: "グラフニューラルネットワークの基礎概念習得",
    papers: 4,
    notes: 6,
    status: "完了",
  },
];

export default function ProjectsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">プロジェクト</h2>
          <p className="text-muted-foreground">
            論文・ノートをプロジェクトで整理
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          新規プロジェクト
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link key={project.id} href={`/projects/${project.id}`}>
            <Card className="transition-colors hover:border-primary/50">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <CardTitle className="text-base">{project.title}</CardTitle>
                  <FolderKanban className="h-4 w-4 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  {project.description}
                </p>
                <div className="mt-4 flex items-center justify-between">
                  <div className="flex gap-3 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <FileText className="h-3 w-3" />
                      {project.papers}
                    </span>
                    <span className="flex items-center gap-1">
                      <StickyNote className="h-3 w-3" />
                      {project.notes}
                    </span>
                  </div>
                  <Badge
                    variant={
                      project.status === "完了" ? "default" : "secondary"
                    }
                  >
                    {project.status}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
