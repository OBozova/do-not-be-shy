import { SUGGESTION_CATEGORIES, type SuggestionSet } from "shared";

export class EmptySuggestionSetError extends Error {
  constructor(category: string) {
    super(`The LLM returned no suggestions for category "${category}".`);
    this.name = "EmptySuggestionSetError";
  }
}

/**
 * Domain invariant: every category must carry at least one suggestion.
 * A syntactically valid but empty category is not useful to the user, so this
 * is checked separately from (and after) shape validation of the raw LLM output.
 */
export function assertCompleteSuggestionSet(suggestions: SuggestionSet): void {
  for (const category of SUGGESTION_CATEGORIES) {
    if (suggestions[category].length === 0) {
      throw new EmptySuggestionSetError(category);
    }
  }
}
