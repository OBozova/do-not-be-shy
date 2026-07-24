import type { FastifyInstance } from "fastify";
import type { HistoryListResponse } from "shared";
import type { ListHistoryUseCase } from "../../../application/listHistoryUseCase.js";

export function registerHistoryRoute(app: FastifyInstance, useCase: ListHistoryUseCase): void {
  app.get("/api/history", async (_request, reply) => {
    const entries = await useCase.execute();
    const body: HistoryListResponse = { entries };
    return reply.send(body);
  });
}
