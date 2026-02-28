"use client";

import { useState, useCallback, useRef } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url,
).toString();

export interface TextSelection {
  text: string;
  pageNumber: number;
  rects: { x: number; y: number; width: number; height: number }[];
}

interface PDFViewerProps {
  url: string;
  onTextSelect?: (selection: TextSelection) => void;
  overlayContent?: (pageNumber: number) => React.ReactNode;
}

export default function PDFViewer({
  url,
  onTextSelect,
  overlayContent,
}: PDFViewerProps) {
  const [numPages, setNumPages] = useState<number>(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [scale, setScale] = useState(1.2);
  const containerRef = useRef<HTMLDivElement>(null);

  const onDocumentLoadSuccess = useCallback(
    ({ numPages }: { numPages: number }) => {
      setNumPages(numPages);
    },
    [],
  );

  const handleMouseUp = useCallback(() => {
    if (!onTextSelect) return;

    const selection = window.getSelection();
    if (!selection || selection.isCollapsed || !selection.rangeCount) return;

    const text = selection.toString().trim();
    if (!text) return;

    const range = selection.getRangeAt(0);
    const pageEl = containerRef.current?.querySelector(
      `[data-page-number="${pageNumber}"]`,
    );
    if (!pageEl) return;

    const pageRect = pageEl.getBoundingClientRect();
    const clientRects = range.getClientRects();
    const rects: { x: number; y: number; width: number; height: number }[] =
      [];

    for (let i = 0; i < clientRects.length; i++) {
      const rect = clientRects[i];
      rects.push({
        x: ((rect.left - pageRect.left) / pageRect.width) * 100,
        y: ((rect.top - pageRect.top) / pageRect.height) * 100,
        width: (rect.width / pageRect.width) * 100,
        height: (rect.height / pageRect.height) * 100,
      });
    }

    if (rects.length > 0) {
      onTextSelect({ text, pageNumber, rects });
    }
  }, [onTextSelect, pageNumber]);

  return (
    <div className="flex flex-col h-full">
      {/* Controls */}
      <div className="flex items-center justify-between border-b px-4 py-2">
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPageNumber((p) => Math.max(1, p - 1))}
            disabled={pageNumber <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm tabular-nums">
            {pageNumber} / {numPages}
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setPageNumber((p) => Math.min(numPages, p + 1))}
            disabled={pageNumber >= numPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setScale((s) => Math.max(0.5, s - 0.1))}
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <span className="text-sm tabular-nums w-12 text-center">
            {Math.round(scale * 100)}%
          </span>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setScale((s) => Math.min(3, s + 0.1))}
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* PDF */}
      <div
        ref={containerRef}
        className="flex-1 overflow-auto flex justify-center bg-muted/30 p-4"
        onMouseUp={handleMouseUp}
      >
        <Document
          file={url}
          onLoadSuccess={onDocumentLoadSuccess}
          loading={
            <div className="flex items-center justify-center h-96">
              <p className="text-muted-foreground">PDF を読み込み中...</p>
            </div>
          }
          error={
            <div className="flex items-center justify-center h-96">
              <p className="text-destructive">PDF の読み込みに失敗しました</p>
            </div>
          }
        >
          <div className="relative">
            <Page
              pageNumber={pageNumber}
              scale={scale}
              renderTextLayer={true}
              renderAnnotationLayer={true}
            />
            {overlayContent && (
              <div className="absolute inset-0 pointer-events-none">
                {overlayContent(pageNumber)}
              </div>
            )}
          </div>
        </Document>
      </div>
    </div>
  );
}
