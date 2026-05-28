"use client";

import { useMemo, useState } from "react";
import { Bot, CheckCircle2, Send, Sparkles } from "lucide-react";

const suggestions = [
  "Which students need urgent intervention?",
  "Summarize fee collection risk this week",
  "Prepare parent reminder for unpaid invoices",
  "Show classes with attendance drop",
];

const responses: Record<string, string> = {
  "Which students need urgent intervention?": "12 students need urgent attention. The strongest signal is a combined pattern of 3+ absences, unpaid balance and declining assessment scores. Recommended action: schedule class-teacher review and notify guardians today.",
  "Summarize fee collection risk this week": "₦6.4M remains pending. 42 guardians are high-probability payers if reminded within 48 hours. 17 invoices need accountant follow-up because they are overdue beyond the normal payment behavior window.",
  "Prepare parent reminder for unpaid invoices": "Draft ready: Dear Parent/Guardian, this is a friendly reminder that your child’s school fee balance is still pending. Kindly complete payment before the due date to avoid service interruptions. Thank you.",
  "Show classes with attendance drop": "SS2 Science and JSS3 Gold show the most visible attendance drops. SS2 Science dropped after lunch period for three consecutive days. JSS3 Gold has recurring Monday absences.",
};

export function IntelligenceCopilot() {
  const [prompt, setPrompt] = useState(suggestions[0]);
  const [history, setHistory] = useState<string[]>([suggestions[0]]);

  const answer = useMemo(() => responses[prompt] ?? "I can analyze attendance, payments, results and parent engagement once live data is connected.", [prompt]);

  function submitPrompt(nextPrompt: string) {
    setPrompt(nextPrompt);
    setHistory((current) => [nextPrompt, ...current.filter((item) => item !== nextPrompt)].slice(0, 4));
  }

  return (
    <section className="copilot-card">
      <div className="copilot-orb"><Bot size={22} /></div>
      <div className="copilot-header">
        <span className="premium-kicker"><Sparkles size={14} /> EduManage Intelligence</span>
        <h2>AI-style school operations copilot</h2>
        <p>Designed for instant answers across attendance, fees, academic performance and parent communication.</p>
      </div>

      <div className="copilot-answer">
        <div className="answer-label"><CheckCircle2 size={16} /> Recommended insight</div>
        <p>{answer}</p>
      </div>

      <div className="prompt-box">
        <input value={prompt} onChange={(event) => setPrompt(event.target.value)} aria-label="Ask EduManage Intelligence" />
        <button type="button" onClick={() => submitPrompt(prompt)} aria-label="Send prompt"><Send size={18} /></button>
      </div>

      <div className="suggestion-grid">
        {suggestions.map((suggestion) => (
          <button key={suggestion} type="button" onClick={() => submitPrompt(suggestion)}>
            {suggestion}
          </button>
        ))}
      </div>

      <div className="history-strip">
        {history.map((item) => <span key={item}>{item}</span>)}
      </div>
    </section>
  );
}
