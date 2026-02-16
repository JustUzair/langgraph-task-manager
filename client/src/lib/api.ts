import { State } from "./types";

const BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export async function runStartAgent(input: string) {
  const res = await fetch(`${BASE}/api/v1/agent`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ input }),
  });

  if (!res.ok) throw new Error(`Start agent failed: ${res.status}`);

  return res.json() as Promise<{
    status: "ok" | "error";
    data?:
      | { kind: "final"; final: any }
      | {
          kind: "interrupt";
          interrupt: {
            threadId: string;
            steps: string[];
            prompt: string;
          };
        };
    error?: string;
  }>;
}

export async function runApproveAgent(threadId: string, approve: boolean) {
  const res = await fetch(`${BASE}/api/v1/agent/approve`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ threadId, approve }),
  });

  if (!res.ok) throw new Error(`Approve step failed: ${res.status}`);

  return res.json() as Promise<{
    status: "ok" | "error";
    data?: { kind: "final"; final: Partial<State> };
    error?: string;
  }>;
}
