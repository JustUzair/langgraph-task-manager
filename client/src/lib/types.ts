export type InterruptView = {
  threadId: string;
  steps: string[];
  prompt: string;
};

export type FinalView = {
  status: "planned" | "done" | "cancelled";
  message?: string;
  steps?: string[];
  results?: { step: string; note: string }[];
};

export type State = {
  input: string;
  steps?: string[];
  approved?: boolean;
  results?: { step: string; note: string }[];
  status?: "planned" | "done" | "cancelled";
  message?: string;
};
