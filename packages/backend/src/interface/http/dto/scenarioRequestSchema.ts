import { z } from "zod";

export const scenarioRequestSchema = z.object({
  description: z.string().min(1).max(2000),
});

export type ScenarioRequestBody = z.infer<typeof scenarioRequestSchema>;
