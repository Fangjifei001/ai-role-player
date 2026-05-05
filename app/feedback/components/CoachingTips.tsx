"use client";

import { Card, Typography } from "antd";
import type { FeedbackResultCoachingTip } from "@/lib/types/feedback-result";

const { Title, Text, Paragraph } = Typography;

export type CoachingTipsProps = {
  tips: FeedbackResultCoachingTip[];
};

export function CoachingTips({ tips }: CoachingTipsProps) {
  return (
    <div className="mb-8">
      <Title level={4} className="!mb-4 !text-zinc-900">
        Coaching Tips
      </Title>
      <div className="grid gap-3 sm:grid-cols-2">
        {tips.map((tip, i) => (
          <Card
            key={`coaching-${i}-${tip.title}`}
            size="small"
            className="!rounded-xl !border-brand-border/80 !bg-brand-surface/50 !shadow-sm"
          >
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-brand text-sm font-bold text-white">
                {i + 1}
              </span>
              <div className="min-w-0">
                <Text strong className="text-zinc-900">
                  {tip.title}
                </Text>
                <Paragraph className="!mb-0 !mt-1 text-sm text-zinc-700">{tip.description}</Paragraph>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
