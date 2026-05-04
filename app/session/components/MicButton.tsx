"use client";

import { forwardRef, useCallback, useEffect, useImperativeHandle, useRef, useState } from "react";
import { AudioOutlined } from "@ant-design/icons";
import { Button, Spin, Typography } from "antd";
import { cancelAssistantSpeech } from "@/lib/session/assistant-tts";
import {
  type AppSpeechRecognition,
  collectSpeechTranscript,
  getSpeechRecognitionConstructor,
  isSpeechRecognitionSupported,
} from "@/lib/session/web-speech";
import { useSessionStore } from "@/lib/session/session-store";

const { Text } = Typography;

const MOCK_USER_TEXT =
  "I'd like to walk through our rollout timeline and where your team sees the biggest risk.";
const MOCK_AI_TEXT =
  "Good question. From our side, the main risk is integration depth—let's prioritize the two systems that block go-live.";

export type MicButtonHandle = {
  cancelRecording: () => void;
};

export type MicButtonProps = {
  onUserTranscript: (text: string) => Promise<void>;
  onNotify: (kind: "error" | "info", message: string) => void;
  onInterimChange?: (text: string) => void;
  onRecordingSecondsChange?: (sec: number) => void;
};

function snapshotResultsText(
  list: { length: number; [i: number]: { 0?: { transcript?: string } } | undefined },
  len: number,
): string {
  let s = "";
  for (let i = 0; i < len; i++) {
    const row = list[i];
    const t = row?.[0]?.transcript;
    if (t) s += t;
  }
  return s.replace(/\s+/g, " ").trim();
}

