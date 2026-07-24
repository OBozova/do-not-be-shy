export interface AppConfig {
  port: number;
  ollamaHost: string;
  ollamaModel: string;
}

export function loadConfig(): AppConfig {
  return {
    port: Number(process.env.PORT ?? 3000),
    ollamaHost: process.env.OLLAMA_HOST ?? "http://localhost:11434",
    ollamaModel: process.env.OLLAMA_MODEL ?? "llama3.2",
  };
}
