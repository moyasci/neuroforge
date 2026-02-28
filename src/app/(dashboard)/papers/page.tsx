"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Plus, FileText, Calendar, User } from "lucide-react";

const papers = [
  {
    id: "1",
    title: "Attention Is All You Need",
    authors: "Vaswani et al.",
    year: 2017,
    field: "NLP",
    pass: 3,
  },
  {
    id: "2",
    title: "BERT: Pre-training of Deep Bidirectional Transformers",
    authors: "Devlin et al.",
    year: 2019,
    field: "NLP",
    pass: 2,
  },
  {
    id: "3",
    title: "Diffusion Models Beat GANs on Image Synthesis",
    authors: "Dhariwal & Nichol",
    year: 2021,
    field: "CV",
    pass: 1,
  },
  {
    id: "4",
    title: "Graph Neural Networks: A Review of Methods and Applications",
    authors: "Zhou et al.",
    year: 2020,
    field: "Graph",
    pass: 0,
  },
  {
    id: "5",
    title: "Scaling Laws for Neural Language Models",
    authors: "Kaplan et al.",
    year: 2020,
    field: "ML",
    pass: 4,
  },
  {
    id: "6",
    title: "Retrieval-Augmented Generation for Knowledge-Intensive Tasks",
    authors: "Lewis et al.",
    year: 2020,
    field: "NLP",
    pass: 1,
  },
];

const passLabel = (pass: number) => {
  if (pass === 0) return "未読";
  if (pass === 4) return "読了";
  return `Pass ${pass}/4`;
};

const passVariant = (pass: number) => {
  if (pass === 0) return "outline" as const;
  if (pass === 4) return "default" as const;
  return "secondary" as const;
};

export default function PapersPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">論文</h2>
          <p className="text-muted-foreground">登録済み論文の一覧と管理</p>
        </div>
        <Button asChild>
          <Link href="/papers/new">
            <Plus className="mr-2 h-4 w-4" />
            新規登録
          </Link>
        </Button>
      </div>

      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">すべて</TabsTrigger>
          <TabsTrigger value="nlp">NLP</TabsTrigger>
          <TabsTrigger value="cv">CV</TabsTrigger>
          <TabsTrigger value="ml">ML</TabsTrigger>
          <TabsTrigger value="graph">Graph</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {papers.map((paper) => (
          <Link key={paper.id} href={`/papers/${paper.id}`}>
            <Card className="transition-colors hover:border-primary/50">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <CardTitle className="line-clamp-2 text-base">
                    {paper.title}
                  </CardTitle>
                  <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <User className="h-3 w-3" />
                    {paper.authors}
                  </div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Calendar className="h-3 w-3" />
                    {paper.year}
                  </div>
                  <div className="flex items-center gap-2 pt-1">
                    <Badge variant="outline">{paper.field}</Badge>
                    <Badge variant={passVariant(paper.pass)}>
                      {passLabel(paper.pass)}
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
