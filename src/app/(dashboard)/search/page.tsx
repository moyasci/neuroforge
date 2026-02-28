"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Search,
  FileText,
  StickyNote,
  MessageSquare,
  Sparkles,
} from "lucide-react";
import { useDatabaseStatus } from "@/db/provider";
import { searchAll, type SearchResult } from "@/lib/search/actions";

const typeIcon = {
  paper: FileText,
  note: StickyNote,
  annotation: MessageSquare,
};

const typeLabel = {
  paper: "論文",
  note: "ノート",
  annotation: "アノテーション",
};

export default function SearchPage() {
  const { isReady } = useDatabaseStatus();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [searching, setSearching] = useState(false);
  const [searched, setSearched] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const doSearch = useCallback(
    async (q: string) => {
      if (!isReady || !q.trim()) {
        setResults([]);
        setSearched(false);
        return;
      }
      setSearching(true);
      try {
        const db = (await import("@/db/pglite")).getDatabase();
        if (!db) return;
        const res = await searchAll(db, q);
        setResults(res);
        setSearched(true);
      } catch (err) {
        console.error("Search failed:", err);
      } finally {
        setSearching(false);
      }
    },
    [isReady],
  );

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (!query.trim()) {
      setResults([]);
      setSearched(false);
      return;
    }
    debounceRef.current = setTimeout(() => {
      doSearch(query);
    }, 300);
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [query, doSearch]);

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight flex items-center gap-2">
          <Sparkles className="h-5 w-5" />
          横断検索
        </h2>
        <p className="text-muted-foreground">
          論文・ノート・アノテーションをまとめて検索
        </p>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-10"
          placeholder="キーワードを入力..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {/* Results */}
      {searching && (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24" />
          ))}
        </div>
      )}

      {!searching && searched && (
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            検索結果: {results.length}件
          </p>
          {results.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-8">
                <Search className="h-8 w-8 text-muted-foreground" />
                <p className="mt-2 text-sm text-muted-foreground">
                  「{query}」に一致する結果が見つかりません
                </p>
              </CardContent>
            </Card>
          ) : (
            results.map((result) => {
              const Icon = typeIcon[result.type] ?? FileText;
              const label = typeLabel[result.type] ?? result.type;

              return (
                <Link key={`${result.type}-${result.id}`} href={result.url}>
                  <Card className="cursor-pointer transition-colors hover:border-primary/50">
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                          <Icon className="h-4 w-4" />
                          {result.title}
                        </CardTitle>
                        <Badge variant="outline">{label}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {result.snippet}
                      </p>
                    </CardContent>
                  </Card>
                </Link>
              );
            })
          )}
        </div>
      )}

      {!searching && !searched && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Search className="h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              キーワードを入力して検索
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
