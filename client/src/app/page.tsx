"use client";

import AgentForm from "@/components/task-agent/AgentForm";
import RunLogs from "@/components/task-agent/RunLogs";
import { runApproveAgent, runStartAgent } from "@/lib/api";
import { FinalView, InterruptView } from "@/lib/types";
import { useState } from "react";

function AgentPage() {
  const [loading, setLoading] = useState(false);
  const [interrupt, setInterrupt] = useState<InterruptView | null>(null);
  const [final, setFinal] = useState<FinalView | null>(null);
  const [threadId, setThreadId] = useState<string | null>(null);

  async function handleAgentStart(input: string) {
    setLoading(true);
    setFinal(null);
    setInterrupt(null);
    setThreadId(null);
    try {
      const res = await runStartAgent(input);
      if (res.status === "error") throw new Error(res.error);

      if (res.data?.kind === "interrupt") {
        setThreadId(res.data.interrupt.threadId);
        setInterrupt(res.data.interrupt);
      } else if (res.data?.kind === "final") {
        setFinal(res.data?.final);
      } else {
        throw new Error("Unexpected response format");
      }
    } catch (e) {
      setFinal({
        status: "cancelled",
        message: (e as any)?.message || "Failed to start agent",
      });
    } finally {
      setLoading(false);
    }
  }

  async function handleOnApprove() {
    if (!threadId) return;
    setLoading(true);
    try {
      const res = await runApproveAgent(threadId, true);
      if (res.status === "error") throw new Error(res.error);

      setInterrupt(null);
      setFinal((res.data?.final as FinalView) ?? null);
    } catch (e) {
      setFinal({
        status: "cancelled",
        message: (e as any)?.message || "Failed to approve the flow",
      });
    } finally {
      setLoading(false);
    }
  }
  async function handleOnReject() {
    if (!threadId) return;
    setLoading(true);
    try {
      const res = await runApproveAgent(threadId, false);
      if (res.status === "error") throw new Error(res.error);

      setInterrupt(null);
      setFinal((res.data?.final as FinalView) ?? null);
    } catch (e) {
      setFinal({
        status: "cancelled",
        message: (e as any)?.message || "Failed to reject the flow",
      });
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#020617] text-slate-50 selection:bg-cyan-500/30">
      {/* Decorative Background Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-[10%] -left-[10%] w-[40%] h-[40%] rounded-full bg-cyan-500/10 blur-[120px]" />
        <div className="absolute top-[20%] -right-[5%] w-[30%] h-[30%] rounded-full bg-blue-600/10 blur-[120px]" />
      </div>

      <div className="relative max-w-6xl mx-auto px-6 py-12 lg:py-16">
        {/* Header Section */}
        <header className="relative z-10 mb-12 flex flex-col items-center text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-medium mb-6 uppercase tracking-widest">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span>
            </span>
            Human-in-the-Loop AI
          </div>

          <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight bg-gradient-to-b from-white to-slate-400 bg-clip-text text-transparent mb-4">
            LangGraph <span className="text-cyan-500">Task Planner</span>
          </h1>

          <p className="max-w-2xl text-slate-400 text-lg md:text-xl leading-relaxed">
            Orchestrate complex workflows with precision. Empowering agents to
            think, plan, and collaborate with human oversight.
          </p>
        </header>

        {/* Main Interface Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Controls (4/12) */}
          <section className="lg:col-span-5 space-y-6">
            <div className="group relative p-[1px] rounded-2xl bg-gradient-to-b from-slate-700 to-slate-800/50 shadow-2xl">
              <div className="relative bg-slate-900/90 backdrop-blur-xl rounded-[15px] p-6 lg:p-8">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                    <svg
                      className="w-5 h-5 text-cyan-500"
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4"
                      />
                    </svg>
                  </div>
                  <h2 className="text-xl font-semibold">Configuration</h2>
                </div>

                <AgentForm onStart={handleAgentStart} disabled={loading} />
              </div>
            </div>

            {/* Status Card (Optional detail) */}
            <div className="p-4 rounded-xl border border-slate-800 bg-slate-900/50 flex items-center justify-between">
              <span className="text-sm text-slate-400">Thread ID:</span>
              <span className="text-xs font-mono text-cyan-500/80 bg-cyan-500/5 px-2 py-1 rounded">
                {threadId || "no-active-session"}
              </span>
            </div>
          </section>

          {/* Right Column: Logs/Output (7/12) */}
          <section className="lg:col-span-7 h-full">
            <div className="relative h-full min-h-[500px] flex flex-col rounded-2xl border border-slate-800 bg-slate-950/50 overflow-hidden shadow-inner">
              <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/30">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  <span className="text-sm font-medium text-slate-300">
                    Execution Logs
                  </span>
                </div>
                <div className="flex gap-1">
                  <div className="w-3 h-3 rounded-full bg-slate-800" />
                  <div className="w-3 h-3 rounded-full bg-slate-800" />
                  <div className="w-3 h-3 rounded-full bg-slate-800" />
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
                <RunLogs
                  final={final}
                  interrupt={interrupt}
                  loading={loading}
                  onApprove={handleOnApprove}
                  onReject={handleOnReject}
                />
              </div>
            </div>
          </section>
        </div>
      </div>

      {/* Footer Branding */}
      <footer className="mt-auto py-8 text-center text-slate-600 text-sm">
        Built with LangGraph & Next.js Framework
      </footer>
    </main>
  );
}

export default AgentPage;
