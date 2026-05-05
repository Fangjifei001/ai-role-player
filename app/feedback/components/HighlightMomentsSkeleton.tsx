"use client";

import { Card, Skeleton } from "antd";

function HighlightRowSkeleton() {
  return (
    <li className="flex gap-3 rounded-xl border border-zinc-100 bg-zinc-50/80 px-4 py-3">
      <Skeleton.Avatar size={36} shape="circle" active className="!shrink-0" />
      <div className="min-w-0 flex-1 space-y-2">
        <Skeleton title={false} paragraph={{ rows: 2, width: ["100%", "85%"] }} active className="!m-0" />
        <div className="flex flex-wrap gap-2">
          <Skeleton.Button size="small" active style={{ width: 96, height: 22 }} />
          <Skeleton title={false} paragraph={{ rows: 1, width: "60%" }} active className="!m-0 flex-1" />
        </div>
      </div>
      <Skeleton.Button size="small" active style={{ width: 36, height: 20 }} className="!shrink-0" />
    </li>
  );
}

/** Placeholder for [`HighlightMoments`](./HighlightMoments.tsx) while feedback is loading. */
export function HighlightMomentsSkeleton() {
  return (
    <Card
      className="!rounded-xl !border-zinc-200/90 !shadow-sm"
      title={<Skeleton title={{ width: 200 }} paragraph={false} active className="!m-0" />}
      extra={<Skeleton.Button size="small" active style={{ width: 160, height: 28 }} />}
    >
      <ul className="space-y-4" aria-hidden>
        <HighlightRowSkeleton />
        <HighlightRowSkeleton />
        <HighlightRowSkeleton />
      </ul>
    </Card>
  );
}
