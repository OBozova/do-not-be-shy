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

export interface HistoryEntry {
  id: string;
  scenario: ScenarioInput;
  suggestions: SuggestionSet;
  createdAt: string;
}

export interface HistoryListResponse {
  entries: HistoryEntry[];
}

export interface ApiErrorResponse {
  error: string;
  message: string;
}
