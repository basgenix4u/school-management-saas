import type { ReactNode, SelectHTMLAttributes } from "react";

type SelectProps = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  leading?: ReactNode;
};

export function Select({ id, leading, children, ...rest }: SelectProps) {
  return (
    <span className="ui-control">
      {leading}
      <select id={id} {...rest}>
        {children}
      </select>
    </span>
  );
}
