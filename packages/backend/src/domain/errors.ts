export class LlmUnavailableError extends Error {
  constructor(cause?: unknown) {
    super(
      "The language model backend is unreachable. Is Ollama running? Try `ollama serve` and `ollama pull llama3.2`.",
    );
    this.name = "LlmUnavailableError";
    this.cause = cause;
  }
}

export class InvalidLlmResponseError extends Error {
  constructor(details: string, cause?: unknown) {
    super(`The LLM returned a response we couldn't understand: ${details}`);
    this.name = "InvalidLlmResponseError";
    this.cause = cause;
  }
}

export class EmptyReplyError extends Error {
  constructor() {
    super("The LLM returned an empty reply.");
    this.name = "EmptyReplyError";
  }
}

export class ConversationNotFoundError extends Error {
  constructor(conversationId: string) {
    super(`No conversation found with id "${conversationId}".`);
    this.name = "ConversationNotFoundError";
  }
}
