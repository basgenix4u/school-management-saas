import Link from "next/link";
import { ArrowRight, BellRing, Mail, Megaphone, MessageCircle, Send, Smartphone, UsersRound } from "lucide-react";
import { communicationInsights, communicationMetrics, communicationTimeline, messageCampaigns, messageTemplates } from "@/lib/communications-data";

function toneClass(tone: string) {
  if (tone === "emerald") return "tone-emerald";
  if (tone === "amber") return "tone-amber";
  if (tone === "rose") return "tone-rose";
  return "tone-blue";
}

export function CommunicationCenter() {
  return (
    <div className="communications-center premium-dashboard">
      <section className="card-aurora communications-hero">
        <div>
          <span className="premium-kicker"><Megaphone size={14} /> Communication Center</span>
          <h1>Turn school updates into targeted parent engagement.</h1>
          <p>Send announcements, fee reminders, attendance alerts, result notices and campaign messages with clear audience targeting and performance feedback.</p>
          <div className="hero-actions"><Link className="btn btn-primary" href="/dashboard/communications/campaigns"><Send size={18} /> Create Campaign</Link><button className="btn btn-secondary" type="button"><BellRing size={18} /> Broadcast Alert</button></div>
        </div>
        <div className="communications-hero-card"><strong>87%</strong><span>Parent read rate</span><small>2,842 messages sent this week</small></div>
      </section>

      <section className="premium-metrics">
        {communicationMetrics.map((metric) => <article className={`premium-metric ${toneClass(metric.tone)}`} key={metric.label}><div className="metric-icon"><MessageCircle /></div><span>{metric.label}</span><strong>{metric.value}</strong><small>{metric.change}</small><p>Communication metric for parent and school engagement.</p></article>)}
      </section>

      <section className="premium-grid-2 align-start">
        <div className="card premium-panel">
          <div className="panel-header compact"><div><span className="premium-kicker"><Mail size={14} /> Campaign Board</span><h2>Parent campaigns</h2></div><Link className="mini-link" href="/dashboard/communications/campaigns">Open board <ArrowRight size={15} /></Link></div>
          <div className="campaign-list">{messageCampaigns.map((campaign) => <article key={campaign.id}><div><strong>{campaign.title}</strong><span>{campaign.audience} • {campaign.channel}</span></div><div><strong>{campaign.recipients}</strong><span className="status good">{campaign.status}</span></div></article>)}</div>
        </div>

        <div className="card premium-panel">
          <span className="premium-kicker"><Smartphone size={14} /> Message Templates</span>
          <h2>Ready-to-send copy</h2>
          <div className="template-list">{messageTemplates.map((template) => <article key={template.title}><strong>{template.title}</strong><p>{template.body}</p></article>)}</div>
        </div>
      </section>

      <section className="premium-grid-2 align-start">
        <div className="card premium-panel">
          <span className="premium-kicker"><UsersRound size={14} /> Engagement Intelligence</span>
          <h2>Recommended actions</h2>
          <div className="signal-list">{communicationInsights.map((insight) => <article className="signal-item" key={insight.title}><div><strong>{insight.title}</strong><p>{insight.detail}</p><small>{insight.action}</small></div><span className={`status ${insight.severity === "High" ? "bad" : insight.severity === "Medium" ? "warn" : "good"}`}>{insight.severity}</span></article>)}</div>
        </div>

        <div className="card premium-panel">
          <span className="premium-kicker">Communication Timeline</span>
          <h2>Today’s engagement pulse</h2>
          <div className="timeline-list">{communicationTimeline.map((item) => <article key={item.time}><time>{item.time}</time><div><strong>{item.title}</strong><p>{item.body}</p></div></article>)}</div>
        </div>
      </section>
    </div>
  );
}
