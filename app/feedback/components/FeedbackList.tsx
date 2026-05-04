"use client";

import { CheckCircleFilled, ExclamationCircleFilled, RiseOutlined, TrophyOutlined } from "@ant-design/icons";
import { Card } from "antd";

export type FeedbackListProps = {
  strengths: string[];
  improvements: string[];
};

export function FeedbackList({ strengths, improvements }: FeedbackListProps) {
  return (
    <div className="mb-8 grid gap-4 lg:grid-cols-2">
      <Card
        className="!rounded-xl !border-zinc-200/90 !shadow-sm"
        title={
          <span className="inline-flex items-center gap-2.5 text-zinc-900">
            <span
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100"
              aria-hidden
            >
              <TrophyOutlined className="text-base" style={{ color: "#16a34a" }} />
            </span>
            Strengths
          </span>
        }
      >
        <ul className="space-y-3">
          {strengths.map((line) => (
            <li key={line} className="flex gap-2 text-sm text-zinc-700">
              <CheckCircleFilled className="mt-0.5 shrink-0" style={{ color: "#16a34a" }} />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </Card>
      <Card
        className="!rounded-xl !border-zinc-200/90 !shadow-sm"
        title={
          <span className="inline-flex items-center gap-2.5 text-zinc-900">
            <span
              className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-orange-100"
              aria-hidden
            >
              <RiseOutlined className="text-base" style={{ color: "#f97316" }} />
            </span>
            Areas to Improve
          </span>
        }
      >
        <ul className="space-y-3">
          {improvements.map((line) => (
            <li key={line} className="flex gap-2 text-sm text-zinc-700">
              <ExclamationCircleFilled className="mt-0.5 shrink-0" style={{ color: "#f97316" }} />
              <span>{line}</span>
            </li>
          ))}
        </ul>
      </Card>
    </div>
  );
}
