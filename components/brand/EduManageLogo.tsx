import Link from "next/link";

type LogoProps = {
  href?: string;
  compact?: boolean;
  className?: string;
};

export function EduManageLogo({ href = "/", compact = false, className = "" }: LogoProps) {
  const content = (
    <span className={`brand-logo ${className}`} aria-label="EduManage School OS">
      <span className="brand-logo-mark" aria-hidden="true">
        <svg width="28" height="28" viewBox="0 0 28 28" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M14 2.6 25.1 8.4 14 14.2 2.9 8.4 14 2.6Z" fill="currentColor" opacity="0.96" />
          <path d="M6.4 12.1v5.3c0 3.5 3.4 6.1 7.6 6.1s7.6-2.6 7.6-6.1v-5.3L14 16.1 6.4 12.1Z" fill="currentColor" opacity="0.72" />
          <path d="M23.8 9.4v7.1" stroke="currentColor" strokeWidth="2" strokeLinecap="round" opacity="0.72" />
        </svg>
      </span>
      {!compact ? (
        <span className="brand-logo-copy">
          <strong>EduManage</strong>
          <small>School OS</small>
        </span>
      ) : null}
    </span>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
