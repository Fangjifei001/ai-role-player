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
            key={tip.title}
            size="small"
            className="!rounded-xl !border-violet-200/80 !bg-violet-50/50 !shadow-sm"
          >
            <div className="flex gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-violet-400 text-sm font-bold text-white">
                {i + 1}
              </span>
              <div className="min-w-0">
                <Text strong className="text-violet-950">
                  {tip.title}
                </Text>
                <Paragraph className="!mb-0 !mt-1 text-sm text-violet-900/80">{tip.description}</Paragraph>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}
