import { z } from "zod";
import { SUGGESTION_CATEGORIES, type SuggestionCategory } from "shared";

const suggestionArray = z.array(z.string().min(1)).min(1).max(8);

const shape = Object.fromEntries(
  SUGGESTION_CATEGORIES.map((category) => [category, suggestionArray]),
) as Record<SuggestionCategory, typeof suggestionArray>;

/**
 * Validates the raw JSON an LLM returns before it's trusted anywhere else in
 * the system. Built from the same SUGGESTION_CATEGORIES the rest of the app
 * uses, so adding a category only ever requires one edit (in shared/types.ts).
 */
export const suggestionSetSchema = z.object(shape);
