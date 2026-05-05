"use client";

import { useLayoutEffect, useRef } from "react";
import { DeleteOutlined, UserOutlined } from "@ant-design/icons";
import { Avatar, Button, Card, Space, Tag, Typography } from "antd";
import { sessionStateDotClass } from "@/lib/session/session-state-present";
import { type SessionMachineState, useSessionStore } from "@/lib/session/session-store";

const { Text } = Typography;

function formatTranscriptTime(iso: string): string {
  try {
    return new Date(iso).toLocaleTimeString(undefined, { hour: "numeric", minute: "2-digit" });
  } catch {
    return "";
  }
}

type TranscriptPanelProps = {
  personaName: string;
  sessionState: SessionMachineState;
  /** Clears transcript and resets voice state — same as Restart (↻) on the voice card. */
  onClearConversation: () => void;
};

export function TranscriptPanel({ personaName, sessionState, onClearConversation }: TranscriptPanelProps) {
  const messages = useSessionStore((s) => s.messages);
  const scrollRef = useRef<HTMLDivElement>(null);

  useLayoutEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollTop = el.scrollHeight;
  }, [messages, sessionState]);

  return (
    <Card
      title={
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          <span className="text-base font-semibold text-zinc-900">Conversation</span>
          <Space size={6} className="!m-0 !items-center">
            <span
              className={`inline-block h-2 w-2 shrink-0 rounded-full ${sessionStateDotClass(sessionState)}`}
            />
            <Tag className="!m-0 !border-zinc-200 !bg-zinc-50 !px-2 !py-0.5 !text-xs !font-medium !capitalize !text-zinc-800">
              {sessionState}
            </Tag>
          </Space>
        </div>
      }
      extra={
        <Button
          type="text"
          size="small"
          icon={<DeleteOutlined />}
          disabled={sessionState === "ended"}
          className="!text-zinc-500"
          title="Clear conversation (same as Restart session)"
          onClick={onClearConversation}
        >
          Clear
        </Button>
      }
      className="!flex h-full min-h-0 w-full flex-1 !flex-col overflow-hidden rounded-xl border-zinc-200/90 !shadow-sm"
      styles={{
        body: {
          flex: 1,
          display: "flex",
          flexDirection: "column",
          minHeight: 0,
          padding: 16,
          overflow: "hidden",
        },
      }}
    >
      <div ref={scrollRef} className="min-h-0 flex-1 space-y-3 overflow-y-auto pr-1">
        {messages.map((row) =>
          row.role === "assistant" ? (
            <div key={row.id} className="flex gap-3">
              <Avatar size={36} icon={<UserOutlined />} className="!shrink-0 !bg-zinc-200 !text-zinc-600" />
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-baseline gap-2">
                  <Text strong className="text-sm text-zinc-800">
                    AI ({personaName})
                  </Text>
                  <Text type="secondary" className="text-xs">
                    {formatTranscriptTime(row.timestamp)}
                  </Text>
                </div>
                <div className="mt-1.5 min-h-[2.25rem] w-fit max-w-[calc(100%-48px)] whitespace-pre-wrap break-words rounded-2xl rounded-tl-sm bg-zinc-100 px-3.5 py-2.5 text-sm leading-relaxed text-zinc-800">
                  {row.text || "\u00a0"}
                </div>
              </div>
            </div>
          ) : (
            <div key={row.id} className="flex flex-row-reverse gap-3">
              <Avatar size={36} className="!shrink-0 !bg-brand !text-sm !text-white">
                JS
              </Avatar>
              <div className="min-w-0 flex-1 text-right">
                <div className="flex flex-row-reverse flex-wrap items-baseline gap-2">
                  <Text strong className="text-sm text-zinc-800">
                    You
                  </Text>
                  <Text type="secondary" className="text-xs">
                    {formatTranscriptTime(row.timestamp)}
                  </Text>
                </div>
                <div className="mt-1.5 ml-auto w-fit max-w-[calc(100%-48px)] whitespace-pre-wrap break-words rounded-2xl rounded-tr-sm bg-brand-surface px-3.5 py-2.5 text-left text-sm leading-relaxed text-zinc-800">
                  {row.text}
                </div>
              </div>
            </div>
          ),
        )}
        {sessionState === "processing" ? (
          <div className="pl-12">
            <div className="max-w-[calc(100%-48px)]">
              <Text type="secondary" className="text-sm">
                … AI is typing…
              </Text>
            </div>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
