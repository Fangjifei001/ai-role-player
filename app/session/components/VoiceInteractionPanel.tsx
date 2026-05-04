"use client";

import "./VoiceInteractionPanel.css";
import { forwardRef, useCallback, useEffect, useImperativeHandle, useMemo, useRef, useState } from "react";
import {
  AudioMutedOutlined,
  PauseCircleOutlined,
  PlayCircleOutlined,
  SoundOutlined,
  StepForwardOutlined,
} from "@ant-design/icons";
import { Button, Segmented, Slider, Typography } from "antd";
import { cancelAssistantSpeech, setAssistantTtsErrorHandler } from "@/lib/session/assistant-tts";
import { getSessionVoiceCardHint, sessionStateDotClass } from "@/lib/session/session-state-present";
import type { Scenario } from "@/lib/types/domain";
import { useInputLevelMeter } from "@/hooks/use-input-level-meter";
import { useSessionStore } from "@/lib/session/session-store";
import { AiSpeakingWaveform } from "./AiSpeakingWaveform";
import { MicButton, type MicButtonHandle } from "./MicButton";

const { Text } = Typography;

function formatRecordingClock(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${String(sec).padStart(2, "0")}`;
}

type VoiceInteractionPanelProps = {
  scenario: Scenario;
  onUserTranscript: (text: string) => Promise<void>;
  onNotify: (kind: "error" | "info", message: string) => void;
  chatError: string | null;
  onClearChatError: () => void;
  onRetryChat: () => Promise<void>;
  onEndSession: () => void;
};

export type VoiceInteractionPanelHandle = {
  /** Same as the ↻ Restart control: cancel mic/TTS, clear transcript, idle. */
  restartSession: () => void;
};

export const VoiceInteractionPanel = forwardRef<VoiceInteractionPanelHandle, VoiceInteractionPanelProps>(
  function VoiceInteractionPanel(
    { scenario, onUserTranscript, onNotify, chatError, onClearChatError, onRetryChat, onEndSession },
    ref,
  ) {
  const sessionState = useSessionStore((s) => s.sessionState);
  const isMuted = useSessionStore((s) => s.isMuted);
  const ttsVolume = useSessionStore((s) => s.ttsVolume);
  const voiceInputMode = useSessionStore((s) => s.voiceInputMode);
  const voiceHint = useMemo(() => getSessionVoiceCardHint(sessionState), [sessionState]);

  const micRef = useRef<MicButtonHandle>(null);
  const [interimText, setInterimText] = useState("");
  const [recordingSec, setRecordingSec] = useState(0);
  const [sessionElapsed, setSessionElapsed] = useState(0);

  const levelActive = sessionState === "listening" && typeof navigator !== "undefined" && !!navigator.mediaDevices;
  const levels = useInputLevelMeter(levelActive);

  useEffect(() => {
    const startedAt = Date.now();
    const id = window.setInterval(() => {
      setSessionElapsed(Math.floor((Date.now() - startedAt) / 1000));
    }, 1000);
    return () => window.clearInterval(id);
  }, [scenario.id]);

  useEffect(() => {
    setAssistantTtsErrorHandler((detail) => {
      onNotify("error", `Playback could not start (${detail}). You can still read the reply in the transcript.`);
    });
    return () => setAssistantTtsErrorHandler(null);
  }, [onNotify]);

  const handlePause = useCallback(() => {
    cancelAssistantSpeech();
    micRef.current?.cancelRecording();
    useSessionStore.getState().setState("paused");
  }, []);

  const handleResume = useCallback(() => {
    useSessionStore.getState().setState("idle");
  }, []);

  const handleRestart = useCallback(() => {
    cancelAssistantSpeech();
    micRef.current?.cancelRecording();
    useSessionStore.getState().resetSession();
    useSessionStore.getState().setState("idle");
    onClearChatError();
  }, [onClearChatError]);

  useImperativeHandle(ref, () => ({ restartSession: handleRestart }), [handleRestart]);

  const showAiRing = sessionState === "speaking" || sessionState === "processing";

  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-2xl border border-slate-200/90 bg-gradient-to-b from-slate-50 via-white to-slate-50/95 text-slate-800 shadow-[0_12px_40px_-12px_rgba(15,23,42,0.1),inset_0_1px_0_rgba(255,255,255,0.9)]">
      {/* Session strip */}
      <div className="flex shrink-0 items-center justify-between gap-2 border-b border-slate-200/90 bg-white/80 px-3 py-2 backdrop-blur-md">
        <div className="flex items-center gap-2">
          {sessionState === "paused" ? (
            <Button
              type="text"
              size="small"
              icon={<PlayCircleOutlined className="!text-lg !text-cyan-600" />}
              className="!text-slate-600 hover:!text-cyan-700"
              onClick={handleResume}
              title="Resume"
            />
          ) : (
            <Button
              type="text"
              size="small"
              icon={<PauseCircleOutlined className="!text-lg !text-slate-500" />}
              className="!text-slate-600 hover:!text-cyan-700"
              disabled={sessionState === "ended"}
              onClick={handlePause}
              title="Pause"
            />
          )}
          <Button
            type="text"
            size="small"
            icon={<span className="text-lg text-slate-500">↻</span>}
            className="!text-slate-600 hover:!text-cyan-700"
            disabled={sessionState === "ended"}
            onClick={handleRestart}
            title="Restart session"
          />
          <Button
            type="text"
            size="small"
            danger
            className="!text-red-500"
            disabled={sessionState === "ended"}
            onClick={onEndSession}
            title="End session"
          >
            ⏹
          </Button>
        </div>
        <Text type="secondary" className="!m-0 tabular-nums text-xs text-slate-500">
          {formatRecordingClock(sessionElapsed)}
        </Text>
      </div>

      {/* —— AI Output —— */}
      <div className="flex shrink-0 flex-col items-center overflow-x-hidden overflow-y-auto px-4 pt-2 pb-4">
        <div className="mb-1 flex justify-center">
          <div className="flex items-center px-2 py-1.5 text-[13px] font-medium tracking-wide text-slate-700">
            <div className="typing-dots">
              <span className={`h-2 w-2 shrink-0 rounded-full shadow-[0_0_8px_rgba(6,182,212,0.35)] ${sessionStateDotClass(sessionState)}`}></span>
              <span></span><span></span>
            </div>
            <span className="capitalize">{sessionState}</span>
          </div>
        </div>

        <div className="flex flex-col items-center py-1">
          <div className="relative flex h-[88px] w-[88px] items-center justify-center">
            {showAiRing ? (
              <div
                className="pointer-events-none absolute h-[118px] w-[118px] rounded-full border border-dashed border-cyan-500/45 opacity-70 motion-safe:animate-[spin_8s_linear_infinite]"
                aria-hidden
              />
            ) : null}
            <div className="relative flex h-20 w-20 items-center justify-center rounded-full border border-slate-200/80 bg-gradient-to-br from-white to-slate-100 shadow-[0_8px_24px_-8px_rgba(15,23,42,0.12)]">
              <div className="avatar-ring">
                <div className="waveform-ring"></div>
                <div className="avatar-inner">🤖</div>
              </div>
            </div>
          </div>

          {/* Fixed height under avatar: dots when idle, bars when speaking — avoids layout jump */}
          <div className="mt-3 flex h-7 w-full max-w-[200px] items-end justify-center">
            {sessionState === "speaking" ? (
              <AiSpeakingWaveform />
            ) : (
              <span className="ai-output-typing-dots" aria-hidden>
                <span />
                <span />
                <span />
              </span>
            )}
          </div>

          <div className="mt-3 flex items-center gap-2 text-[13px] text-slate-600">
            <span className="font-medium">{voiceHint.primary}</span>
            {sessionState === "processing" ? (
              <span className="flex gap-1">
                <span className="inline-block h-1 w-1 animate-pulse rounded-full bg-cyan-500" />
                <span
                  className="inline-block h-1 w-1 animate-pulse rounded-full bg-cyan-500"
                  style={{ animationDelay: "0.2s" }}
                />
                <span
                  className="inline-block h-1 w-1 animate-pulse rounded-full bg-cyan-500"
                  style={{ animationDelay: "0.4s" }}
                />
              </span>
            ) : null}
          </div>
          {voiceHint.secondary ? (
            <Text type="secondary" className="!mt-1 mb-2 !max-w-[16rem] !text-center !text-xs !leading-snug !text-slate-500">
              {voiceHint.secondary}
            </Text>
          ) : null}

          <div className="mt-2 flex items-center gap-4 rounded-full border border-slate-200/90 bg-white/90 px-4 py-2 shadow-sm backdrop-blur-sm">
            <Button
              type="text"
              size="small"
              icon={
                isMuted ? (
                  <AudioMutedOutlined className="!text-lg !text-slate-400" />
                ) : (
                  <SoundOutlined className="!text-lg !text-slate-600" />
                )
              }
              className="!min-w-0 !p-1 !text-slate-600 hover:!text-cyan-700"
              disabled={sessionState === "ended"}
              onClick={() => {
                const next = !useSessionStore.getState().isMuted;
                useSessionStore.getState().setMuted(next);
                if (next) cancelAssistantSpeech();
              }}
              title={isMuted ? "Unmute" : "Mute"}
            />
            <div className="flex w-[88px] flex-col gap-1">
              <Slider
                min={0}
                max={1}
                step={0.05}
                value={ttsVolume}
                disabled={sessionState === "ended"}
                tooltip={{ formatter: (v) => `${Math.round((v ?? 0) * 100)}%` }}
                onChange={(v) => useSessionStore.getState().setTtsVolume(typeof v === "number" ? v : v[0] ?? 0)}
                styles={{
                  track: { background: "rgba(6, 182, 212, 0.45)" },
                  rail: { background: "#e2e8f0" },
                }}
              />
            </div>
            <Button
              type="text"
              size="small"
              icon={<StepForwardOutlined className="!text-lg !text-slate-600" />}
              className="!min-w-0 !p-1 hover:!text-cyan-700"
              disabled={sessionState !== "speaking"}
              onClick={() => cancelAssistantSpeech()}
              title="Stop playback"
            />
          </div>
        </div>
      </div>

      {/* —— User Input —— */}
      <div className="shrink-0 border-t border-slate-200/90 bg-white/60 px-4 pb-4 pt-2 backdrop-blur-sm">
        <div className="mx-auto flex max-w-sm flex-col items-center gap-3">
          {/* Fixed slot so recording timer does not push Cancel / mic when it appears */}
          <div className="flex h-7 w-full shrink-0 items-center justify-center">
            {sessionState === "listening" ? (
              <div className="flex items-center gap-2 text-sm font-medium text-slate-800">
                <span className="h-2.5 w-2.5 shrink-0 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.65)] ring-2 ring-white" />
                <span className="tabular-nums">{formatRecordingClock(recordingSec)}</span>
              </div>
            ) : null}
          </div>

          {interimText ? (
            <Text type="secondary" className="!m-0 max-h-14 w-full overflow-y-auto text-center !text-xs !text-slate-500">
              {interimText}
            </Text>
          ) : null}

          <Button
            type="default"
            danger
            size="small"
            disabled={sessionState !== "listening"}
            className="!rounded-full !text-xs"
            onClick={() => micRef.current?.cancelRecording()}
          >
            Cancel recording
          </Button>

          <MicButton
            ref={micRef}
            onUserTranscript={onUserTranscript}
            onNotify={onNotify}
            onInterimChange={setInterimText}
            onRecordingSecondsChange={setRecordingSec}
          />

          <div className="mt-2 flex w-full max-w-[200px] justify-center">
            <div className="flex h-6 items-end justify-center gap-0.5">
              {levels.map((lv, i) => (
                <div
                  key={i}
                  className="w-1 rounded-sm bg-cyan-500 transition-[height] duration-100"
                  style={{ height: `${4 + lv * 20}px`, opacity: 0.35 + lv * 0.65 }}
                />
              ))}
            </div>
          </div>
          
          <Segmented
            size="small"
            className="voice-panel-segmented"
            value={voiceInputMode}
            onChange={(v) => useSessionStore.getState().setVoiceInputMode(v as "tap" | "push")}
            options={[
              { label: "Tap to talk", value: "tap" },
              { label: "Hold to talk", value: "push" },
            ]}
          />

          {chatError ? (
            <div className="flex flex-col items-center gap-1">
              <Text type="danger" className="!m-0 !max-w-[240px] !text-center !text-xs">
                {chatError}
              </Text>
              <Button type="link" size="small" className="!h-auto !p-0 !text-xs !text-cyan-600" onClick={() => void onRetryChat()}>
                Retry last AI request
              </Button>
            </div>
          ) : null}
        </div>
      </div>
      {/* Fills card below mic; AI block stays content-height (no flex-1 gap inside AI). */}
      <div className="min-h-0 flex-1" aria-hidden />
    </div>
  );
});
