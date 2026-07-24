/**
 * A UserMessage is a free-text follow-up sent within an existing
 * conversation — e.g. "explain that joke" or "give me more talking points".
 */
export class UserMessage {
  private constructor(public readonly text: string) {}

  static fromText(rawText: string): UserMessage {
    const text = rawText.trim();
    if (text.length === 0) {
      throw new InvalidUserMessageError("Message cannot be empty.");
    }
    if (text.length > 1000) {
      throw new InvalidUserMessageError("Message is too long (max 1000 characters).");
    }
    return new UserMessage(text);
  }
}

export class InvalidUserMessageError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "InvalidUserMessageError";
  }
}
