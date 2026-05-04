import { streamText } from "ai";
import { formatLlmStreamFailure } from "@/lib/llm/format-stream-error";

type StreamTextReturn = ReturnType<typeof streamText>;

/** Plain UTF-8 body; forwards `fullStream` errors as text (quota, etc.). */
export function streamTextResultToPlainTextResponse(result: StreamTextReturn): Response {
  const encoder = new TextEncoder();
  const body = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        for await (const part of result.fullStream) {
          if (part.type === "text-delta") {
            controller.enqueue(encoder.encode(part.text));
          } else if (part.type === "error") {
            controller.enqueue(encoder.encode(formatLlmStreamFailure(part.error)));
          }
        }
      } catch (e) {
        const msg = e instanceof Error ? e.message : String(e);
        controller.enqueue(encoder.encode(`\n[Request error] ${msg}`));
      } finally {
        try {
          controller.close();
        } catch {
          /* closed */
        }
      }
    },
  });

  return new Response(body, {
    headers: { "content-type": "text/plain; charset=utf-8" },
  });
}
