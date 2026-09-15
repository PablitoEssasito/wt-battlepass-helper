import { ReactNode, useRef } from "react";

interface Props {
  triggerLabel: ReactNode;
  triggerClassName?: string;
  dialogClassName?: string;
  label: string;
  title: string;
  /** Runs before the dialog opens, so heavy content can wait for a click. */
  onOpen?: () => void;
  children: ReactNode;
}

function InfoDialog({
  triggerLabel,
  triggerClassName = "text-button",
  dialogClassName = "",
  label,
  title,
  onOpen,
  children,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        className={triggerClassName}
        onClick={() => {
          onOpen?.();
          dialog.current?.showModal();
        }}
      >
        {triggerLabel}
      </button>
      <dialog
        ref={dialog}
        className={`info-dialog ${dialogClassName}`.trim()}
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current?.close();
        }}
      >
        <div className="info-dialog-head">
          <div>
            <p className="section-label">{label}</p>
            <h2>{title}</h2>
          </div>
          <button
            type="button"
            className="text-button"
            onClick={() => dialog.current?.close()}
          >
            Close
          </button>
        </div>
        {children}
      </dialog>
    </>
  );
}

export default InfoDialog;
