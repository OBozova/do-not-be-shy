import { loadConfig } from "./config/env.js";
import { OllamaAdapter } from "./infrastructure/llm/ollamaAdapter.js";
import { InMemoryHistoryRepository } from "./infrastructure/history/inMemoryHistoryRepository.js";
import { ConversationCoachService } from "./domain/services/conversationCoachService.js";
import { GenerateSuggestionsUseCase } from "./application/generateSuggestionsUseCase.js";
import { ListHistoryUseCase } from "./application/listHistoryUseCase.js";
import { buildServer } from "./interface/http/server.js";

async function main(): Promise<void> {
  const config = loadConfig();

  // Composition root — the one place adapters get wired to ports.
  const llm = new OllamaAdapter(config.ollamaHost, config.ollamaModel);
  const historyRepository = new InMemoryHistoryRepository();
  const coachService = new ConversationCoachService(llm);

  const generateSuggestions = new GenerateSuggestionsUseCase(coachService, historyRepository);
  const listHistory = new ListHistoryUseCase(historyRepository);

  const app = await buildServer({ generateSuggestions, listHistory });

  await app.listen({ port: config.port });
}

main().catch((error: unknown) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
