import { loadConfig } from "./config/env.js";
import { OllamaAdapter } from "./infrastructure/llm/ollamaAdapter.js";
import { InMemoryConversationRepository } from "./infrastructure/conversation/inMemoryConversationRepository.js";
import { ConversationCoachService } from "./domain/services/conversationCoachService.js";
import { GenerateSuggestionsUseCase } from "./application/generateSuggestionsUseCase.js";
import { ListConversationsUseCase } from "./application/listConversationsUseCase.js";
import { ContinueConversationUseCase } from "./application/continueConversationUseCase.js";
import { buildServer } from "./interface/http/server.js";

async function main(): Promise<void> {
  const config = loadConfig();

  // Composition root — the one place adapters get wired to ports.
  const llm = new OllamaAdapter(config.ollamaHost, config.ollamaModel);
  const conversationRepository = new InMemoryConversationRepository();
  const coachService = new ConversationCoachService(llm);

  const generateSuggestions = new GenerateSuggestionsUseCase(coachService, conversationRepository);
  const listConversations = new ListConversationsUseCase(conversationRepository);
  const continueConversation = new ContinueConversationUseCase(coachService, conversationRepository);

  const app = await buildServer({ generateSuggestions, listConversations, continueConversation });

  await app.listen({ port: config.port });
}

main().catch((error: unknown) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
