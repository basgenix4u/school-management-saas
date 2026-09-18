import Link from "next/link";

type LogoProps = {
  href?: string;
  compact?: boolean;
  className?: string;
};

/**
 * EduCore wordmark.
 *
 * Inline SVG rather than a raster asset: it renders crisply on low-end phones,
 * costs no download, and follows the brand token if it ever changes.
 */
export function EduCoreLogo({ href = "/", compact = false, className = "" }: LogoProps) {
  const content = (
    <span className={`educore-logo ${className}`} aria-label="EduCore home" role="img">
      <svg width={compact ? 28 : 34} height={compact ? 28 : 34} viewBox="0 0 36 36" fill="none" aria-hidden="true">
        <rect width="36" height="36" rx="9" fill="var(--primary-600)" />
        <path d="M10 12 18 8l8 4v13l-8 4-8-4V12Z" fill="var(--surface)" />
        <path d="M18 8v21" stroke="var(--primary-600)" strokeWidth="1.75" />
        <circle cx="18" cy="18" r="3.5" fill="var(--primary-600)" />
      </svg>
      {!compact && <span className="educore-wordmark">EduCore</span>}
    </span>
  );

  return href ? <Link href={href} aria-label="EduCore home">{content}</Link> : content;
}
