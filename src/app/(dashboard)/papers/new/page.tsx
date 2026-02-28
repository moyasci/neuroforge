"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowLeft, Upload, Globe, PenLine } from "lucide-react";

export default function NewPaperPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/papers">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h2 className="text-2xl font-bold tracking-tight">新規論文登録</h2>
          <p className="text-muted-foreground">
            論文をインポートして読解を開始
          </p>
        </div>
      </div>

      <Tabs defaultValue="pdf">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="pdf" className="flex items-center gap-2">
            <Upload className="h-4 w-4" />
            PDF
          </TabsTrigger>
          <TabsTrigger value="url" className="flex items-center gap-2">
            <Globe className="h-4 w-4" />
            URL / DOI
          </TabsTrigger>
          <TabsTrigger value="manual" className="flex items-center gap-2">
            <PenLine className="h-4 w-4" />
            手動入力
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pdf">
          <Card>
            <CardHeader>
              <CardTitle>PDF ファイルをアップロード</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex h-40 items-center justify-center rounded-lg border-2 border-dashed">
                <div className="text-center">
                  <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    ここにPDFをドラッグ＆ドロップ
                  </p>
                  <Button variant="link" className="mt-1" size="sm">
                    またはファイルを選択
                  </Button>
                </div>
              </div>
              <Button className="w-full">アップロードして解析</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="url">
          <Card>
            <CardHeader>
              <CardTitle>URL または DOI で取得</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">論文URL / DOI</Label>
                <Input
                  id="url"
                  placeholder="https://arxiv.org/abs/... または 10.xxxx/..."
                />
              </div>
              <Button className="w-full">メタデータを取得</Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>手動入力</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">タイトル</Label>
                <Input id="title" placeholder="論文タイトルを入力" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="authors">著者</Label>
                <Input id="authors" placeholder="著者名（カンマ区切り）" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="year">出版年</Label>
                  <Input id="year" type="number" placeholder="2024" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="field">分野</Label>
                  <Input id="field" placeholder="例: NLP, CV, ML" />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="abstract">アブストラクト</Label>
                <textarea
                  id="abstract"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  placeholder="アブストラクトを入力"
                />
              </div>
              <Button className="w-full">登録</Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
