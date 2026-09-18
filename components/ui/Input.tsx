import type { InputHTMLAttributes, ReactNode } from "react";

type InputProps = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  leading?: ReactNode;
  trailing?: ReactNode;
};

export function Input({ id, leading, trailing, ...rest }: InputProps) {
  return (
    <span className="ui-control">
      {leading}
      <input id={id} {...rest} />
      {trailing}
    </span>
  );
}
