import { ReactNode, useRef } from "react";

interface Props {
  triggerLabel: ReactNode;
  triggerClassName?: string;
  label: string;
  title: string;
  children: ReactNode;
}

function InfoDialog({
  triggerLabel,
  triggerClassName = "text-button",
  label,
  title,
  children,
}: Props) {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        className={triggerClassName}
        onClick={() => dialog.current?.showModal()}
      >
        {triggerLabel}
      </button>
      <dialog
        ref={dialog}
        className="info-dialog"
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
