export function Skeleton({ width = "100%", height = "1rem", label = "Loading" }: { width?: string; height?: string; label?: string }) {
  return <span className="ui-skeleton" role="status" aria-label={label} style={{ display: "block", width, height }} />;
}
