import type {
  ApiErrorResponse,
  Conversation,
  ConversationListResponse,
  FollowUpMessageInput,
  ScenarioInput,
} from "shared";

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
export const conversationsApi = {
  async create(input: ScenarioInput): Promise<Conversation> {
    const response = await fetch("/api/conversations", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    return parseJsonOrThrow<Conversation>(response);
  },

  async list(): Promise<Conversation[]> {
    const response = await fetch("/api/conversations");
    const data = await parseJsonOrThrow<ConversationListResponse>(response);
    return data.conversations;
  },

  async continue(conversationId: string, input: FollowUpMessageInput): Promise<Conversation> {
    const response = await fetch(`/api/conversations/${conversationId}/messages`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(input),
    });
    return parseJsonOrThrow<Conversation>(response);
  },
};
