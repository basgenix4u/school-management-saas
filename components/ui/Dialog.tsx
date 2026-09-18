"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { X } from "lucide-react";

type DialogProps = {
  open: boolean;
  title: string;
  onClose: () => void;
  children: ReactNode;
  footer?: ReactNode;
};

/**
 * Modal dialog over the native <dialog> element: focus trapping, Escape to
 * close and backdrop dismissal come from the platform rather than hand-rolled
 * handlers.
 */
export function Dialog({ open, title, onClose, children, footer }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open ]);

  return (
    <dialog
      ref={ref}
      className="ui-dialog"
      aria-labelledby="ui-dialog-title"
      onClose={onClose}
      onClick={(event) => {
        if (event.target === ref.current) ref.current?.close();
      }}
    >
      <div className="ui-dialog-head">
        <h2 className="ui-dialog-title" id="ui-dialog-title">
          {title}
        </h2>
        <button type="button" className="ui-dialog-close" onClick={() => ref.current?.close()} aria-label="Close dialog">
          <X size={18} />
        </button>
      </div>
      <div className="ui-dialog-body">{children}</div>
      {footer ? <div className="ui-dialog-foot">{footer}</div> : null}
    </dialog>
  );
}
