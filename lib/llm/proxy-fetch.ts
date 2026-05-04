import { EnvHttpProxyAgent, fetch as undiciFetch } from "undici";

function proxyEnvKey(): string {
  return [
    process.env.HTTPS_PROXY ?? "",
    process.env.HTTP_PROXY ?? "",
    process.env.https_proxy ?? "",
    process.env.http_proxy ?? "",
  ].join("\0");
}

let cachedFetch: typeof globalThis.fetch | undefined;
let cachedProxyKey: string | undefined;

/** Node `fetch` ignores Windows/TUN; set `HTTPS_PROXY=http://127.0.0.1:PORT` in `.env.local` if needed. */
export function getProxiedFetch(): typeof globalThis.fetch {
  const key = proxyEnvKey();
  if (cachedFetch !== undefined && cachedProxyKey === key) return cachedFetch;
  cachedProxyKey = key;

  if (!key.trim()) {
    cachedFetch = globalThis.fetch.bind(globalThis);
    return cachedFetch;
  }

  const dispatcher = new EnvHttpProxyAgent();
  cachedFetch = (input, init) =>
    undiciFetch(input as never, { ...(init as object), dispatcher } as never) as unknown as Promise<Response>;
  return cachedFetch;
}
