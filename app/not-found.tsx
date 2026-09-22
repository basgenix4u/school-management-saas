import { Compass } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

/** Honest 404: the address exists nowhere in the product. */
export default function NotFound() {
  return (
    <div className="page" style={{ maxWidth: "36rem", margin: "4rem auto" }}>
      <Card title="Page not found">
        <p>
          <Compass size={38} className="ui-icon-muted" aria-hidden="true" />
        </p>
        <p>This address does not exist. It may have been mistyped, or the page may have moved.</p>
        <div className="action-row">
          <Button href="/dashboard">Back to overview</Button>
          <Button variant="secondary" href="/">Home page</Button>
        </div>
      </Card>
    </div>
  );
}
