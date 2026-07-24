import { z } from "zod";

export const continueConversationRequestSchema = z.object({
  message: z.string().min(1).max(1000),
});

export type ContinueConversationRequestBody = z.infer<typeof continueConversationRequestSchema>;
