"use client";

import { Card, Skeleton } from "antd";

/** Placeholder layout matching [`FeedbackSummary`](./FeedbackSummary.tsx) while feedback is loading. */
export function FeedbackSummarySkeleton() {
  return (
    <Card className="!mb-8 !rounded-xl !border-zinc-200/90 !shadow-sm">
      <div className="flex flex-col gap-6 md:flex-row md:items-stretch md:gap-0">
        <div className="flex shrink-0 flex-col items-center gap-4 md:w-[200px] md:flex-none md:items-start">
          <Skeleton title={{ width: 160 }} paragraph={false} active className="!m-0 md:!self-start" />
          <Skeleton.Node active className="!flex !h-36 !w-36 !items-center !justify-center !rounded-full" />
        </div>
        <div
          className="hidden shrink-0 self-stretch bg-zinc-200 md:block md:w-px md:mx-6 lg:mx-8"
          aria-hidden
        />
        <div className="min-h-px min-w-0 flex-1 border-t border-zinc-200 pt-6 md:border-t-0 md:pt-0">
          <Skeleton title={{ width: 90 }} paragraph={{ rows: 4 }} active className="!m-0" />
        </div>
      </div>
    </Card>
  );
}
