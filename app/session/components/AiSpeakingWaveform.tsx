"use client";

/** Decorative bars while assistant TTS is playing (`speaking`). Single root for flex parents. */
export function AiSpeakingWaveform() {
  return (
    <div className="relative flex h-7 w-full items-end justify-center gap-1" aria-hidden>
      <style>{`
        @keyframes aiSpeakingWaveBar {
          from { transform: scaleY(0.35); opacity: 0.65; }
          to { transform: scaleY(1); opacity: 1; }
        }
        .aiSpeakingWaveBar {
          transform-origin: bottom center;
          animation: aiSpeakingWaveBar 0.55s ease-in-out infinite alternate;
        }
      `}</style>
      {[0, 1, 2, 3, 4, 5].map((i) => (
        <span
          key={i}
          className="aiSpeakingWaveBar h-5 w-1 rounded-full bg-cyan-500/90"
          style={{ animationDelay: `${i * 0.08}s` }}
        />
      ))}
    </div>
  );
}
