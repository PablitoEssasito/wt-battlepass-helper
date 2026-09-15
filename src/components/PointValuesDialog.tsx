import InfoDialog from "./InfoDialog";
import { battlepassRules } from "../data/battlepassRules";
import { pointsFromChallenges } from "../helpers/pointsFromChallenges";

function PointValuesDialog() {
  const rules = [
    { label: "Easy task", value: `+${battlepassRules.easyTaskPoints} pts` },
    { label: "Medium task", value: `+${battlepassRules.mediumTaskPoints} pts` },
    { label: "Special task", value: `+${battlepassRules.specialTaskPoints} pts` },
    { label: "Daily login", value: "+1 to +5 pts" },
    {
      label: `${battlepassRules.challengeBonusAfter} challenges`,
      value: `+${pointsFromChallenges(battlepassRules.challengeBonusAfter) / 10} levels`,
    },
    {
      label: "Improved Pass",
      value: `+${battlepassRules.premiumPoints / 10} levels`,
    },
  ];

  return (
    <InfoDialog label="Rules" title="Point values" triggerLabel="Point values">
      <dl className="rule-list">
        {rules.map((rule) => (
          <div key={rule.label}>
            <dt>{rule.label}</dt>
            <dd>{rule.value}</dd>
          </div>
        ))}
      </dl>
      <p className="info-dialog-note">
        One level opens for 10 progress points. Logins are worth more the longer
        the season runs, rising from 1 point to 5 by day 78.
      </p>
    </InfoDialog>
  );
}

export default PointValuesDialog;
