"use client";

import React from "react";
import { Card, Button } from "antd";

export default function OCRPreview({ text }: { text?: string | null }) {
  if (!text)
    return <div className="p-4 text-slate-500">No OCR text available.</div>;
  return (
    <Card size="small" title="OCR Preview" className="max-h-60 overflow-auto">
      <pre style={{ whiteSpace: "pre-wrap", fontFamily: "inherit" }}>
        {text}
      </pre>
      <div className="mt-2 text-right">
        <Button onClick={() => navigator.clipboard.writeText(text)}>
          Copy OCR
        </Button>
      </div>
    </Card>
  );
}
