import { useRef } from "react";
import { changelog } from "../data/changelog";

function ChangelogDialog() {
  const dialog = useRef<HTMLDialogElement>(null);

  return (
    <>
      <button
        type="button"
        className="version-button"
        onClick={() => dialog.current?.showModal()}
      >
        v{APP_VERSION}
      </button>
      <dialog
        ref={dialog}
        className="changelog-dialog"
        onClick={(event) => {
          if (event.target === dialog.current) dialog.current?.close();
        }}
      >
        <div className="changelog-head">
          <div>
            <p className="section-label">Changelog</p>
            <h2>What changed</h2>
          </div>
          <button
            type="button"
            className="text-button"
            onClick={() => dialog.current?.close()}
          >
            Close
          </button>
        </div>
        <ol className="changelog-list">
          {changelog.map((entry) => (
            <li key={entry.version}>
              <div className="changelog-version">
                <strong>v{entry.version}</strong>
                <span>{entry.date}</span>
              </div>
              <ul>
                {entry.changes.map((change) => (
                  <li key={change}>{change}</li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </dialog>
    </>
  );
}

export default ChangelogDialog;
