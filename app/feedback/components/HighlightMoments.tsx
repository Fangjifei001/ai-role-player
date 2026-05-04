"use client";

import { StarOutlined, WarningOutlined } from "@ant-design/icons";
import { Button, Card, Typography } from "antd";
import type { FeedbackResultHighlightMoment } from "@/lib/types/feedback-result";

const { Text } = Typography;

function formatHighlightTimestamp(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds % 60));
  const m = Math.max(0, Math.floor(totalSeconds / 60));
  return `${m}:${String(s).padStart(2, "0")}`;
}

export type HighlightMomentsProps = {
  moments: FeedbackResultHighlightMoment[];
};

export function HighlightMoments({ moments }: HighlightMomentsProps) {
  return (
    <Card
      className="!rounded-xl !border-zinc-200/90 !shadow-sm"
      title={<span className="text-zinc-900">Highlighted Moments</span>}
      extra={
        <Button type="link" className="!text-indigo-600">
          View Full Transcript
        </Button>
      }
    >
      <ul className="space-y-4">
        {moments.map((h) => (
          <li
            key={`${h.timestamp}-${h.message.slice(0, 24)}`}
            className="flex gap-3 rounded-xl border border-zinc-100 bg-zinc-50/80 px-4 py-3"
          >
            <div className="shrink-0">
              {h.type === "good" ? (
                <span
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-emerald-100"
                  aria-hidden
                >
                  <StarOutlined className="text-base" style={{ color: "#059669" }} />
                </span>
              ) : (
                <span
                  className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-red-100"
                  aria-hidden
                >
                  <WarningOutlined className="text-base" style={{ color: "#dc2626" }} />
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <Text className="block text-sm italic text-zinc-700">&ldquo;{h.message}&rdquo;</Text>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <span
                  className={
                    h.type === "good"
                      ? "rounded-md bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-800"
                      : "rounded-md bg-red-100 px-2 py-0.5 text-xs font-medium text-red-800"
                  }
                >
                  {h.type === "good" ? "Strong moment" : "Growth area"}
                </span>
                <Text type="secondary" className="text-xs">
                  {h.feedback}
                </Text>
              </div>
            </div>
            <Text type="secondary" className="shrink-0 tabular-nums text-xs">
              {formatHighlightTimestamp(h.timestamp)}
            </Text>
          </li>
        ))}
      </ul>
    </Card>
  );
}
