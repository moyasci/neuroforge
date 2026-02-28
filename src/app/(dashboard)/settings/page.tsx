"use client";

import { useEffect, useState, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { Settings, Palette, BookOpen, Key, Save, Check, Cloud, CloudOff, Loader2, AlertCircle } from "lucide-react";
import { getSyncConfig, syncAllToCloud, type SyncResult } from "@/db/sync";
import { useDatabaseStatus } from "@/db/provider";
import { ANNOTATION_COLORS } from "@/types";
import {
  getReadingPreferences,
  updateReadingPreferences,
  type ReadingPreferences,
} from "@/lib/settings/actions";

const API_KEYS_STORAGE_KEY = "neuroforge_api_keys";

interface ApiKeys {
  openai: string;
  anthropic: string;
  semanticScholar: string;
}

function maskKey(key: string): string {
  if (!key || key.length < 8) return key;
  return `****...${key.slice(-4)}`;
}

function loadApiKeys(): ApiKeys {
  if (typeof window === "undefined") return { openai: "", anthropic: "", semanticScholar: "" };
  try {
    const stored = localStorage.getItem(API_KEYS_STORAGE_KEY);
    if (stored) return JSON.parse(stored);
  } catch {
    // ignore
  }
  return { openai: "", anthropic: "", semanticScholar: "" };
}

function saveApiKeys(keys: ApiKeys) {
  localStorage.setItem(API_KEYS_STORAGE_KEY, JSON.stringify(keys));
}

export default function SettingsPage() {
  const { isReady } = useDatabaseStatus();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [prefs, setPrefs] = useState<ReadingPreferences>({
    timerEnabled: true,
    focusMode: false,
    fontSize: "16",
    defaultTemplate: "default",
  });
  const [apiKeys, setApiKeys] = useState<ApiKeys>({
    openai: "",
    anthropic: "",
    semanticScholar: "",
  });
  // Track whether API key inputs have been edited (to avoid showing masked values as actual values)
  const [apiKeyEdited, setApiKeyEdited] = useState({
    openai: false,
    anthropic: false,
    semanticScholar: false,
  });

  // Cloud sync state
  const [syncEnabled] = useState(() => getSyncConfig().enabled);
  const [syncing, setSyncing] = useState(false);
  const [syncResults, setSyncResults] = useState<SyncResult[] | null>(null);
  const [syncError, setSyncError] = useState<string | null>(null);

  const handleSync = async () => {
    setSyncing(true);
    setSyncError(null);
    setSyncResults(null);
    try {
      const results = await syncAllToCloud();
      setSyncResults(results);
      const errors = results.flatMap((r) => r.errors);
      if (errors.length > 0) {
        setSyncError(errors.join("; "));
      }
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : "同期に失敗しました");
    } finally {
      setSyncing(false);
    }
  };

  const loadData = useCallback(async () => {
    if (!isReady) return;
    try {
      const db = (await import("@/db/pglite")).getDatabase();
      if (!db) return;
      const readingPrefs = await getReadingPreferences(db);
      setPrefs(readingPrefs);
      setApiKeys(loadApiKeys());
    } catch (err) {
      console.error("Failed to load settings:", err);
    } finally {
      setLoading(false);
    }
  }, [isReady]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const db = (await import("@/db/pglite")).getDatabase();
      if (db) {
        await updateReadingPreferences(db, prefs);
      }
      // Save only edited API keys
      const currentKeys = loadApiKeys();
      saveApiKeys({
        openai: apiKeyEdited.openai ? apiKeys.openai : currentKeys.openai,
        anthropic: apiKeyEdited.anthropic ? apiKeys.anthropic : currentKeys.anthropic,
        semanticScholar: apiKeyEdited.semanticScholar ? apiKeys.semanticScholar : currentKeys.semanticScholar,
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  if (!isReady || loading) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64" />
        <Skeleton className="h-48" />
        <Skeleton className="h-48" />
      </div>
    );
  }

  const colorEntries = Object.entries(ANNOTATION_COLORS) as Array<
    [string, { label: string; description: string }]
  >;

  const colorClasses: Record<string, string> = {
    red: "bg-red-500",
    yellow: "bg-yellow-400",
    green: "bg-green-500",
    purple: "bg-purple-500",
    blue: "bg-blue-500",
    orange: "bg-orange-500",
    gray: "bg-gray-400",
  };

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
            アノテーションで使用するカラーコードの意味
          </p>
          {colorEntries.map(([color, info]) => (
            <div key={color} className="flex items-center gap-3">
              <div className={`h-6 w-6 rounded ${colorClasses[color]}`} />
              <span className="text-sm flex-1">{info.label}</span>
              <span className="text-xs text-muted-foreground">{info.description}</span>
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
          <div className="flex items-center justify-between">
            <Label htmlFor="timer-enabled">タイマー有効</Label>
            <Button
              variant={prefs.timerEnabled ? "default" : "outline"}
              size="sm"
              onClick={() => setPrefs((p) => ({ ...p, timerEnabled: !p.timerEnabled }))}
            >
              {prefs.timerEnabled ? "ON" : "OFF"}
            </Button>
          </div>
          <div className="flex items-center justify-between">
            <Label htmlFor="focus-mode">フォーカスモード</Label>
            <Button
              variant={prefs.focusMode ? "default" : "outline"}
              size="sm"
              onClick={() => setPrefs((p) => ({ ...p, focusMode: !p.focusMode }))}
            >
              {prefs.focusMode ? "ON" : "OFF"}
            </Button>
          </div>
          <div className="space-y-2">
            <Label htmlFor="font-size">フォントサイズ</Label>
            <Input
              id="font-size"
              type="number"
              value={prefs.fontSize}
              onChange={(e) => setPrefs((p) => ({ ...p, fontSize: e.target.value }))}
            />
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
            <Label htmlFor="anthropic-key">Anthropic API Key</Label>
            <Input
              id="anthropic-key"
              type="password"
              placeholder={apiKeys.anthropic ? maskKey(apiKeys.anthropic) : "sk-ant-..."}
              value={apiKeyEdited.anthropic ? apiKeys.anthropic : ""}
              onChange={(e) => {
                setApiKeyEdited((prev) => ({ ...prev, anthropic: true }));
                setApiKeys((prev) => ({ ...prev, anthropic: e.target.value }));
              }}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="openai-key">OpenAI API Key</Label>
            <Input
              id="openai-key"
              type="password"
              placeholder={apiKeys.openai ? maskKey(apiKeys.openai) : "sk-..."}
              value={apiKeyEdited.openai ? apiKeys.openai : ""}
              onChange={(e) => {
                setApiKeyEdited((prev) => ({ ...prev, openai: true }));
                setApiKeys((prev) => ({ ...prev, openai: e.target.value }));
              }}
            />
          </div>
          <Separator />
          <div className="space-y-2">
            <Label htmlFor="semantic-scholar">Semantic Scholar API Key（任意）</Label>
            <Input
              id="semantic-scholar"
              type="password"
              placeholder={apiKeys.semanticScholar ? maskKey(apiKeys.semanticScholar) : "任意"}
              value={apiKeyEdited.semanticScholar ? apiKeys.semanticScholar : ""}
              onChange={(e) => {
                setApiKeyEdited((prev) => ({ ...prev, semanticScholar: true }));
                setApiKeys((prev) => ({ ...prev, semanticScholar: e.target.value }));
              }}
            />
          </div>
        </CardContent>
      </Card>

      {/* Cloud Sync */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            {syncEnabled ? (
              <Cloud className="h-4 w-4 text-green-500" />
            ) : (
              <CloudOff className="h-4 w-4 text-muted-foreground" />
            )}
            クラウド同期
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <div
              className={`h-2.5 w-2.5 rounded-full ${
                syncEnabled ? "bg-green-500" : "bg-gray-400"
              }`}
            />
            <span className="text-sm">
              {syncEnabled ? "Supabase 接続済み" : "未設定"}
            </span>
          </div>
          {syncEnabled ? (
            <>
              <Button
                variant="outline"
                className="w-full"
                onClick={handleSync}
                disabled={syncing}
              >
                {syncing ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    同期中...
                  </>
                ) : (
                  "今すぐ同期"
                )}
              </Button>
              {syncResults && !syncError && (
                <div className="rounded-md border border-green-500/30 bg-green-500/5 p-3">
                  <p className="text-sm text-green-700">
                    同期完了 — 合計{" "}
                    {syncResults.reduce((sum, r) => sum + r.pushed, 0)} 行
                  </p>
                </div>
              )}
              {syncError && (
                <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3">
                  <div className="flex items-start gap-2">
                    <AlertCircle className="mt-0.5 h-4 w-4 text-destructive" />
                    <p className="text-sm text-destructive">{syncError}</p>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-md bg-muted p-3">
              <p className="text-sm text-muted-foreground">
                環境変数{" "}
                <code className="rounded bg-background px-1 py-0.5 text-xs">
                  NEXT_PUBLIC_SUPABASE_URL
                </code>{" "}
                と{" "}
                <code className="rounded bg-background px-1 py-0.5 text-xs">
                  SUPABASE_SERVICE_ROLE_KEY
                </code>{" "}
                を設定するとクラウド同期が有効になります。
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      <Button className="w-full" onClick={handleSave} disabled={saving}>
        {saved ? (
          <>
            <Check className="mr-2 h-4 w-4" />
            保存しました
          </>
        ) : (
          <>
            <Save className="mr-2 h-4 w-4" />
            {saving ? "保存中..." : "設定を保存"}
          </>
        )}
      </Button>
    </div>
  );
}
