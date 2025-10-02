"use client";

import React, { useState, useMemo } from "react";
import { Card, Button, Input, Space } from "antd";

export default function OCRPreview({ text }: { text?: string | null }) {
  const [query, setQuery] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  // Find all matches
  const matches = useMemo(() => {
    if (!text || !query.trim()) return [];
    const regex = new RegExp(query, "gi");
    let result;
    const found: { start: number; end: number }[] = [];
    while ((result = regex.exec(text)) !== null) {
      found.push({ start: result.index, end: result.index + result[0].length });
    }
    return found;
  }, [text, query]);

  // Highlight text with current match active
  const highlightedText = useMemo(() => {
    if (!text) return null;
    if (!query.trim() || matches.length === 0) return text;

    const parts: React.ReactNode[] = [];
    let lastIndex = 0;

    matches.forEach((m, idx) => {
      parts.push(text.slice(lastIndex, m.start));
      parts.push(
        <mark
          key={idx}
          style={{
            backgroundColor: idx === currentIndex ? "orange" : "yellow",
          }}
        >
          {text.slice(m.start, m.end)}
        </mark>
      );
      lastIndex = m.end;
    });
    parts.push(text.slice(lastIndex));
    return parts;
  }, [text, matches, currentIndex, query]);

  if (!text)
    return <div className="p-4 text-slate-500">No OCR text available.</div>;

  const handleNext = () => {
    if (matches.length === 0) return;
    setCurrentIndex((prev) => (prev + 1) % matches.length);
  };

  const handlePrev = () => {
    if (matches.length === 0) return;
    setCurrentIndex((prev) => (prev - 1 + matches.length) % matches.length);
  };

  return (
    <Card size="small" title="OCR Preview" className="max-h-96 overflow-auto">
      {/* Search bar with controls */}
      <div className="mb-2 flex gap-2 items-center">
        <Input
          placeholder="Search OCR text..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setCurrentIndex(0);
          }}
          style={{ maxWidth: 250 }}
        />
        <Space>
          <Button onClick={handlePrev} disabled={!matches.length}>
            Prev
          </Button>
          <Button onClick={handleNext} disabled={!matches.length}>
            Next
          </Button>
          <span className="text-sm text-slate-500">
            {matches.length > 0
              ? `${currentIndex + 1} of ${matches.length}`
              : ""}
          </span>
        </Space>
      </div>

      {/* OCR text with highlights */}
      <pre
        style={{
          whiteSpace: "pre-wrap",
          fontFamily: "inherit",
          lineHeight: 1.6,
        }}
      >
        {highlightedText}
      </pre>

      {/* Copy button */}
      <div className="mt-2 text-right">
        <Button onClick={() => navigator.clipboard.writeText(text)}>
          Copy OCR
        </Button>
      </div>
    </Card>
  );
}
