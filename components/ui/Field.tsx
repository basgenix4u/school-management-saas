import { useId, type ReactNode } from "react";

type FieldProps = {
  label: string;
  hint?: string;
  error?: string;
  required?: boolean;
  children: (id: string) => ReactNode;
};

/**
 * Label, hint and error wiring for one control. The child receives the input
 * id so labelling stays correct without repeated plumbing.
 */
export function Field({ label, hint, error, required, children }: FieldProps) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  return (
    <div className="ui-field" data-invalid={error ? "true" : undefined}>
      <label className="ui-label" htmlFor={id}>
        {label} {required ? <span className="ui-required" aria-hidden="true">*</span> : null}
      </label>
      {children(id)}
      {hint && !error ? (
        <p className="ui-hint" id={hintId}>
          {hint}
        </p>
      ) : null}
      {error ? (
        <p className="ui-error-text" id={errorId} role="alert">
          {error}
        </p>
      ) : null}
    </div>
  );
}
