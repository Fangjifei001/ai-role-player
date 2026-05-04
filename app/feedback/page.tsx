"use client";

import {
  BankOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  CommentOutlined,
  DownloadOutlined,
  FileTextOutlined,
  MessageOutlined,
  UserOutlined,
} from "@ant-design/icons";
import { Alert, Avatar, Button, Card, Layout, Menu, Space, Spin, Typography } from "antd";
import { Fragment, useCallback, useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import {
  clearFeedbackSnapshotFromSessionStorage,
  readFeedbackSnapshotFromSessionStorage,
  type FeedbackSessionSnapshot,
} from "@/lib/feedback/feedback-session-snapshot";
import type { FeedbackResult } from "@/lib/types/feedback-result";
import { CoachingTips } from "./components/CoachingTips";
import { FeedbackList } from "./components/FeedbackList";
import { FeedbackSummary } from "./components/FeedbackSummary";
import { HighlightMoments } from "./components/HighlightMoments";

const { Sider, Content } = Layout;
const { Title, Text, Paragraph } = Typography;

const META_TEMPLATE = [
  { label: "Scenario" as const, Icon: FileTextOutlined, iconColor: "#4f46e5", circleClass: "bg-indigo-100" },
  { label: "Persona" as const, Icon: UserOutlined, iconColor: "#7c3aed", circleClass: "bg-violet-100" },
  { label: "Duration" as const, Icon: ClockCircleOutlined, iconColor: "#0891b2", circleClass: "bg-cyan-100" },
  { label: "Date" as const, Icon: CalendarOutlined, iconColor: "#d97706", circleClass: "bg-amber-100" },
] as const;

type MetaRow = (typeof META_TEMPLATE)[number] & { value: string };

function sessionMetaRows(snapshot: FeedbackSessionSnapshot | null): MetaRow[] {
  const scenario = snapshot?.scenarioName?.trim() || "—";
  const persona = snapshot?.personaName?.trim() || "—";
  const duration = snapshot?.durationLabel?.trim() || "—";
  const date = snapshot?.dateLabel?.trim() || "—";
  const values = [scenario, persona, duration, date] as const;
  return META_TEMPLATE.map((row, i) => ({ ...row, value: values[i]! }));
}

async function postFeedbackRequest(snapshot: FeedbackSessionSnapshot): Promise<FeedbackResult> {
  const res = await fetch("/api/feedback", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      scenarioDescription: snapshot.scenarioDescription,
      scenarioGoals: snapshot.scenarioGoals,
      personaDescription: snapshot.personaDescription,
      transcript: snapshot.transcript,
    }),
  });

  const errText = await res.text();
  let errMsg = errText || `HTTP ${res.status}`;
  try {
    const j = JSON.parse(errText) as { error?: string };
    if (typeof j?.error === "string") errMsg = j.error;
  } catch {
    /* keep errMsg */
  }

  if (!res.ok) throw new Error(errMsg);

  const data = JSON.parse(errText) as { result?: FeedbackResult };
  if (!data.result) throw new Error("Invalid response: missing result.");
  return data.result;
}