export const MicButton = forwardRef<MicButtonHandle, MicButtonProps>(function MicButton(
  { onUserTranscript, onNotify, onInterimChange, onRecordingSecondsChange },
  ref,
) {
  const sessionState = useSessionStore((s) => s.sessionState);
  const voiceInputMode = useSessionStore((s) => s.voiceInputMode);
  const timerIdsRef = useRef<number[]>([]);
  const recognitionRef = useRef<AppSpeechRecognition | null>(null);
  const expectFinalizeRef = useRef(false);
  const liveFinalTranscriptRef = useRef("");
  const pushListeningRef = useRef(false);
  const [speechSupported, setSpeechSupported] = useState(false);
  const recordingStartedAtRef = useRef<number | null>(null);

  useEffect(() => {
    setSpeechSupported(isSpeechRecognitionSupported());
  }, []);

  const clearTimers = useCallback(() => {
    for (const id of timerIdsRef.current) {
      window.clearTimeout(id);
    }
    timerIdsRef.current = [];
  }, []);

  const prevSessionStateRef = useRef(sessionState);
  useEffect(() => {
    const prev = prevSessionStateRef.current;
    if (prev === "speaking" && sessionState === "idle" && timerIdsRef.current.length > 0) {
      clearTimers();
    }
    prevSessionStateRef.current = sessionState;
  }, [sessionState, clearTimers]);

  useEffect(
    () => () => {
      clearTimers();
      expectFinalizeRef.current = false;
      const r = recognitionRef.current;
      recognitionRef.current = null;
      if (r) {
        try {
          r.onresult = null;
          r.onerror = null;
          r.onend = null;
          r.abort();
        } catch {
          /* ignore */
        }
      }
    },
    [clearTimers],
  );

  const runSimulation = useCallback(() => {
    clearTimers();
    const { setState, addMessage } = useSessionStore.getState();

    const schedule = (fn: () => void, delayMs: number) => {
      const id = window.setTimeout(fn, delayMs);
      timerIdsRef.current.push(id);
    };

    setState("listening");
    recordingStartedAtRef.current = Date.now();

    schedule(() => setState("processing"), 1500);

    schedule(() => {
      addMessage({ role: "user", text: MOCK_USER_TEXT });
      setState("speaking");
    }, 1500 + 1000);

    schedule(() => {
      addMessage({ role: "assistant", text: "" });
      setState("speaking");

      const full = MOCK_AI_TEXT;
      let i = 0;
      const step = () => {
        i = Math.min(i + 14, full.length);
        useSessionStore.getState().setLastMessageText(full.slice(0, i));
        if (i < full.length) {
          const tid = window.setTimeout(step, 42);
          timerIdsRef.current.push(tid);
        } else {
          const tid = window.setTimeout(() => useSessionStore.getState().setState("idle"), 200);
          timerIdsRef.current.push(tid);
        }
      };
      step();
    }, 1500 + 1000 + 1500);
  }, [clearTimers]);

  const finalizeTranscript = useCallback(
    async (text: string) => {
      onInterimChange?.("");
      useSessionStore.getState().setState("idle");
      recordingStartedAtRef.current = null;
      onRecordingSecondsChange?.(0);
      const trimmed = text.trim();
      if (!trimmed) {
        onNotify("info", "No speech was detected. Try again or speak a little longer.");
        return;
      }
      await onUserTranscript(trimmed);
    },
    [onInterimChange, onNotify, onRecordingSecondsChange, onUserTranscript],
  );

  const cancelRecording = useCallback(() => {
    expectFinalizeRef.current = false;
    onInterimChange?.("");
    recordingStartedAtRef.current = null;
    onRecordingSecondsChange?.(0);
    const r = recognitionRef.current;
    recognitionRef.current = null;
    if (r) {
      try {
        r.onresult = null;
        r.onerror = null;
        r.onend = null;
        r.abort();
      } catch {
        /* ignore */
      }
    }
    clearTimers();
    liveFinalTranscriptRef.current = "";
    useSessionStore.getState().setState("idle");
  }, [clearTimers, onInterimChange, onRecordingSecondsChange]);

  useImperativeHandle(ref, () => ({ cancelRecording }), [cancelRecording]);

  const stopRecordingAsUser = useCallback(() => {
    if (recognitionRef.current) {
      expectFinalizeRef.current = true;
      try {
        recognitionRef.current.stop();
      } catch {
        expectFinalizeRef.current = false;
        recognitionRef.current = null;
        useSessionStore.getState().setState("idle");
      }
    } else {
      clearTimers();
      useSessionStore.getState().setState("idle");
    }
  }, [clearTimers]);

  const startSpeechRecognition = useCallback(() => {
    cancelAssistantSpeech();

    const Ctor = getSpeechRecognitionConstructor();
    if (!Ctor) {
      runSimulation();
      return;
    }

    const rec = new Ctor();
    recognitionRef.current = rec;
    liveFinalTranscriptRef.current = "";
    onInterimChange?.("");
    rec.lang = typeof navigator !== "undefined" && navigator.language ? navigator.language : "en-US";
    rec.continuous = true;
    rec.interimResults = true;

    rec.onresult = (ev: unknown) => {
      const e = ev as {
        resultIndex: number;
        results?: { length: number; [i: number]: { isFinal?: boolean; 0?: { transcript?: string } } | undefined };
      };
      const list = e.results;
      if (!list || typeof list.length !== "number") return;
      for (let i = e.resultIndex; i < list.length; i++) {
        const row = list[i];
        if (row?.isFinal && row[0]?.transcript) {
          liveFinalTranscriptRef.current += row[0].transcript;
        }
      }
      const live = snapshotResultsText(list, list.length);
      onInterimChange?.(live);
    };

    rec.onerror = (ev: { readonly error: string }) => {
      const code = ev.error;
      if (code === "not-allowed" || code === "service-not-allowed") {
        onNotify(
          "error",
          "Microphone permission was denied. Open browser site settings and allow the microphone, then try again.",
        );
      } else if (code === "no-speech") {
        onNotify("info", "No speech was detected. Try again when you are ready to speak.");
      } else if (code !== "aborted") {
        onNotify("error", `Speech recognition failed (${code}).`);
      }
      expectFinalizeRef.current = false;
      onInterimChange?.("");
      recordingStartedAtRef.current = null;
      onRecordingSecondsChange?.(0);
      useSessionStore.getState().setState("idle");
    };

    rec.onend = () => {
      const inst = recognitionRef.current;
      const shouldProcess = expectFinalizeRef.current;
      expectFinalizeRef.current = false;
      recognitionRef.current = null;

      if (!inst) {
        onInterimChange?.("");
        recordingStartedAtRef.current = null;
        onRecordingSecondsChange?.(0);
        useSessionStore.getState().setState("idle");
        return;
      }

      if (!shouldProcess) {
        onInterimChange?.("");
        recordingStartedAtRef.current = null;
        onRecordingSecondsChange?.(0);
        useSessionStore.getState().setState("idle");
        return;
      }

      const fromResults = collectSpeechTranscript(inst);
      const fromLive = liveFinalTranscriptRef.current.replace(/\s+/g, " ").trim();
      liveFinalTranscriptRef.current = "";
      const collected = fromResults || fromLive;
      void finalizeTranscript(collected);
    };

    try {
      rec.start();
      recordingStartedAtRef.current = Date.now();
      useSessionStore.getState().setState("listening");
    } catch {
      recognitionRef.current = null;
      onNotify("error", "Could not start the microphone. Check permissions and try again.");
      recordingStartedAtRef.current = null;
      onRecordingSecondsChange?.(0);
      useSessionStore.getState().setState("idle");
    }
  }, [finalizeTranscript, onInterimChange, onNotify, onRecordingSecondsChange, runSimulation]);

  useEffect(() => {
    if (sessionState !== "listening" || !recordingStartedAtRef.current) {
      if (sessionState !== "listening") {
        onRecordingSecondsChange?.(0);
      }
      return;
    }
    const started = recordingStartedAtRef.current;
    const id = window.setInterval(() => {
      onRecordingSecondsChange?.(Math.floor((Date.now() - started) / 1000));
    }, 200);
    return () => window.clearInterval(id);
  }, [sessionState, onRecordingSecondsChange]);

  const beginRecording = useCallback(() => {
    cancelAssistantSpeech();
    if (speechSupported) {
      startSpeechRecognition();
    } else {
      runSimulation();
    }
  }, [speechSupported, startSpeechRecognition, runSimulation]);

  const handleTapClick = () => {
    if (sessionState === "ended" || sessionState === "processing" || sessionState === "paused") return;

    if (voiceInputMode === "push" && sessionState === "idle") {
      return;
    }
    if (voiceInputMode === "push" && sessionState === "listening") {
      return;
    }

    if (sessionState === "listening") {
      stopRecordingAsUser();
      return;
    }

    if (sessionState === "idle") {
      beginRecording();
      return;
    }

    if (sessionState === "speaking") {
      cancelAssistantSpeech();
      clearTimers();
      useSessionStore.getState().setState("idle");
    }
  };

  useEffect(() => {
    if (voiceInputMode !== "push") return;
    const onUp = () => {
      if (!pushListeningRef.current) return;
      pushListeningRef.current = false;
      if (useSessionStore.getState().sessionState === "listening") {
        stopRecordingAsUser();
      }
    };
    window.addEventListener("pointerup", onUp);
    return () => window.removeEventListener("pointerup", onUp);
  }, [voiceInputMode, stopRecordingAsUser]);

  const handlePushPointerDown = (e: React.PointerEvent) => {
    if (voiceInputMode !== "push") return;
    if (sessionState === "ended" || sessionState === "processing" || sessionState === "paused") return;
    if (sessionState !== "idle") return;
    e.preventDefault();
    pushListeningRef.current = true;
    beginRecording();
  };

  const isBusy = sessionState === "listening" || sessionState === "processing" || sessionState === "speaking";
  const disabled = sessionState === "ended" || sessionState === "processing" || sessionState === "paused";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative flex h-[148px] w-[148px] shrink-0 items-center justify-center">
        <div
          className={`absolute inset-0 rounded-full border ${
            sessionState === "listening" ? "border-cyan-400/80" : "border-slate-200"
          }`}
        />
        <div className="absolute inset-[10px] rounded-full border border-slate-200/90" />
        <div className="absolute inset-[22px] rounded-full border border-slate-100" />

        {sessionState === "listening" ? (
          <span
            className="absolute right-2 top-2 z-[2] h-3 w-3 rounded-full bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.75)] ring-2 ring-white"
            title="Recording"
          />
        ) : null}

        {sessionState === "listening" ? (
          <span className="absolute inset-[18px] z-0 animate-pulse rounded-full border-2 border-red-500/50" />
        ) : null}

        <Button
          type={sessionState === "listening" ? "primary" : "default"}
          shape="circle"
          disabled={disabled}
          onClick={handleTapClick}
          onPointerDown={handlePushPointerDown}
          aria-pressed={isBusy}
          aria-label={sessionState === "listening" ? "Stop recording" : "Start recording"}
          className={`relative !z-[1] !flex !h-[68px] !w-[68px] !items-center !justify-center !text-[26px] !shadow-md ${
            sessionState === "listening"
              ? "!border-0 !bg-cyan-500 !text-white hover:!bg-cyan-600 !shadow-[0_0_22px_rgba(6,182,212,0.35)]"
              : "!border-slate-200 !bg-white !text-slate-600 hover:!border-cyan-200 hover:!bg-slate-50 hover:!text-cyan-700"
          }`}
          icon={<AudioOutlined />}
        />

        {sessionState === "processing" ? (
          <div className="pointer-events-none absolute inset-0 z-[2] flex flex-col items-center justify-center rounded-full bg-white/90 backdrop-blur-[1px]">
            <Spin size="large" />
          </div>
        ) : null}
      </div>

      {sessionState === "processing" ? (
        <Text className="text-center text-xs text-slate-500">
          Processing…
        </Text>
      ) : null}

      {sessionState === "listening" ? (
        <Text className="text-center text-xs font-medium text-red-600">
          {speechSupported
            ? voiceInputMode === "push"
              ? "Release to send"
              : "Tap again to stop"
            : "Listening"}
        </Text>
      ) : null}
    </div>
  );
});
