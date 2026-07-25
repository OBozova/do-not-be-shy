import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { loadConfig } from "../src/config/env.js";

const ENV_KEYS = ["PORT", "OLLAMA_HOST", "OLLAMA_MODEL"] as const;
let originalEnv: Record<(typeof ENV_KEYS)[number], string | undefined>;

beforeEach(() => {
  originalEnv = Object.fromEntries(ENV_KEYS.map((key) => [key, process.env[key]])) as typeof originalEnv;
  for (const key of ENV_KEYS) {
    delete process.env[key];
  }
});

afterEach(() => {
  for (const key of ENV_KEYS) {
    const value = originalEnv[key];
    if (value === undefined) {
      delete process.env[key];
    } else {
      process.env[key] = value;
    }
  }
});

describe("loadConfig", () => {
  it("falls back to defaults when PORT, OLLAMA_HOST, and OLLAMA_MODEL are unset", () => {
    expect(loadConfig()).toEqual({
      port: 3000,
      ollamaHost: "http://localhost:11434",
      ollamaModel: "llama3.2",
    });
  });

  it("uses PORT, OLLAMA_HOST, and OLLAMA_MODEL when set", () => {
    process.env.PORT = "8080";
    process.env.OLLAMA_HOST = "http://ollama.internal:11434";
    process.env.OLLAMA_MODEL = "mistral";

    expect(loadConfig()).toEqual({
      port: 8080,
      ollamaHost: "http://ollama.internal:11434",
      ollamaModel: "mistral",
    });
  });
});
