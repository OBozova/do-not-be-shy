export interface ScenarioInput {
  description: string;
}

export const SUGGESTION_CATEGORIES = [
  "openers",
  "jokes",
  "talkingPoints",
  "researchTopics",
] as const;

export type SuggestionCategory = (typeof SUGGESTION_CATEGORIES)[number];

export const SUGGESTION_CATEGORY_LABELS: Record<SuggestionCategory, string> = {
  openers: "Openers",
  jokes: "Jokes",
  talkingPoints: "Talking Points",
  researchTopics: "Research Beforehand",
};

export type SuggestionSet = Record<SuggestionCategory, string[]>;

export type ConversationRole = "user" | "assistant";

export interface ConversationMessage {
  id: string;
  role: ConversationRole;
  content: string;
  createdAt: string;
}

export interface Conversation {
  id: string;
  scenario: ScenarioInput;
  suggestions: SuggestionSet;
  messages: ConversationMessage[];
  createdAt: string;
}

export interface ConversationListResponse {
  conversations: Conversation[];
}

export interface ApiErrorResponse {
  error: string;
  message: string;
}
