import { Component } from "react";
import { Button } from "@/components/ui/button";

export class PageBoundary extends Component {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    if (!this.state.failed) return this.props.children;
    return (
      <div role="alert" className="space-y-4 py-12">
        <h1 className="text-xl font-semibold">Page unavailable</h1>
        <p className="text-sm text-muted-foreground">
          The page could not load. Check your connection and reload, or choose
          another page from the navigation.
        </p>
        <Button onClick={() => window.location.reload()}>Reload page</Button>
      </div>
    );
  }
}
