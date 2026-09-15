import InfoDialog from "./InfoDialog";
import { changelog } from "../data/changelog";

function ChangelogDialog() {
  return (
    <InfoDialog triggerLabel="Changelog" label="Changelog" title="What changed">
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
    </InfoDialog>
  );
}

export default ChangelogDialog;
