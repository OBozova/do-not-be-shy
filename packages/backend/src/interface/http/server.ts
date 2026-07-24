import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import type { GenerateSuggestionsUseCase } from "../../application/generateSuggestionsUseCase.js";
import type { ListConversationsUseCase } from "../../application/listConversationsUseCase.js";
import type { ContinueConversationUseCase } from "../../application/continueConversationUseCase.js";
import { registerCreateConversationRoute } from "./routes/createConversationRoute.js";
import { registerListConversationsRoute } from "./routes/listConversationsRoute.js";
import { registerContinueConversationRoute } from "./routes/continueConversationRoute.js";

export interface ServerDependencies {
  generateSuggestions: GenerateSuggestionsUseCase;
  listConversations: ListConversationsUseCase;
  continueConversation: ContinueConversationUseCase;
}

export async function buildServer(deps: ServerDependencies): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });

  app.get("/health", async () => ({ status: "ok" }));
  registerCreateConversationRoute(app, deps.generateSuggestions);
  registerListConversationsRoute(app, deps.listConversations);
  registerContinueConversationRoute(app, deps.continueConversation);

  return app;
}
