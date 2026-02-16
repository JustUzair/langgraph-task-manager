import { NextFunction, Request, Response } from "express";
import { StartSchema, ApproveSchema } from "./types.js";
import { runResumeAgent, runStartAgent } from "../../graph/graph.js";

export default {
  startGraph: async function (
    req: Request,
    res: Response,
  ): Promise<Response | void> {
    const parsed = StartSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        status: "error",
        error: "Error while parsing input",
      });
    }
    try {
      const result = await runStartAgent(parsed.data.input);
      if ("final" in result) {
        return res.status(200).json({
          status: "ok",
          data: {
            kind: "final",
            final: result.final,
          },
        });
      }
      if ("interrupt" in result) {
        return res.status(200).json({
          status: "ok",
          data: {
            kind: "interrupt",
            interrupt: {
              threadId: result.interrupt.threadId,
              steps: result.interrupt.steps,
              prompt:
                "Approve the generated plan to execute or reject to cancel!",
            },
          },
        });
      }

      return res.status(500).json({
        status: "error",
        error: "Unknown error",
      });
    } catch (err) {
      return res.status(500).json({
        status: "error",
        error: (err as any)?.message || "Unknown error",
      });
    }
  },

  resumeGraph: async function (
    req: Request,
    res: Response,
  ): Promise<Response | void> {
    const parsed = ApproveSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({
        status: "error",
        error: "Error while parsing input",
      });
    }
    try {
      const { approve, threadId } = parsed.data;
      const final = await runResumeAgent({
        approve,
        threadId,
      });
      return res.status(200).json({
        status: "ok",
        data: {
          kind: "final",
          final,
        },
      });
    } catch (err) {
      return res.status(500).json({
        status: "error",
        error: (err as any)?.message || "Unknown error",
      });
    }
  },
};
