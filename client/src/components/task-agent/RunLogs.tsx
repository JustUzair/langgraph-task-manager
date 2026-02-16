"use client";

import { useEffect, useRef } from "react";
import { FinalView, InterruptView } from "@/lib/types";
import {
  AlertCircle,
  CheckCircle2,
  Loader2,
  Sparkles,
  ThumbsDown,
  ThumbsUp,
  ChevronRight,
  Terminal as TerminalIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";

const RunLogs = ({
  interrupt,
  final,
  loading,
  onApprove,
  onReject,
}: {
  interrupt?: InterruptView | null;
  final?: FinalView | null;
  loading?: boolean;
  onApprove?: () => void;
  onReject?: () => void;
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom when content updates
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [interrupt, final, loading]);

  /**
   * High-end Scrollable Wrapper
   * Uses a CSS mask to create a "shadow" fade-out effect at the bottom.
   * h-[550px] matches the modernized AgentForm height.
   */
  const LogViewport = ({ children }: { children: React.ReactNode }) => (
    <div className="relative h-[550px] w-full">
      <div
        ref={scrollRef}
        className="h-full overflow-y-auto pr-2 custom-scrollbar scroll-smooth space-y-4 [mask-image:linear-gradient(to_bottom,black_85%,transparent_100%)]"
      >
        {children}
        {/* Spacer to ensure the last item can be scrolled past the fade-out zone */}
        <div className="h-20" />
      </div>

      {/* Aesthetic bottom edge glow */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-cyan-500/10 to-transparent pointer-events-none" />
    </div>
  );

  // --- LOADING STATE ---
  if (loading)
    return (
      <LogViewport>
        <div className="flex flex-col items-center justify-center h-[500px] animate-in fade-in zoom-in duration-500">
          <div className="relative">
            <div className="absolute inset-0 rounded-full bg-cyan-500/20 blur-xl animate-pulse" />
            <Loader2 className="h-12 w-12 animate-spin text-cyan-500 relative z-10" />
          </div>
          <div className="mt-6 text-center">
            <h3 className="text-lg font-bold text-white">
              Agent is Thinking...
            </h3>
            <p className="text-[10px] text-slate-500 font-mono mt-2 uppercase tracking-widest">
              Processing Graph Nodes
            </p>
          </div>
        </div>
      </LogViewport>
    );

  // --- INTERRUPT / APPROVAL STATE ---
  if (interrupt)
    return (
      <div className="flex flex-col h-[550px]">
        <LogViewport>
          <div className="flex items-center gap-3 p-4 rounded-xl bg-amber-500/5 border border-amber-500/20 mb-4">
            <AlertCircle className="h-5 w-5 text-amber-500" />
            <span className="text-xs font-semibold text-amber-200 uppercase tracking-wider">
              Human-in-the-Loop Required
            </span>
          </div>

          <div className="space-y-3">
            {interrupt?.steps.map((step, i) => (
              <div
                key={`${step}-${i}`}
                className="group flex gap-4 p-4 rounded-xl bg-slate-900/40 border border-slate-800/50 hover:border-slate-700 transition-colors"
              >
                <span className="flex-none flex items-center justify-center h-6 w-6 rounded-md bg-slate-800 text-[10px] font-bold text-slate-400 font-mono">
                  0{i + 1}
                </span>
                <p className="text-slate-300 leading-relaxed text-sm">{step}</p>
              </div>
            ))}
          </div>
        </LogViewport>

        {/* Fixed Action Bar for symmetry */}
        <div className="pt-4 grid grid-cols-2 gap-3 mt-auto border-t border-slate-800/50 bg-slate-950/50">
          <Button
            onClick={onApprove}
            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg shadow-lg shadow-emerald-900/20 py-6"
          >
            <ThumbsUp className="mr-2 h-4 w-4" /> Approve Plan
          </Button>
          <Button
            variant="outline"
            onClick={onReject}
            className="border-slate-800 bg-transparent hover:bg-red-500/10 hover:text-red-400 text-slate-400 rounded-lg py-6"
          >
            <ThumbsDown className="mr-2 h-4 w-4" /> Reject
          </Button>
        </div>
      </div>
    );

  // --- FINAL RESULT STATE ---
  if (final)
    return (
      <LogViewport>
        <div className="relative p-5 rounded-xl bg-emerald-500/5 border border-emerald-500/20 mb-6 overflow-hidden">
          <div className="absolute top-0 right-0 p-4 opacity-5">
            <CheckCircle2 className="h-16 w-16 text-emerald-500" />
          </div>
          <div className="relative z-10 text-center sm:text-left">
            <div className="flex items-center gap-2 text-emerald-400 mb-2 justify-center sm:justify-start">
              <CheckCircle2 className="h-5 w-5" />
              <h3 className="font-bold text-sm uppercase tracking-tight">
                Success
              </h3>
            </div>
            <p className="text-slate-300 text-sm leading-relaxed">
              {final.message || "Workflow completed successfully."}
            </p>
          </div>
        </div>

        {final?.results && final.results.length > 0 && (
          <div className="space-y-4">
            <h4 className="flex items-center gap-2 text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              <TerminalIcon className="h-3 w-3" /> Execution Log
            </h4>
            <div className="space-y-3">
              {final.results.map((result, i) => (
                <div
                  key={`res-${i}`}
                  className="p-4 rounded-xl border border-slate-800 bg-slate-900/20 hover:bg-slate-900/40 transition-all duration-300"
                >
                  <div className="flex items-start gap-3">
                    <ChevronRight className="h-4 w-4 text-cyan-500 mt-1" />
                    <div>
                      <p className="font-semibold text-slate-200 text-sm mb-1">
                        {result?.step}
                      </p>
                      <p className="text-xs text-slate-500 leading-relaxed">
                        {result?.note}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </LogViewport>
    );

  // --- IDLE STATE ---
  return (
    <div className="h-[550px] flex flex-col items-center justify-center opacity-40 animate-in fade-in duration-1000">
      <div className="h-16 w-16 rounded-full border border-dashed border-slate-700 flex items-center justify-center mb-4">
        <Sparkles className="h-6 w-6 text-slate-600" />
      </div>
      <div className="text-center">
        <p className="text-sm font-medium text-slate-500">System Standby</p>
        <p className="text-[10px] text-slate-700 font-mono mt-1 uppercase tracking-tighter">
          Awaiting Input Prompt
        </p>
      </div>
    </div>
  );
};

export default RunLogs;
