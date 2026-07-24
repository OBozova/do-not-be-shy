import type { FastifyInstance, FastifyReply } from "fastify";
import type { ApiErrorResponse } from "shared";
import type { ContinueConversationUseCase } from "../../../application/continueConversationUseCase.js";
import { continueConversationRequestSchema } from "../dto/continueConversationRequestSchema.js";
import { InvalidUserMessageError } from "../../../domain/userMessage.js";
import {
  ConversationNotFoundError,
  EmptyReplyError,
  LlmUnavailableError,
} from "../../../domain/errors.js";

export function registerContinueConversationRoute(
  app: FastifyInstance,
  useCase: ContinueConversationUseCase,
): void {
  app.post<{ Params: { id: string } }>("/api/conversations/:id/messages", async (request, reply) => {
    const parsed = continueConversationRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      const body: ApiErrorResponse = {
        error: "invalid_request",
        message: parsed.error.issues.map((issue) => issue.message).join("; "),
      };
      return reply.status(400).send(body);
    }

    try {
      const conversation = await useCase.execute(request.params.id, parsed.data.message);
      return reply.status(200).send(conversation);
    } catch (error) {
      return sendConversationError(error, reply);
    }
  });
}

function sendConversationError(error: unknown, reply: FastifyReply) {
  if (error instanceof InvalidUserMessageError) {
    return reply
      .status(400)
      .send({ error: "invalid_message", message: error.message } satisfies ApiErrorResponse);
  }
  if (error instanceof ConversationNotFoundError) {
    return reply
      .status(404)
      .send({ error: "conversation_not_found", message: error.message } satisfies ApiErrorResponse);
  }
  if (error instanceof LlmUnavailableError) {
    return reply
      .status(503)
      .send({ error: "llm_unavailable", message: error.message } satisfies ApiErrorResponse);
  }
  if (error instanceof EmptyReplyError) {
    return reply
      .status(502)
      .send({ error: "llm_bad_response", message: error.message } satisfies ApiErrorResponse);
  }
  throw error;
}
