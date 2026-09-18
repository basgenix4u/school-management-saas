import type { AnchorHTMLAttributes, ButtonHTMLAttributes, ReactNode } from "react";

export type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";
export type ButtonSize = "md" | "sm";

export function buttonClass(variant: ButtonVariant = "primary", size: ButtonSize = "md", extra = ""): string {
  return ["ui-btn", `ui-btn-${variant}`, size === "sm" ? "ui-btn-sm" : "", extra].filter(Boolean).join(" ");
}

type Common = {
  variant?: ButtonVariant;
  size?: ButtonSize;
  children: ReactNode;
};

type ButtonProps = Common &
  ButtonHTMLAttributes<HTMLButtonElement> & { href?: undefined };

type LinkButtonProps = Common &
  AnchorHTMLAttributes<HTMLAnchorElement> & { href: string };

export function Button(props: ButtonProps | LinkButtonProps) {
  const { variant = "primary", size = "md", children, className = "", ...rest } = props;
  const classes = buttonClass(variant, size, className);
  if ("href" in rest && rest.href !== undefined) {
    const { href, ...anchorRest } = rest as LinkButtonProps;
    return (
      <a href={href} className={classes} {...anchorRest}>
        {children}
      </a>
    );
  }
  return (
    <button type="button" className={classes} {...(rest as ButtonProps)}>
      {children}
    </button>
  );
}
