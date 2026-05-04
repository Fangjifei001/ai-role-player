"use client";

import { Card, Typography } from "antd";
import type { FeedbackResultSummary } from "@/lib/types/feedback-result";

const { Title, Text, Paragraph } = Typography;

export type FeedbackSummaryProps = {
  summary: FeedbackResultSummary;
};

export function FeedbackSummary({ summary }: FeedbackSummaryProps) {
  const scoreRingR = 42;
  const scoreRingC = 2 * Math.PI * scoreRingR;
  const scoreDash = `${(summary.score / 100) * scoreRingC} ${scoreRingC}`;

  return (
    <Card className="!mb-8 !rounded-xl !border-zinc-200/90 !shadow-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-stretch md:gap-0">
        <div className="flex shrink-0 flex-col items-center gap-4 md:w-[200px] md:flex-none md:items-start">
          <Title level={5} className="!mb-0 !text-center !text-zinc-900 md:!text-left">
            Overall Performance
          </Title>
          <div className="relative flex h-36 w-36 shrink-0 items-center justify-center" aria-hidden>
            <svg className="h-36 w-36 -rotate-90" viewBox="0 0 100 100">
              <circle cx="50" cy="50" r={scoreRingR} fill="none" stroke="#e5e7eb" strokeWidth="8" />
              <circle
                cx="50"
                cy="50"
                r={scoreRingR}
                fill="none"
                stroke="#10b981"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={scoreDash}
              />
            </svg>
            <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
              <div className="text-center leading-none">
                <span className="text-3xl font-bold text-emerald-600">{summary.score}</span>
                <span className="text-base font-medium text-zinc-400">/100</span>
              </div>
            </div>
          </div>
        </div>
        <div
          className="hidden shrink-0 self-stretch bg-zinc-200 md:block md:w-px md:mx-6 lg:mx-8"
          aria-hidden
        />
        <div className="min-h-px min-w-0 flex-1 border-t border-zinc-200 pt-6 md:border-t-0 md:pt-0">
          <Text strong className="text-zinc-800">
            Summary
          </Text>
          <Paragraph className="!mb-0 !mt-2 text-zinc-600">{summary.overallAssessment}</Paragraph>
        </div>
      </div>
    </Card>
  );
}
