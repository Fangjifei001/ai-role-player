"use client";

import {
  Suspense,
  startTransition,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  AudioOutlined,
  BankOutlined,
  ClockCircleOutlined,
  MessageOutlined,
  StopOutlined,
} from "@ant-design/icons";
import { Avatar, Button, Card, Layout, Menu, Space, Typography, message } from "antd";
import {
  writeFeedbackSnapshotToSessionStorage,
} from "@/lib/feedback/feedback-session-snapshot";
import {
  buildPersonaDescriptionForFeedback,
  formatDurationMmSs,
  formatTranscriptForFeedback,
} from "@/lib/feedback/format-session-transcript";
import {
  getAdminRuntimeData,
  getServerAdminRuntimeSnapshot,
  subscribeAdminRuntimeData,
} from "@/lib/runtime/store";
import { cancelAssistantSpeech } from "@/lib/session/assistant-tts";
import {
  buildSessionChatMessages,
  buildSessionOpeningBootstrapMessages,
} from "@/lib/session/build-session-chat-messages";
import { useSessionStore } from "@/lib/session/session-store";
import { streamSessionChatReply } from "@/lib/session/stream-chat";
import { TranscriptPanel } from "./components/TranscriptPanel";
import { VoiceInteractionPanel, type VoiceInteractionPanelHandle } from "./components/VoiceInteractionPanel";

const { Sider, Content } = Layout;
const { Title, Text } = Typography;

function formatDifficultyLabel(value: string | null): string {
  const v = (value ?? "medium").toLowerCase();
  if (v === "easy") return "Easy";
  if (v === "hard") return "Hard";
  return "Medium";
}

function SessionPageInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [messageApi, contextHolder] = message.useMessage();
  const [chatError, setChatError] = useState<string | null>(null);

  const { scenarios, personas } = useSyncExternalStore(
    subscribeAdminRuntimeData,
    getAdminRuntimeData,
    getServerAdminRuntimeSnapshot,
  );

  const scenarioId = searchParams.get("scenarioId");
  const personaId = searchParams.get("personaId");
  const difficultyRaw = searchParams.get("difficulty");

  const { scenario, persona, difficultyLabel, selectionValid } = useMemo(() => {
    const difficultyLabel = formatDifficultyLabel(difficultyRaw);
    const sid = scenarioId?.trim();
    const pid = personaId?.trim();
    if (!sid || !pid) {
      return { scenario: undefined, persona: undefined, difficultyLabel, selectionValid: false as const };
    }
    const scenario = scenarios.find((s) => s.id === sid);
    const persona = personas.find((p) => p.id === pid);
    if (!scenario || !persona || !scenario.personaIds.includes(pid)) {
      return { scenario: undefined, persona: undefined, difficultyLabel, selectionValid: false as const };
    }
    return { scenario, persona, difficultyLabel, selectionValid: true as const };
  }, [scenarioId, personaId, difficultyRaw, scenarios, personas]);

  const personaName = persona?.name?.trim() || "Persona";
  const scenarioName = scenario?.name?.trim() || "Scenario";
  const sessionState = useSessionStore((s) => s.sessionState);
  const openingBootstrapLockRef = useRef<string | null>(null);
  const voicePanelRef = useRef<VoiceInteractionPanelHandle>(null);
  const sessionStartedAtRef = useRef<number | null>(null);

  useEffect(() => {
    if (!selectionValid) router.replace("/dashboard");
  }, [selectionValid, router]);

  useEffect(() => {
    if (!selectionValid || !scenario || !persona) return;
    sessionStartedAtRef.current = Date.now();
    const { resetSession, setState } = useSessionStore.getState();
    resetSession();
    setState("idle");
    startTransition(() => setChatError(null));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- reset when scenario/persona ids change
  }, [selectionValid, scenario?.id, persona?.id]);

  useEffect(() => {
    if (!selectionValid || !scenario || !persona) return;
    const lockKey = `${scenario.id}:${persona.id}:${difficultyLabel}`;
    if (useSessionStore.getState().messages.length > 0) {
      openingBootstrapLockRef.current = lockKey;
      return;
    }
    if (openingBootstrapLockRef.current === lockKey) return;
    openingBootstrapLockRef.current = lockKey;

    void (async () => {
      try {
        setChatError(null);
        await streamSessionChatReply(
          buildSessionOpeningBootstrapMessages(scenario, persona, difficultyLabel),
        );
      } catch (e) {
        if (openingBootstrapLockRef.current === lockKey) {
          openingBootstrapLockRef.current = null;
        }
        const msg = e instanceof Error ? e.message : "AI request failed";
        messageApi.error(msg);
        setChatError(msg);
      }
    })();
  }, [selectionValid, scenario, persona, difficultyLabel, messageApi]);

  useEffect(
    () => () => {
      cancelAssistantSpeech();
    },
    [],
  );

  const handleUserTranscript = useCallback(
    async (text: string) => {
      if (!scenario || !persona) return;
      setChatError(null);
      useSessionStore.getState().addMessage({ role: "user", text });
      const messages = buildSessionChatMessages(scenario, persona, difficultyLabel);
      try {
        await streamSessionChatReply(messages);
      } catch (e) {
        const msg = e instanceof Error ? e.message : "AI request failed";
        messageApi.error(msg);
        setChatError(msg);
      }
    },
    [scenario, persona, difficultyLabel, messageApi],
  );

  const handleRetryChat = useCallback(async () => {
    if (!scenario || !persona) return;
    setChatError(null);
    try {
      await streamSessionChatReply(buildSessionChatMessages(scenario, persona, difficultyLabel));
    } catch (e) {
      const msg = e instanceof Error ? e.message : "AI request failed";
      messageApi.error(msg);
      setChatError(msg);
    }
  }, [scenario, persona, difficultyLabel, messageApi]);

  const handleSpeechNotify = useCallback(
    (kind: "error" | "info", msg: string) => {
      if (kind === "error") messageApi.error(msg);
      else messageApi.info(msg);
    },
    [messageApi],
  );

  const handleEndSession = useCallback(() => {
    if (!scenario || !persona) return;
    const messages = useSessionStore.getState().messages;
    const transcript = formatTranscriptForFeedback(messages);
    const started = sessionStartedAtRef.current ?? Date.now();
    const durationLabel = formatDurationMmSs(Math.floor((Date.now() - started) / 1000));

    writeFeedbackSnapshotToSessionStorage({
      scenarioName: scenario.name,
      personaName: persona.name,
      scenarioDescription: scenario.description,
      scenarioGoals: [...scenario.scenarioGoals],
      personaDescription: buildPersonaDescriptionForFeedback(persona),
      transcript,
      durationLabel,
      dateLabel: new Date().toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" }),
    });

    useSessionStore.getState().setState("ended");
    router.push("/feedback");
  }, [router, scenario, persona]);

  if (!selectionValid || !scenario || !persona) {
    return (
      <Layout className="min-h-screen bg-[#f5f7fb]">
        <Content className="flex items-center justify-center p-10">
          <Text type="secondary">Returning to dashboard…</Text>
        </Content>
      </Layout>
    );
  }

  return (
    <Layout className="flex h-screen min-h-0 flex-col overflow-hidden bg-[#f5f7fb]">
      {contextHolder}
      <header className="flex w-full shrink-0 items-center border-b border-zinc-200 bg-white">
        <div className="w-[220px] shrink-0 border-r border-zinc-200 px-5 py-4">
          <Space align="center">
            <MessageOutlined style={{ color: "#4f46e5", fontSize: "22px", fontWeight: "bold" }} />
            <Title level={4} className="!mb-0 !text-zinc-800 !text-xl">
              AI Role Player
            </Title>
          </Space>
        </div>
        <div className="flex min-w-0 flex-1 items-center px-5 py-4">
          <div className="min-w-0">
            <Title level={4} className="!mb-0 !truncate !text-lg !font-semibold !text-zinc-900">
              Role Play Session
            </Title>
            <Text type="secondary" className="mt-0.5 block truncate text-sm">
              {scenarioName} · {personaName} · {difficultyLabel}
            </Text>
          </div>
        </div>
        <div className="flex shrink-0 border-l border-zinc-100 px-5 py-3">
          <Button
            icon={<StopOutlined />}
            className="!shrink-0 !border !border-red-300 !bg-white !font-medium !text-red-500 hover:!border-red-400 hover:!text-red-600"
            onClick={handleEndSession}
          >
            End Session
          </Button>
        </div>
      </header>

      <Layout className="flex min-h-0 flex-1 !bg-inherit">
        <Sider
          width={220}
          className="!shrink-0 !border-r !border-zinc-200 !bg-white"
          breakpoint="lg"
          collapsedWidth={0}
        >
          <div className="flex h-full min-h-0 flex-col overflow-y-auto overflow-x-hidden pt-6 lg:pt-7">
            <Menu
              mode="inline"
              selectedKeys={["session"]}
              className="border-none"
              items={[
                {
                  key: "dashboard",
                  icon: <BankOutlined />,
                  label: "Dashboard",
                  onClick: () => router.push("/dashboard"),
                },
                {
                  key: "session",
                  icon: <AudioOutlined />,
                  label: "Session"
                },
                {
                  key: "history",
                  icon: <ClockCircleOutlined />,
                  label: "History",
                },
              ]}
            />
            <div className="mt-auto border-t border-zinc-100 px-5 py-6">
              <Space align="center">
                <Avatar size="small" className="!bg-indigo-100 !text-indigo-700">
                  JS
                </Avatar>
                <Text strong>Jane Smith</Text>
              </Space>
            </div>
          </div>
        </Sider>

        <Content className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden px-5 py-6 lg:px-7 lg:py-7">
          <div className="mx-auto flex min-h-0 w-full flex-1 flex-col gap-5">
            <div className="flex min-h-0 flex-1 flex-col gap-5 md:flex-row md:items-stretch md:gap-6">
              <Card
                className="order-2 flex min-h-0 w-full shrink-0 flex-col overflow-hidden rounded-xl border-zinc-200/90 !p-0 !shadow-sm md:order-1 md:h-full md:max-w-sm lg:max-w-md"
                styles={{ body: { padding: 0, flex: 1, display: "flex", flexDirection: "column", minHeight: 0 } }}
              >
                <VoiceInteractionPanel
                  ref={voicePanelRef}
                  scenario={scenario}
                  onUserTranscript={handleUserTranscript}
                  onNotify={handleSpeechNotify}
                  chatError={chatError}
                  onClearChatError={() => setChatError(null)}
                  onRetryChat={handleRetryChat}
                  onEndSession={handleEndSession}
                />
              </Card>

              <div className="order-1 flex min-h-0 min-w-0 flex-1 flex-col md:order-2">
                <TranscriptPanel
                  personaName={personaName}
                  sessionState={sessionState}
                  onClearConversation={() => voicePanelRef.current?.restartSession()}
                />
              </div>
            </div>
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}

function SessionFallback() {
  return (
    <Layout className="min-h-screen bg-[#f5f7fb]">
      <Content className="flex items-center justify-center p-10">
        <Text type="secondary">Loading session…</Text>
      </Content>
    </Layout>
  );
}

export default function SessionPage() {
  return (
    <Suspense fallback={<SessionFallback />}>
      <SessionPageInner />
    </Suspense>
  );
}
