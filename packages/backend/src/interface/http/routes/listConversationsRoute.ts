import type { FastifyInstance } from "fastify";
import type { ConversationListResponse } from "shared";
import type { ListConversationsUseCase } from "../../../application/listConversationsUseCase.js";

export function registerListConversationsRoute(
  app: FastifyInstance,
  useCase: ListConversationsUseCase,
): void {
  app.get("/api/conversations", async (_request, reply) => {
    const conversations = await useCase.execute();
    const body: ConversationListResponse = { conversations };
    return reply.send(body);
  });
}