export default function FeedbackPage() {
  const router = useRouter();
  const [snapshot, setSnapshot] = useState<FeedbackSessionSnapshot | null>(null);
  const [result, setResult] = useState<FeedbackResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refetchToken, setRefetchToken] = useState(0);

  const metaRows = useMemo(() => sessionMetaRows(snapshot), [snapshot]);

  const runFetch = useCallback(async () => {
    const snap = readFeedbackSnapshotFromSessionStorage();
    setSnapshot(snap);

    if (!snap) {
      setLoading(false);
      setError(
        "No session data found. End a role-play from the session page to generate feedback, or return to the dashboard.",
      );
      setResult(null);
      return;
    }

    if (!snap.transcript.trim()) {
      setLoading(false);
      setError("The transcript was empty. Try a longer conversation, then end the session again.");
      setResult(null);
      return;
    }

    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const feedback = await postFeedbackRequest(snap);
      setResult(feedback);
      clearFeedbackSnapshotFromSessionStorage();
    } catch (e) {
      const msg = e instanceof Error ? e.message : "Failed to load feedback.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    queueMicrotask(() => {
      void runFetch();
    });
  }, [runFetch, refetchToken]);

  const handleRetry = useCallback(() => {
    setRefetchToken((n) => n + 1);
  }, []);

  return (
    <Layout className="flex min-h-screen min-h-0 flex-col bg-[#f5f7fb]">
      <header className="flex w-full shrink-0 items-center border-b border-zinc-200 bg-white">
        <div className="w-[220px] shrink-0 border-r border-zinc-200 px-5 py-4">
          <Space align="center">
            <MessageOutlined style={{ color: "#4f46e5", fontSize: "22px", fontWeight: "bold" }} />
            <Title level={4} className="!mb-0 !text-zinc-800 !text-xl">
              AI Role Player
            </Title>
          </Space>
        </div>
        <div className="flex min-w-0 flex-1 items-center justify-between gap-4 px-5 py-3">
          <Title level={4} className="!mb-0 !truncate !text-lg !font-semibold !text-zinc-900">
            Session Feedback
          </Title>
          <Button type="primary" icon={<DownloadOutlined />}>
            Export Report
          </Button>
        </div>
      </header>

      <Layout className="flex min-h-0 flex-1 !bg-inherit" hasSider>
        <Sider
          width={220}
          className="!shrink-0 !border-r !border-zinc-200 !bg-white"
          breakpoint="lg"
          collapsedWidth={0}
        >
          <div className="flex h-full min-h-0 flex-col overflow-y-auto overflow-x-hidden pt-6 lg:pt-7">
            <Menu
              mode="inline"
              selectedKeys={["feedback"]}
              className="border-none"
              items={[
                {
                  key: "dashboard",
                  icon: <BankOutlined />,
                  label: "Dashboard",
                  onClick: () => router.push("/dashboard"),
                },
                {
                  key: "feedback",
                  icon: <CommentOutlined />,
                  label: "Feedback",
                },
                {
                  key: "history",
                  icon: <ClockCircleOutlined />,
                  label: "History",
                },
              ]}
            />
            <div className="mt-auto border-t border-zinc-100 px-5 py-6">
              <Space align="center" orientation="vertical" size={4} className="!items-start">
                <Space align="center">
                  <Avatar size="small" className="!bg-indigo-100 !text-indigo-700">
                    JS
                  </Avatar>
                  <div className="leading-tight">
                    <Text strong className="block text-sm">
                      Jane Smith
                    </Text>
                    <Text type="secondary" className="text-xs">
                      Sales Rep
                    </Text>
                  </div>
                </Space>
              </Space>
            </div>
          </div>
        </Sider>

        <Content className="min-h-0 min-w-0 flex-1 overflow-y-auto px-5 py-6 lg:px-7 lg:py-7">
          <div className="mx-auto flex min-h-0 w-full flex-col pb-8">
            <Card
              className="!mb-8 !overflow-hidden !rounded-xl !border-zinc-200/90 !shadow-sm"
              styles={{ body: { padding: 0 } }}
            >
              <div className="flex flex-col sm:flex-row sm:items-stretch">
                {metaRows.map((item, index) => {
                  const MetaIcon = item.Icon;
                  return (
                    <Fragment key={item.label}>
                      {index > 0 ? (
                        <>
                          <div aria-hidden className="h-px w-full shrink-0 bg-zinc-200 sm:hidden" />
                          <div
                            aria-hidden
                            className="hidden shrink-0 self-stretch bg-zinc-200 sm:block sm:w-px sm:my-5 sm:mx-3 md:my-6 md:mx-4"
                          />
                        </>
                      ) : null}
                      <div className="flex min-w-0 flex-1 items-start gap-3 px-5 py-5 sm:py-6 md:px-6">
                        <span
                          className={`inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${item.circleClass}`}
                          aria-hidden
                        >
                          <MetaIcon className="text-base" style={{ color: item.iconColor }} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <Text type="secondary" className="text-xs font-medium uppercase tracking-wide">
                            {item.label}
                          </Text>
                          <Paragraph className="!mb-0 !mt-1 text-sm font-semibold text-zinc-900">
                            {item.value}
                          </Paragraph>
                        </div>
                      </div>
                    </Fragment>
                  );
                })}
              </div>
            </Card>

            {error ? (
              <Alert
                className="!mb-8"
                type="error"
                showIcon
                message="Could not load feedback"
                description={error}
                action={
                  <Space orientation="vertical">
                    {snapshot ? <Button onClick={handleRetry}>Retry</Button> : null}
                    <Button type="link" onClick={() => router.push("/dashboard")}>
                      Back to Dashboard
                    </Button>
                  </Space>
                }
              />
            ) : null}

            {loading ? (
              <div className="flex min-h-[220px] flex-col items-center justify-center gap-3 py-10">
                <Spin size="large" />
                <Text type="secondary">Generating feedback from your session…</Text>
              </div>
            ) : null}

            {!loading && result ? (
              <>
                <FeedbackSummary summary={result.summary} />
                <FeedbackList strengths={result.strengths} improvements={result.improvements} />
                <CoachingTips tips={result.coachingTips} />
                <HighlightMoments moments={result.highlightMoments} />
              </>
            ) : null}
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
