import { z } from "zod";
import type { FollowUpMessageInput } from "shared";

export const continueConversationRequestSchema = z.object({
  message: z.string().min(1).max(1000),
}) satisfies z.ZodType<FollowUpMessageInput>;

export type ContinueConversationRequestBody = FollowUpMessageInput;
