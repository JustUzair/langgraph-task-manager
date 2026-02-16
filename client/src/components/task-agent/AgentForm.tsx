"use client";

import React, { useState } from "react";
import { Sparkles, Terminal, SendHorizontal } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";

const AgentForm = ({
  onStart,
  disabled,
}: {
  onStart: (input: string) => void;
  disabled?: boolean;
}) => {
  const [text, setText] = useState("");

  return (
    <div className="space-y-6">
      {/* Label/Header Section */}
      <div className="flex items-center gap-3">
        <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-cyan-500/20 to-blue-600/20 border border-cyan-500/30">
          <Sparkles className="h-5 w-5 text-cyan-400" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-white tracking-tight">
            Prompt the Agent
          </h3>
          <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">
            Define your workflow goals
          </p>
        </div>
      </div>

      <div className="relative group">
        {/* Animated focus ring effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500 to-blue-600 rounded-2xl blur opacity-20 group-focus-within:opacity-40 transition duration-500" />

        <div className="relative bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden">
          {/* Textarea Header */}
          <div className="flex items-center gap-2 px-4 py-2 border-b border-slate-800 bg-slate-900/50">
            <Terminal className="h-3.5 w-3.5 text-slate-500" />
            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
              Input_Prompt
            </span>
          </div>

          <Textarea
            placeholder="Describe your task... e.g., 'Build a multi-agent research workflow for market analysis'"
            onChange={e => setText(e.target.value)}
            value={text}
            className="w-full bg-transparent border-none focus-visible:ring-0 focus-visible:ring-offset-0 text-slate-200 placeholder:text-slate-600 p-4 min-h-[160px] resize-none text-base leading-relaxed"
          />

          {/* Bottom Bar for metadata or quick stats */}
          <div className="px-4 py-2 flex justify-between items-center bg-slate-900/30 border-t border-slate-800/50">
            <span className="text-[10px] text-slate-600 font-mono">
              CHARS: {text.length}
            </span>
            <span className="text-[10px] text-slate-600 font-mono">READY</span>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <Button
        onClick={() => text.trim() && onStart(text.trim())}
        disabled={disabled || text.trim().length === 0}
        className={`
          relative w-full h-12 overflow-hidden rounded-xl font-bold transition-all duration-300
          ${
            disabled || text.trim().length === 0
              ? "bg-slate-800 text-slate-500"
              : "bg-white text-slate-950 hover:bg-cyan-50 hover:scale-[1.02] active:scale-[0.98] shadow-[0_0_20px_rgba(6,182,212,0.3)]"
          }
        `}
      >
        {/* Shimmer effect for active button */}
        {!disabled && text.trim().length > 0 && (
          <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-transparent via-cyan-400/10 to-transparent -translate-x-full animate-[shimmer_2s_infinite]" />
        )}

        <div className="flex items-center justify-center gap-2">
          {disabled ? (
            <>
              <div className="h-4 w-4 border-2 border-slate-500 border-t-transparent rounded-full animate-spin" />
              <span>Initializing Agent...</span>
            </>
          ) : (
            <>
              <SendHorizontal className="h-4 w-4" />
              <span>Execute Workflow</span>
            </>
          )}
        </div>
      </Button>

      {/* Micro-copy */}
      <p className="text-center text-[11px] text-slate-500 italic">
        The agent will analyze your request and generate a multi-step execution
        plan.
      </p>
    </div>
  );
};

export default AgentForm;
