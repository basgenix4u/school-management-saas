import { Mail } from "lucide-react";
import { messageCampaigns } from "@/lib/communications-data";

export default function CampaignsPage() {
  return (
    <div className="premium-dashboard">
      <section className="card-aurora intelligence-hero">
        <span className="premium-kicker"><Mail size={14} /> Campaign Manager</span>
        <h1>Plan and monitor parent communication campaigns.</h1>
        <p>Audience targeting, message channel, recipient count and engagement performance in one campaign management board.</p>
      </section>
      <section className="card premium-panel">
        <table className="table premium-table">
          <thead><tr><th>ID</th><th>Campaign</th><th>Audience</th><th>Channel</th><th>Status</th><th>Recipients</th><th>Performance</th></tr></thead>
          <tbody>{messageCampaigns.map((campaign) => <tr key={campaign.id}><td>{campaign.id}</td><td>{campaign.title}</td><td>{campaign.audience}</td><td>{campaign.channel}</td><td><span className="status good">{campaign.status}</span></td><td>{campaign.recipients}</td><td>{campaign.performance}%</td></tr>)}</tbody>
        </table>
      </section>
    </div>
  );
}
