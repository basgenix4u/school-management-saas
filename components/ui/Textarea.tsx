import type { TextareaHTMLAttributes } from "react";

type TextareaProps = TextareaHTMLAttributes<HTMLTextAreaElement> & { id: string };

export function Textarea({ id, ...rest }: TextareaProps) {
  return <textarea id={id} className="ui-textarea" {...rest} />;
}
