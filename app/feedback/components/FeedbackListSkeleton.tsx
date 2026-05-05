"use client";

import { Card, Skeleton } from "antd";

function ListCardSkeleton({ rows }: { rows: number }) {
  return (
    <Card
      className="!rounded-xl !border-zinc-200/90 !shadow-sm"
      title={
        <span className="inline-flex items-center gap-2.5">
          <Skeleton.Avatar size={36} shape="circle" active />
          <Skeleton title={{ width: 140 }} paragraph={false} active className="!m-0" />
        </span>
      }
    >
      <ul className="space-y-3">
        {Array.from({ length: rows }, (_, i) => (
          <li key={i} className="flex gap-2">
            <Skeleton.Avatar size={16} shape="square" active className="!mt-0.5 !shrink-0" />
            <Skeleton title={false} paragraph={{ rows: 1, width: ["100%"] }} active className="!m-0 flex-1" />
          </li>
        ))}
      </ul>
    </Card>
  );
}

/** Placeholder for strengths / improvements columns in [`FeedbackList`](./FeedbackList.tsx). */
export function FeedbackListSkeleton() {
  return (
    <div className="mb-8 grid gap-4 lg:grid-cols-2">
      <ListCardSkeleton rows={5} />
      <ListCardSkeleton rows={4} />
    </div>
  );
}
