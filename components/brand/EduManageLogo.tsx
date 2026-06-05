import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  href?: string;
  compact?: boolean;
  className?: string;
  uploaded?: boolean;
};

export function EduManageLogo({ href = "/", compact = false, className = "", uploaded = false }: LogoProps) {
  const content = uploaded ? (
    <span className={`brand-logo uploaded-brand-logo clean-wordmark ${className}`} aria-label="EduManage School OS">
      <Image
        src="/brand/edumanage-site-logo.webp"
        alt="EduManage School OS"
        width={1200}
        height={360}
        priority
        sizes="(max-width: 640px) 190px, 270px"
      />
    </span>
  ) : (
    <span className={`brand-logo ${className}`} aria-label="EduManage School OS">
      <Image
        src="/brand/edumanage-site-logo.webp"
        alt="EduManage School OS"
        width={1200}
        height={360}
        priority={false}
        sizes={compact ? "52px" : "220px"}
      />
    </span>
  );

  return href ? <Link href={href}>{content}</Link> : content;
}
