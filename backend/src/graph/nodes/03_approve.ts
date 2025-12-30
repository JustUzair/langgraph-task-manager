import type { State } from "../types";

export async function ApproveNode(
  state: State,
  context: any
): Promise<Partial<State>> {
  if (state.status == "cancelled") return {};
  const steps = state.steps ?? [];
  if (steps.length == 0)
    return {
      approved: true,
      message: "No steps to approve, proceeding...",
    };
  const interrupt = context?.interrupt as (
    payload: unknown
  ) => Promise<unknown>;
  const decision = await interrupt({
    type: "approval_request",
    steps,
  });
  let approved: boolean;
  if (
    decision &&
    typeof decision === "object" &&
    "approve" in (decision as any)
  ) {
    approved = !!(decision as any).approve;
  } else {
    approved = !!decision;
  }
  return {
    approved,
  };
}
