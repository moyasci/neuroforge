"use client";

import { useState, useRef, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  ArrowLeft,
  Upload,
  Globe,
  PenLine,
  Loader2,
  FileText,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { useDatabase, useDatabaseStatus } from "@/db/provider";
import { createPaper } from "@/lib/papers/actions";
import { extractPDF } from "@/lib/papers/docling";
import { fetchByDOI, fetchByURL } from "@/lib/papers/metadata";
import type { PaperMetadata } from "@/lib/papers/metadata";
import { PAPER_FIELDS, type PaperField } from "@/types";

export default function NewPaperPage() {
  const { isReady, error: dbError } = useDatabaseStatus();

  if (dbError) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4" />
            <p className="text-sm font-medium">
              データベースの初期化に失敗しました: {dbError.message}
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isReady) {
    return (
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-4">
          <Skeleton className="h-10 w-10 rounded-md" />
          <div className="space-y-2">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="h-4 w-64" />
          </div>
        </div>
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-64 w-full rounded-lg" />
      </div>
    );
  }

  return <NewPaperForm />;
}

function NewPaperForm() {
  const db = useDatabase();
  const router = useRouter();

  // Shared state
  const [globalError, setGlobalError] = useState<string | null>(null);

  // PDF tab state
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfProgress, setPdfProgress] = useState<string>("");
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // URL/DOI tab state
  const [urlInput, setUrlInput] = useState("");
  const [fetchLoading, setFetchLoading] = useState(false);
  const [fetchedMetadata, setFetchedMetadata] = useState<PaperMetadata | null>(
    null,
  );
  const [urlRegisterLoading, setUrlRegisterLoading] = useState(false);

  // Manual tab state
  const [manualTitle, setManualTitle] = useState("");
  const [manualAuthors, setManualAuthors] = useState("");
  const [manualAbstract, setManualAbstract] = useState("");
  const [manualDoi, setManualDoi] = useState("");
  const [manualField, setManualField] = useState<PaperField | "">("");
  const [manualTags, setManualTags] = useState("");
  const [manualLoading, setManualLoading] = useState(false);

  // --- PDF handlers ---
  const handleFileSelect = useCallback(
    (file: File | undefined) => {
      if (!file) return;
      if (file.type !== "application/pdf") {
        setGlobalError("PDFファイルのみアップロードできます。");
        return;
      }
      setGlobalError(null);
      setPdfFile(file);
    },
    [],
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);
      const file = e.dataTransfer.files[0];
      handleFileSelect(file);
    },
    [handleFileSelect],
  );

  const handlePdfUpload = async () => {
    if (!pdfFile) return;
    setPdfLoading(true);
    setGlobalError(null);
    try {
      // Step 1: Read file
      setPdfProgress("読込中...");
      const buffer = await pdfFile.arrayBuffer();

      // Step 2: Extract text
      setPdfProgress("テキスト抽出中...");
      const result = await extractPDF(buffer);

      // Step 3: Save to DB
      setPdfProgress("保存中...");
      const titleFromFilename = pdfFile.name.replace(/\.pdf$/i, "");
      const paper = await createPaper(db, {
        title: result.metadata.title || titleFromFilename,
        authors: result.metadata.authors,
        abstract: result.metadata.abstract,
        extractedText: result.markdown,
        sections: {
          intro: result.sections.introduction,
          methods: result.sections.methods,
          results: result.sections.results,
          discussion: result.sections.discussion,
          conclusion: result.sections.conclusion,
        },
        sourceType: "pdf",
      });
      router.push(`/papers/${paper.id}`);
    } catch (err) {
      setGlobalError(
        err instanceof Error ? err.message : "PDF登録に失敗しました。",
      );
      setPdfLoading(false);
      setPdfProgress("");
    }
  };

  // --- URL/DOI handlers ---
  const handleFetchMetadata = async () => {
    if (!urlInput.trim()) return;
    setFetchLoading(true);
    setGlobalError(null);
    setFetchedMetadata(null);
    try {
      const input = urlInput.trim();
      let metadata: PaperMetadata | null = null;

      if (input.startsWith("10.")) {
        metadata = await fetchByDOI(input);
      } else {
        metadata = await fetchByURL(input);
      }

      if (!metadata) {
        setGlobalError(
          "メタデータの取得に失敗しました。URLまたはDOIを確認してください。",
        );
      } else {
        setFetchedMetadata(metadata);
      }
    } catch (err) {
      setGlobalError(
        err instanceof Error
          ? err.message
          : "メタデータの取得中にエラーが発生しました。",
      );
    } finally {
      setFetchLoading(false);
    }
  };

  const handleUrlRegister = async () => {
    if (!fetchedMetadata) return;
    setUrlRegisterLoading(true);
    setGlobalError(null);
    try {
      const input = urlInput.trim();
      const sourceType = input.startsWith("10.") ? "doi" : "url";
      const paper = await createPaper(db, {
        title: fetchedMetadata.title,
        authors: fetchedMetadata.authors,
        abstract: fetchedMetadata.abstract || undefined,
        doi: fetchedMetadata.doi || undefined,
        url: fetchedMetadata.url || undefined,
        sourceType,
      });
      router.push(`/papers/${paper.id}`);
    } catch (err) {
      setGlobalError(
        err instanceof Error ? err.message : "論文の登録に失敗しました。",
      );
      setUrlRegisterLoading(false);
    }
  };

  // --- Manual handlers ---
  const handleManualRegister = async () => {
    if (!manualTitle.trim()) {
      setGlobalError("タイトルは必須です。");
      return;
    }
    setManualLoading(true);
    setGlobalError(null);
    try {
      const authors = manualAuthors
        .split(",")
        .map((a) => a.trim())
        .filter(Boolean);
      const tags = manualTags
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const paper = await createPaper(db, {
        title: manualTitle.trim(),
        authors: authors.length > 0 ? authors : undefined,
        abstract: manualAbstract.trim() || undefined,
        doi: manualDoi.trim() || undefined,
        sourceType: "manual",
        field: (manualField as PaperField) || undefined,
        tags: tags.length > 0 ? tags : undefined,
      });
      router.push(`/papers/${paper.id}`);
    } catch (err) {
      setGlobalError(
        err instanceof Error ? err.message : "論文の登録に失敗しました。",
      );
      setManualLoading(false);
    }
  };

  const fieldLabels: Record<PaperField, string> = {
    neuroscience: "Neuroscience",
    cell_biology: "Cell Biology",
    psychology: "Psychology",
    engineering: "Engineering",
    ai: "AI",
    interdisciplinary: "Interdisciplinary",
  };

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

      {/* Global error alert */}
      {globalError && (
        <div className="rounded-lg border border-destructive/50 bg-destructive/10 p-4 text-destructive">
          <div className="flex items-center gap-2">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <p className="text-sm">{globalError}</p>
          </div>
        </div>
      )}

      <Tabs
        defaultValue="pdf"
        onValueChange={() => {
          setGlobalError(null);
        }}
      >
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

        {/* ===== PDF Tab ===== */}
        <TabsContent value="pdf">
          <Card>
            <CardHeader>
              <CardTitle>PDF ファイルをアップロード</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => handleFileSelect(e.target.files?.[0])}
              />
              <div
                className={`flex h-40 cursor-pointer items-center justify-center rounded-lg border-2 border-dashed transition-colors ${
                  isDragging
                    ? "border-primary bg-primary/5"
                    : pdfFile
                      ? "border-green-500 bg-green-500/5"
                      : "border-muted-foreground/25 hover:border-primary/50"
                }`}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-center">
                  {pdfFile ? (
                    <>
                      <FileText className="mx-auto h-8 w-8 text-green-600" />
                      <p className="mt-2 text-sm font-medium">
                        {pdfFile.name}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {(pdfFile.size / 1024 / 1024).toFixed(2)} MB
                      </p>
                    </>
                  ) : (
                    <>
                      <Upload className="mx-auto h-8 w-8 text-muted-foreground" />
                      <p className="mt-2 text-sm text-muted-foreground">
                        ここにPDFをドラッグ＆ドロップ
                      </p>
                      <Button
                        variant="link"
                        className="mt-1"
                        size="sm"
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          fileInputRef.current?.click();
                        }}
                      >
                        またはファイルを選択
                      </Button>
                    </>
                  )}
                </div>
              </div>
              <Button
                className="w-full"
                disabled={!pdfFile || pdfLoading}
                onClick={handlePdfUpload}
              >
                {pdfLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    {pdfProgress || "処理中..."}
                  </>
                ) : (
                  "アップロードして登録"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== URL / DOI Tab ===== */}
        <TabsContent value="url">
          <Card>
            <CardHeader>
              <CardTitle>URL または DOI で取得</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="url">論文URL / DOI</Label>
                <div className="flex gap-2">
                  <Input
                    id="url"
                    placeholder="https://arxiv.org/abs/... または 10.xxxx/..."
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && !fetchLoading) {
                        handleFetchMetadata();
                      }
                    }}
                    disabled={fetchLoading}
                  />
                  <Button
                    onClick={handleFetchMetadata}
                    disabled={!urlInput.trim() || fetchLoading}
                    variant="secondary"
                  >
                    {fetchLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        処理中...
                      </>
                    ) : (
                      "メタデータを取得"
                    )}
                  </Button>
                </div>
              </div>

              {/* Fetched metadata preview */}
              {fetchedMetadata && (
                <Card className="border-green-500/30 bg-green-500/5">
                  <CardContent className="pt-4 space-y-3">
                    <div className="flex items-start gap-2">
                      <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                      <div className="space-y-2 min-w-0">
                        <h4 className="font-semibold leading-snug">
                          {fetchedMetadata.title}
                        </h4>
                        {fetchedMetadata.authors.length > 0 && (
                          <p className="text-sm text-muted-foreground">
                            {fetchedMetadata.authors.join(", ")}
                          </p>
                        )}
                        {fetchedMetadata.abstract && (
                          <p className="text-sm text-muted-foreground line-clamp-4">
                            {fetchedMetadata.abstract}
                          </p>
                        )}
                        <div className="flex flex-wrap gap-2">
                          {fetchedMetadata.year && (
                            <Badge variant="secondary">
                              {fetchedMetadata.year}
                            </Badge>
                          )}
                          {fetchedMetadata.venue && (
                            <Badge variant="outline">
                              {fetchedMetadata.venue}
                            </Badge>
                          )}
                          {fetchedMetadata.doi && (
                            <Badge variant="outline">
                              DOI: {fetchedMetadata.doi}
                            </Badge>
                          )}
                          {fetchedMetadata.citationCount != null && (
                            <Badge variant="secondary">
                              被引用数: {fetchedMetadata.citationCount}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              <Button
                className="w-full"
                disabled={!fetchedMetadata || urlRegisterLoading}
                onClick={handleUrlRegister}
              >
                {urlRegisterLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    処理中...
                  </>
                ) : (
                  "登録"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ===== Manual Tab ===== */}
        <TabsContent value="manual">
          <Card>
            <CardHeader>
              <CardTitle>手動入力</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="manual-title">
                  タイトル <span className="text-destructive">*</span>
                </Label>
                <Input
                  id="manual-title"
                  placeholder="論文タイトルを入力"
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  disabled={manualLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manual-authors">著者</Label>
                <Input
                  id="manual-authors"
                  placeholder="著者名（カンマ区切り）"
                  value={manualAuthors}
                  onChange={(e) => setManualAuthors(e.target.value)}
                  disabled={manualLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="manual-abstract">アブストラクト</Label>
                <textarea
                  id="manual-abstract"
                  className="flex min-h-[120px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                  placeholder="アブストラクトを入力"
                  value={manualAbstract}
                  onChange={(e) => setManualAbstract(e.target.value)}
                  disabled={manualLoading}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="manual-doi">DOI</Label>
                  <Input
                    id="manual-doi"
                    placeholder="10.xxxx/..."
                    value={manualDoi}
                    onChange={(e) => setManualDoi(e.target.value)}
                    disabled={manualLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="manual-field">分野</Label>
                  <select
                    id="manual-field"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                    value={manualField}
                    onChange={(e) =>
                      setManualField(e.target.value as PaperField | "")
                    }
                    disabled={manualLoading}
                  >
                    <option value="">選択してください</option>
                    {PAPER_FIELDS.map((field) => (
                      <option key={field} value={field}>
                        {fieldLabels[field]}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="manual-tags">タグ</Label>
                <Input
                  id="manual-tags"
                  placeholder="タグ（カンマ区切り）"
                  value={manualTags}
                  onChange={(e) => setManualTags(e.target.value)}
                  disabled={manualLoading}
                />
              </div>
              <Button
                className="w-full"
                disabled={!manualTitle.trim() || manualLoading}
                onClick={handleManualRegister}
              >
                {manualLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    処理中...
                  </>
                ) : (
                  "登録"
                )}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
