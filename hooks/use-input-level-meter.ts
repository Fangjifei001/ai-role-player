"use client";

import { startTransition, useCallback, useEffect, useRef, useState } from "react";

const BAR_COUNT = 7;

/**
 * Live mic level bars while `active` (e.g. during STT). Falls back to low idle heights when inactive or on error.
 */
export function useInputLevelMeter(active: boolean) {
  const [levels, setLevels] = useState<number[]>(() => Array(BAR_COUNT).fill(0.08));
  const streamRef = useRef<MediaStream | null>(null);
  const ctxRef = useRef<AudioContext | null>(null);
  const rafRef = useRef<number | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const dataRef = useRef<Uint8Array | null>(null);

  const stopStream = useCallback(() => {
    if (rafRef.current != null) {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = null;
    }
    if (streamRef.current) {
      for (const t of streamRef.current.getTracks()) {
        t.stop();
      }
      streamRef.current = null;
    }
    if (ctxRef.current) {
      void ctxRef.current.close();
      ctxRef.current = null;
    }
    analyserRef.current = null;
    dataRef.current = null;
  }, []);

  useEffect(() => {
    if (!active || typeof navigator === "undefined" || !navigator.mediaDevices?.getUserMedia) {
      startTransition(() => setLevels(Array(BAR_COUNT).fill(0.08)));
      if (!active) stopStream();
      return;
    }

    let cancelled = false;

    void (async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        if (cancelled) {
          for (const t of stream.getTracks()) t.stop();
          return;
        }
        streamRef.current = stream;
        const ctx = new AudioContext();
        ctxRef.current = ctx;
        const source = ctx.createMediaStreamSource(stream);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 256;
        analyser.smoothingTimeConstant = 0.65;
        source.connect(analyser);
        analyserRef.current = analyser;
        dataRef.current = new Uint8Array(analyser.frequencyBinCount);

        const tick = () => {
          const analyser = analyserRef.current;
          const data = dataRef.current;
          if (!analyser || !data) return;
          analyser.getByteFrequencyData(data as Uint8Array<ArrayBuffer>);
          const chunk = Math.max(1, Math.floor(data.length / BAR_COUNT));
          const next: number[] = [];
          for (let b = 0; b < BAR_COUNT; b++) {
            let sum = 0;
            const start = b * chunk;
            for (let i = 0; i < chunk; i++) {
              sum += data[start + i] ?? 0;
            }
            const avg = sum / chunk / 255;
            next.push(Math.min(1, Math.pow(avg, 0.65) * 2.2));
          }
          setLevels(next);
          rafRef.current = requestAnimationFrame(tick);
        };
        rafRef.current = requestAnimationFrame(tick);
      } catch {
        setLevels(Array(BAR_COUNT).fill(0.12));
      }
    })();

    return () => {
      cancelled = true;
      stopStream();
      startTransition(() => setLevels(Array(BAR_COUNT).fill(0.08)));
    };
  }, [active, stopStream]);

  return levels;
}
