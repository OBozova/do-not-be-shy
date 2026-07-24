import type { ApiErrorResponse, HistoryEntry, HistoryListResponse, ScenarioInput } from "shared";

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

async function parseJsonOrThrow<T>(response: Response): Promise<T> {
  if (!response.ok) {
    const body = (await response.json().catch(() => null)) as ApiErrorResponse | null;
    throw new ApiError(response.status, body?.message ?? response.statusText);
  }
  return response.json() as Promise<T>;
}

/** Thin, typed wrapper around the backend HTTP API — the only place fetch() is called. */
export const suggestionsApi = {
  async generate(input: ScenarioInput): Promise<HistoryEntry> {
    const response = await fetch("/api/suggestions", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    return parseJsonOrThrow<HistoryEntry>(response);
  },

  async listHistory(): Promise<HistoryEntry[]> {
    const response = await fetch("/api/history");
    const data = await parseJsonOrThrow<HistoryListResponse>(response);
    return data.entries;
  },
};
