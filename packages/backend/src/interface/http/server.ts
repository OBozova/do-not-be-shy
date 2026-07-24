import Fastify, { type FastifyInstance } from "fastify";
import cors from "@fastify/cors";
import type { GenerateSuggestionsUseCase } from "../../application/generateSuggestionsUseCase.js";
import type { ListHistoryUseCase } from "../../application/listHistoryUseCase.js";
import { registerSuggestionsRoute } from "./routes/suggestionsRoute.js";
import { registerHistoryRoute } from "./routes/historyRoute.js";

export interface ServerDependencies {
  generateSuggestions: GenerateSuggestionsUseCase;
  listHistory: ListHistoryUseCase;
}

export async function buildServer(deps: ServerDependencies): Promise<FastifyInstance> {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true });

  app.get("/health", async () => ({ status: "ok" }));
  registerSuggestionsRoute(app, deps.generateSuggestions);
  registerHistoryRoute(app, deps.listHistory);

  return app;
}
