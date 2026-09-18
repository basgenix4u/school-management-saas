"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { ArrowUpRight, Bot, CheckCircle2, Loader2, Send, ShieldAlert, Sparkles } from "lucide-react";

const suggestions = [
  "Which students need urgent intervention?",
  "Summarize fee collection risk this week",
  "Prepare parent reminder for unpaid invoices",
  "Show classes with attendance drop",
];

type AskResponse = {
  status: string;
  title?: string;
  body?: string;
  facts?: string[];
  action?: { label: string; href: string };
  message?: string;
};

type AnswerState =
  | { phase: "loading" }
  | { phase: "ready"; title: string; body: string; facts: string[]; action?: { label: string; href: string } }
  | { phase: "failed"; message: string };

async function answerQuestion(question: string): Promise<Extract<AnswerState, { phase: "ready" | "failed" }>> {
  try {
    const response = await fetch("/api/insights/ask", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ question }),
    });
    const data = (await response.json()) as AskResponse;
    if (!response.ok || data.status !== "ok" || !data.title || !data.body) {
      return { phase: "failed", message: data.message ?? "We could not analyse your school data just now." };
    }
    return { phase: "ready", title: data.title, body: data.body, facts: data.facts ?? [], action: data.action };
  } catch {
    return { phase: "failed", message: "The connection dropped before the analysis arrived. Please try again." };
  }
}

export function IntelligenceCopilot() {
  const [prompt, setPrompt] = useState(suggestions[0]);
  const [history, setHistory] = useState<string[]>([]);
  const [answer, setAnswer] = useState<AnswerState>({ phase: "loading" });
  const requestId = useRef(0);

  const ask = useCallback(async (question: string) => {
    const trimmed = question.trim();
    if (!trimmed) return;
    const id = ++requestId.current;
    setAnswer({ phase: "loading" });
    setHistory((current) => [trimmed, ...current.filter((item) => item !== trimmed)].slice(0, 4));
    const next = await answerQuestion(trimmed);
    if (requestId.current === id) setAnswer(next);
  }, []);

  // Opening briefing. The state already starts as loading, so the effect only
  // resolves the first answer and sets nothing synchronously.
  useEffect(() => {
    let cancelled = false;
    const id = ++requestId.current;
    void answerQuestion("Give me today's briefing for my school").then((next) => {
      if (!cancelled && requestId.current === id) setAnswer(next);
    });
    return () => {
      cancelled = true;
    };
  }, []);

  function submitPrompt(nextPrompt: string) {
    setPrompt(nextPrompt);
    void ask(nextPrompt);
  }

  return (
    <section className="copilot-card" aria-label="Operations insights">
      <div className="copilot-orb"><Bot size={22} /></div>
      <div className="copilot-header">
        <span className="premium-kicker"><Sparkles size={14} /> Insights</span>
        <h2>Operations insights</h2>
        <p>Computed from your school&apos;s live records — attendance, fees, results and risk.</p>
      </div>

      <div className="copilot-answer" aria-live="polite">
        {answer.phase === "loading" && (
          <p className="copilot-status"><Loader2 size={16} className="spin" /> Analysing your school records…</p>
        )}
        {answer.phase === "failed" && (
          <div className="copilot-failure">
            <p className="copilot-status"><ShieldAlert size={16} /> {answer.message}</p>
            <button type="button" onClick={() => ask(prompt)}>Try again</button>
          </div>
        )}
        {answer.phase === "ready" && (
          <>
            <div className="answer-label"><CheckCircle2 size={16} /> {answer.title}</div>
            <p>{answer.body}</p>
            {answer.facts.length > 0 && (
              <ul className="copilot-facts">
                {answer.facts.map((fact) => <li key={fact}>{fact}</li>)}
              </ul>
            )}
            {answer.action && (
              <a className="copilot-action" href={answer.action.href}>
                {answer.action.label} <ArrowUpRight size={16} />
              </a>
            )}
          </>
        )}
      </div>

      <form className="prompt-box" onSubmit={(event) => { event.preventDefault(); submitPrompt(prompt); }}>
        <input
          value={prompt}
          onChange={(event) => setPrompt(event.target.value)}
          aria-label="Ask Insights"
          placeholder="Ask about students, fees, reminders or attendance"
        />
        <button type="submit" aria-label="Send prompt"><Send size={18} /></button>
      </form>

      <div className="suggestion-grid">
        {suggestions.map((suggestion) => (
          <button key={suggestion} type="button" onClick={() => submitPrompt(suggestion)}>
            {suggestion}
          </button>
        ))}
      </div>

      {history.length > 0 && (
        <div className="history-strip" aria-label="Recent questions">
          {history.map((item) => <span key={item}>{item}</span>)}
        </div>
      )}
    </section>
  );
}
