import type { FastifyInstance, FastifyReply } from "fastify";
import type { ApiErrorResponse } from "shared";
import type { GenerateSuggestionsUseCase } from "../../../application/generateSuggestionsUseCase.js";
import { scenarioRequestSchema } from "../dto/scenarioRequestSchema.js";
import { InvalidScenarioError } from "../../../domain/scenario.js";
import { LlmUnavailableError, InvalidLlmResponseError } from "../../../domain/errors.js";
import { EmptySuggestionSetError } from "../../../domain/suggestion.js";

export function registerSuggestionsRoute(
  app: FastifyInstance,
  useCase: GenerateSuggestionsUseCase,
): void {
  app.post("/api/suggestions", async (request, reply) => {
    const parsed = scenarioRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      const body: ApiErrorResponse = {
        error: "invalid_request",
        message: parsed.error.issues.map((issue) => issue.message).join("; "),
      };
      return reply.status(400).send(body);
    }

    try {
      const entry = await useCase.execute(parsed.data);
      return reply.status(201).send(entry);
    } catch (error) {
      return sendCoachingError(error, reply);
    }
  });
}

function sendCoachingError(error: unknown, reply: FastifyReply) {
  if (error instanceof InvalidScenarioError) {
    return reply
      .status(400)
      .send({ error: "invalid_scenario", message: error.message } satisfies ApiErrorResponse);
  }
  if (error instanceof LlmUnavailableError) {
    return reply
      .status(503)
      .send({ error: "llm_unavailable", message: error.message } satisfies ApiErrorResponse);
  }
  if (error instanceof InvalidLlmResponseError || error instanceof EmptySuggestionSetError) {
    return reply
      .status(502)
      .send({ error: "llm_bad_response", message: error.message } satisfies ApiErrorResponse);
  }
  throw error;
}
