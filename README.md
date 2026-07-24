# Do Not Be Shy

An AI conversation-prep assistant. Describe a situation you're about to walk into — a job interview, a first date, a networking event, your first day at a new job — and it hands you back four things: **openers**, **jokes**, **talking points**, and **things worth researching beforehand**.

Built as a take-home challenge focused on clean architecture and design over feature count.

## Running locally

**Prerequisites:** Node.js 20+, [Ollama](https://ollama.com) installed locally.

```bash
# 1. Pull the model (one-time, ~2GB)
ollama pull llama3.2

# 2. Make sure Ollama is serving (usually automatic after install; otherwise:)
ollama serve

# 3. Install dependencies
npm install

# 4. Run backend and frontend in two terminals
npm run dev:backend    # http://localhost:3000
npm run dev:frontend   # http://localhost:5173
```

Open http://localhost:5173, describe a situation, click "Get suggestions."

Backend tests: `npm test` (runs the backend's Vitest suite — no Ollama needed, the domain logic is tested against a fake LLM).

### Configuration

The backend reads three optional env vars (defaults shown):

```
PORT=3000
OLLAMA_HOST=http://localhost:11434
OLLAMA_MODEL=llama3.2
```

## Model used

**Ollama + `llama3.2`**, run locally. Chosen for the free/local constraint in the brief, fast enough for a chat-like round trip on a laptop, and reliable enough at following the "return only this JSON shape" instruction for a small structured-output task like this one.

## Architecture

The backend follows a lightweight **hexagonal / ports-and-adapters** layering:

```
domain/          # Scenario, SuggestionSet invariants, ConversationCoachService — no framework, no I/O
  ports/         # LlmPort, HistoryRepository — interfaces the domain depends on
infrastructure/  # OllamaAdapter (implements LlmPort), InMemoryHistoryRepository (implements HistoryRepository)
application/     # GenerateSuggestionsUseCase, ListHistoryUseCase — orchestrate domain + ports for one operation
interface/http/  # Fastify routes — translate HTTP <-> use cases, nothing else
index.ts         # composition root — the one place adapters get wired to ports
```

The frontend is a small Vue 3 + TypeScript SPA: a Pinia store holds state, a typed `suggestionsApi` client is the only thing that calls `fetch`, and components stay presentational.

Shared request/response types live in `packages/shared`, imported by both sides, so a change to the `SuggestionSet` shape is a compile error everywhere it isn't updated.

## Key design decisions

- **`LlmPort` interface + `OllamaAdapter` implementation.** The domain service (`ConversationCoachService`) only knows "give me a `SuggestionSet` for this `Scenario`." Swapping Ollama for OpenAI, or any other provider, means writing one new adapter — nothing in `domain/` or `application/` changes. This is the one thing I most wanted to demonstrate.
- **Zod schemas doing double duty.** The same schema-based approach validates incoming HTTP requests *and* the raw JSON an LLM hands back before it's trusted anywhere else in the system — a real boundary, not a formality, since a local model occasionally drifts from the requested shape. `suggestionSetSchema` is built directly from the `SUGGESTION_CATEGORIES` constant in `shared`, so adding a fifth category is a one-line change, not a four-file hunt.
- **A domain invariant separate from schema validation.** `assertCompleteSuggestionSet` checks that every category actually has content — syntactically valid but empty output isn't useful to the user, and that's a business rule, not a shape rule, so it lives in `domain/`, not the zod schema.
- **Manual composition root, no DI framework.** `backend/src/index.ts` wires every adapter to its port by hand. At this size a DI container would be ceremony without payoff; the wiring is small enough to read top-to-bottom.
- **Repository pattern for history, backed by memory.** `HistoryRepository` is an interface for the same reason `LlmPort` is — the fact that today's implementation is a plain array is an implementation detail the use cases don't know about.
- **Tests exercise the domain against a fake LLM.** `test/conversationCoachService.test.ts` proves the coaching logic and its invariants work without Ollama installed — the clearest payoff of the ports-and-adapters boundary.

## Trade-offs

- **No persistence.** History is a single in-process array — it resets on restart and isn't scoped per user. Fine for a local single-user demo; the first thing to change for anything real.
- **No auth / multi-user support.** Out of scope for the brief; the `HistoryRepository` interface is where a per-user store would slot in.
- **Prompt-based structure, not a JSON-schema-constrained decode.** Ollama can constrain output to a JSON Schema; I asked for the shape in the prompt text plus `format: "json"` and validated after the fact instead, since it kept the adapter simpler and the validation step is worth having regardless of how well the model behaves.
- **Fastify over Express.** Chosen for first-class TypeScript support and a schema-first feel that fits the rest of the stack — not a strong opinion, either would have worked.
- **Minimal styling.** The UI is intentionally plain — the brief is explicit that UI polish isn't the point.

## What I'd build next with more time

- Streaming responses (Ollama supports it) so suggestions appear progressively instead of after one full round trip.
- A "regenerate this category" action — right now it's all four categories or nothing.
- Session-scoped history behind a lightweight identifier, as a stepping stone to real persistence.
- A second `LlmPort` implementation (OpenAI or Anthropic) to prove the adapter boundary with a second real provider, not just the fake used in tests.
- Golden-path frontend tests (Vue Testing Library) alongside the existing backend Vitest suite.
