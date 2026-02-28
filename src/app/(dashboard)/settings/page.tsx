"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Settings, Palette, BookOpen, Key, Save } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-5 w-5" />
          設定
        </h2>
        <p className="text-muted-foreground">
          アプリケーションの各種設定を管理
        </p>
      </div>

      {/* Color Code Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Palette className="h-4 w-4" />
            カラーコード設定
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-muted-foreground">
            アノテーションで使用するカラーコードの意味を設定します
          </p>
          {[
            { color: "bg-red-500", label: "懐疑・反論" },
            { color: "bg-yellow-400", label: "主要テーゼ" },
            { color: "bg-green-500", label: "引用予定" },
            { color: "bg-purple-500", label: "構造マーカー" },
            { color: "bg-blue-500", label: "関連文献" },
            { color: "bg-orange-500", label: "定義・用語" },
            { color: "bg-gray-400", label: "背景情報" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-3">
              <div className={`h-6 w-6 rounded ${item.color}`} />
              <Input defaultValue={item.label} className="flex-1" />
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Reading Preferences */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BookOpen className="h-4 w-4" />
            読解プリファレンス
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="timer">デフォルトタイマー（分）</Label>
            <Input id="timer" type="number" defaultValue="25" />
          </div>
          <div className="space-y-2">
            <Label htmlFor="font-size">フォントサイズ</Label>
            <Input id="font-size" type="number" defaultValue="16" />
          </div>
          <div className="space-y-2">
            <Label>4-Pass テンプレート</Label>
            <div className="flex gap-2">
              <Badge variant="secondary">デフォルト</Badge>
              <Badge variant="outline">カスタム 1</Badge>
              <Badge variant="outline">+ 追加</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* API Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Key className="h-4 w-4" />
            API 設定
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="openai-key">OpenAI API Key</Label>
            <Input
              id="openai-key"
              type="password"
              placeholder="sk-..."
              defaultValue=""
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="anthropic-key">Anthropic API Key</Label>
            <Input
              id="anthropic-key"
              type="password"
              placeholder="sk-ant-..."
              defaultValue=""
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="semantic-scholar">Semantic Scholar API Key（任意）</Label>
            <Input
              id="semantic-scholar"
              type="password"
              placeholder="任意"
              defaultValue=""
            />
          </div>
        </CardContent>
      </Card>

      <Button className="w-full">
        <Save className="mr-2 h-4 w-4" />
        設定を保存
      </Button>
    </div>
  );
}
