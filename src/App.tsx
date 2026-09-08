import { useState } from "react";
import dayjs from "dayjs";

import "./App.css";
import NumberInput from "./components/NumberInput";
import DateInput from "./components/DateInput";
import { pointsFromLogins } from "./helpers/pointsFromLogins";
import { pointsFromChallenges } from "./helpers/pointsFromChallenges";
import { battlepassRules } from "./data/battlepassRules";

function App() {
  const seasonEndDate = "2026-10-21";
  const seasonStart = dayjs("2026-07-22T12:00:00Z");
  const originalLastDay = dayjs(seasonEndDate);
  const [bpLevel, setBpLevel] = useState(0);
  const [levelProgress, setLevelProgress] = useState(0);
  const [loginCount, setLoginCount] = useState(0);
  const [challengeCount, setChallengeCount] = useState(0);
  const [availableSpecialTasks, setAvailableSpecialTasks] = useState(0);
  const [useImprovedPass, setUseImprovedPass] = useState(false);
  const [lastDayOverride, setLastDayOverride] = useState(originalLastDay.format("YYYY-MM-DD"));
  const [lastDay, setLastDay] = useState(originalLastDay);

  const daysRemaining = Math.max(lastDay.diff(dayjs(), "day"), 0);
  const totalPoints = bpLevel * 10 + levelProgress;
  const loginPoints = pointsFromLogins(loginCount);
  const challengePoints = pointsFromChallenges(challengeCount);
  const otherPoints = Math.max(totalPoints - loginPoints - challengePoints, 0);
  const easyPoints = daysRemaining * battlepassRules.easyTaskPoints;
  const mediumPoints = daysRemaining * battlepassRules.mediumTaskPoints;
  const futureSpecialTaskPoints = Math.min(
    daysRemaining > 0 ? availableSpecialTasks : 0,
    battlepassRules.maxSpecialTasks
  ) * battlepassRules.specialTaskPoints;
  const remainingLoginSlots = Math.max(
    Math.min(daysRemaining, battlepassRules.totalDays - loginCount),
    0
  );
  const futureLoginPoints =
    pointsFromLogins(loginCount + remainingLoginSlots) - loginPoints;
  const possibleLevelsLogins = Math.round(totalPoints + futureLoginPoints) / 10;
  const possibleLevelsEasy = Math.round(totalPoints + futureLoginPoints + easyPoints) / 10;
  const possibleLevelsMedium = Math.round(totalPoints + futureLoginPoints + easyPoints + mediumPoints) / 10;
  const improvedPassLevels = battlepassRules.premiumPoints / 10;
  const possibleLevelsAllTasks = Math.round(
    totalPoints +
      futureLoginPoints +
      easyPoints +
      mediumPoints +
      futureSpecialTaskPoints +
      (useImprovedPass ? battlepassRules.premiumPoints : 0)
  ) / 10;
  const improvedPassDeadline = seasonStart.add(28, "day");
  const now = dayjs();
  const improvedPassAvailable =
    !now.isBefore(seasonStart) && now.isBefore(improvedPassDeadline);
  const possibleLevelWithPremium = possibleLevelsMedium + improvedPassLevels;
  const impliedPoints = loginPoints + challengePoints;
  const hasInputConflict = totalPoints < impliedPoints;
  const rewardCheckState =
    hasInputConflict
      ? "invalid"
      : possibleLevelsMedium >= 75
      ? "free"
      : possibleLevelWithPremium >= 75
        ? "premium"
        : "unreachable";
  const selectedLevel75Projection = useImprovedPass
    ? possibleLevelWithPremium
    : possibleLevelsMedium;
  const level75Gap = Math.max(75 - selectedLevel75Projection, 0);
  const currentProgress = Math.min(Math.max(totalPoints / 1500, 0), 1) * 100;

  const applyDeadline = () => {
    const selectedDate = dayjs(lastDayOverride);
    if (selectedDate.isValid()) {
      setLastDay(selectedDate);
    }
  };

  const resetDeadline = () => {
    setLastDayOverride(originalLastDay.format("YYYY-MM-DD"));
    setLastDay(originalLastDay);
  };

  return (
    <div className="app-shell">
      <header className="site-header">
        <div className="brand-lockup">
          <span className="brand-mark">WT</span>
          <div>
            <p className="brand-name">Passhelper</p>
            <p className="brand-subtitle">Do It Yourself / Battlepass Season 24</p>
          </div>
        </div>
        <div className="header-meta">
          <span className="live-indicator">LIVE CALCULATOR</span>
          <span>v{APP_VERSION}</span>
        </div>
      </header>

      <main className="workspace">
        <section className="input-zone" aria-labelledby="progress-heading">
          <div className="zone-heading">
            <div>
              <div>
                <p className="section-label">Current progress</p>
                <h2 id="progress-heading">Enter your values</h2>
              </div>
            </div>
          </div>
          <div className="input-grid">
            <NumberInput label="Current level" callback={setBpLevel} value={bpLevel.toString()} min={0} max={150} />
            <NumberInput label="Points to next level" callback={setLevelProgress} value={levelProgress.toString()} min={0} max={9} />
            <NumberInput label="Season logins" callback={setLoginCount} value={loginCount.toString()} min={0} max={battlepassRules.totalDays} />
            <NumberInput label="Challenges completed" callback={setChallengeCount} value={challengeCount.toString()} min={0} max={battlepassRules.challengeBonusAfter} />
            <NumberInput label="Special tasks available" callback={setAvailableSpecialTasks} value={availableSpecialTasks.toString()} min={0} max={battlepassRules.maxSpecialTasks} />
            <div className="deadline-input">
              <DateInput label="Season ends" callback={setLastDayOverride} value={lastDayOverride} />
              <button className="text-button" type="button" onClick={applyDeadline}>Apply date</button>
              {lastDay.diff(originalLastDay, "day") !== 0 && <button className="text-button muted-button" type="button" onClick={resetDeadline}>Reset</button>}
              <small className="known-deadline">Official Season 24 date: {originalLastDay.format("DD/MM/YYYY")}</small>
            </div>
            <label className="premium-toggle"><input type="checkbox" checked={useImprovedPass} onChange={(event) => setUseImprovedPass(event.target.checked)} /><span>I own the Improved Pass<strong>+{battlepassRules.premiumPoints} PP</strong></span></label>
          </div>
          {hasInputConflict && <p className="input-warning">Current progress is lower than the points implied by your logins and challenges. Check the values before relying on the forecast.</p>}
        </section>

        <section className="result-grid" aria-label="Battlepass result">
          <div className="result-panel">
            <div className="panel-topline">
              <p className="section-label">Best case scenario</p>
              <span className="result-tag">LOGINS + DAILY + SPECIAL{useImprovedPass ? " + IMPROVED PASS" : ""}</span>
            </div>
            <div className="result-number">{possibleLevelsAllTasks}<span> lvl</span></div>
            <p className="result-description">Projected level from remaining logins, daily tasks and the special tasks you have available.</p>
            <div className="special-task-note"><span>{availableSpecialTasks} special tasks available</span><strong>+{futureSpecialTaskPoints} PP possible</strong></div>
            <div className="result-progress"><span style={{ width: `${Math.min((possibleLevelsAllTasks / 150) * 100, 100)}%` }} /></div>
            <div className="result-footer"><span>Current level {bpLevel}</span><strong>{daysRemaining} days left</strong></div>
          </div>
          <div className={`target-panel reward-${rewardCheckState}`}>
            <p className="section-label">Level 75 reward check</p>
            <div className="target-status">{rewardCheckState === "invalid" ? "CHECK INPUTS" : rewardCheckState === "unreachable" ? "NOT YET" : "YES"}</div>
            <p>{rewardCheckState === "invalid" ? "The entered progress is lower than the points implied by your logins and challenges." : rewardCheckState === "free" ? "Reachable without buying 15 levels." : rewardCheckState === "premium" ? "Reachable with the Improved Pass (+15 levels)." : `${level75Gap.toFixed(1)} levels still needed with the options currently selected.`}</p>
            <div className="target-comparison"><span>Without Improved Pass<strong>{possibleLevelsMedium} lvl</strong></span><span>With Improved Pass<strong>{possibleLevelWithPremium} lvl</strong></span></div>
            {!improvedPassAvailable && <small className="premium-note">The Improved Pass purchase window closed after the first 28 days. Select it only if you already own it.</small>}
            <div className="target-date"><span>Season ends</span><strong>{lastDay.format("DD/MM/YYYY")}</strong></div>
          </div>
        </section>

        <section className="forecast-zone" aria-labelledby="forecast-heading">
          <div className="zone-heading compact-heading">
            <div>
              <div>
                <p className="section-label">Forecast</p>
                <h2 id="forecast-heading">Possible finish</h2>
              </div>
            </div>
            <span className="input-hint">Based on {daysRemaining} days remaining</span>
          </div>
          <div className="scenario-table">
            <div className="scenario-row scenario-header"><span>Scenario</span><span>Projected level</span><span>Additional gain</span></div>
            <div className="scenario-row"><span><strong>Logins only</strong><small>Keep logging in daily</small></span><strong className="scenario-level">{possibleLevelsLogins}</strong><span>+{(possibleLevelsLogins - totalPoints / 10).toFixed(1)} levels</span></div>
            <div className="scenario-row featured-row"><span><strong>Logins + easy tasks</strong><small>Daily logins and easy tasks</small></span><strong className="scenario-level">{possibleLevelsEasy}</strong><span>+{(possibleLevelsEasy - totalPoints / 10).toFixed(1)} levels</span></div>
            <div className="scenario-row"><span><strong>Logins + easy + medium</strong><small>Complete every available task</small></span><strong className="scenario-level">{possibleLevelsMedium}</strong><span>+{(possibleLevelsMedium - totalPoints / 10).toFixed(1)} levels</span></div>
          </div>
        </section>

        <section className="details-grid">
          <div className="details-panel">
            <div className="zone-heading compact-heading"><div><div><p className="section-label">Current points</p><h2>Progress breakdown</h2></div></div></div>
            <div className="breakdown-list">
              <div><span>Logins</span><strong>{loginPoints} pts</strong></div>
              <div><span>Challenges</span><strong>{challengePoints} pts</strong></div>
              <div><span>Daily and special tasks</span><strong>{otherPoints} pts</strong></div>
              <div className="breakdown-total"><span>Total progress</span><strong>{totalPoints} pts</strong></div>
            </div>
            <div className="current-progress"><span style={{ width: `${currentProgress}%` }} /></div>
          </div>
          <div className="details-panel rules-panel">
            <p className="section-label">Rules</p>
            <h2>Point values</h2>
            <div className="rule-columns"><span>Easy task<strong>+{battlepassRules.easyTaskPoints} pts</strong></span><span>Medium task<strong>+{battlepassRules.mediumTaskPoints} pts</strong></span><span>Special task<strong>+{battlepassRules.specialTaskPoints} pts</strong></span><span>{battlepassRules.challengeBonusAfter} challenges<strong>+{pointsFromChallenges(battlepassRules.challengeBonusAfter) / 10} levels</strong></span><span>Battlepass purchase<strong>+{battlepassRules.premiumPoints / 10} levels</strong></span></div>
          </div>
        </section>
      </main>

      <footer className="site-footer"><span>Based on the <a href="https://github.com/Gardnem6/wt-passhelper" target="_blank" rel="noreferrer">original tool by Gardnem6</a></span><span>Battlepass deadline: {lastDay.format("DD/MM/YYYY")}</span></footer>
    </div>
  );
}

export default App;
