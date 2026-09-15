import { useState } from "react";
import dayjs from "dayjs";

import "./App.css";
import NumberInput from "./components/NumberInput";
import DateInput from "./components/DateInput";
import ChangelogDialog from "./components/ChangelogDialog";
import { pointsFromChallenges } from "./helpers/pointsFromChallenges";
import { buildForecast } from "./helpers/forecast";
import { battlepassRules } from "./data/battlepassRules";

function App() {
  const seasonEndDate = "2026-10-21";
  const originalLastDay = dayjs(seasonEndDate);
  const [bpLevel, setBpLevel] = useState(0);
  const [levelProgress, setLevelProgress] = useState(0);
  const [loginCount, setLoginCount] = useState(0);
  const [challengeCount, setChallengeCount] = useState(0);
  const [availableSpecialTasks, setAvailableSpecialTasks] = useState(0);
  const [lastDayOverride, setLastDayOverride] = useState(originalLastDay.format("YYYY-MM-DD"));
  const [lastDay, setLastDay] = useState(originalLastDay);
  const [pickedTarget, setPickedTarget] = useState<number | null>(null);

  // Today's tasks count as already done, so the window runs from tomorrow to the last day inclusive.
  const daysRemaining = Math.max(
    lastDay.startOf("day").diff(dayjs().startOf("day"), "day"),
    0
  );
  const {
    totalPoints,
    currentLevel,
    loginPoints,
    challengePoints,
    otherPoints,
    futureSpecialTaskPoints,
    possibleLevelsLogins,
    possibleLevelsEasy,
    possibleLevelsMedium,
    possibleLevelsAllTasks,
    possibleLevelsWithPass,
    milestones,
    nextMilestone,
    hasInputConflict,
    passLevels,
    levelsToBuy,
    buyDirectCost,
    levelsAfterPass,
    buyWithPassCost,
    cheaperWithPass,
    targetLevel,
    levelsToTarget,
    targetMargin,
    requiredPointsPerDay,
    dailyTaskCeiling,
    specialPointsPerDay,
    maxPointsPerDay,
    tempoState,
  } = buildForecast({
    bpLevel,
    levelProgress,
    loginCount,
    challengeCount,
    availableSpecialTasks,
    daysRemaining,
    targetLevel: pickedTarget ?? undefined,
  });
  const maxPoints = battlepassRules.maxLevel * 10;
  const trackPercent = (level: number) =>
    Math.min(Math.max(level / battlepassRules.maxLevel, 0), 1) * 100;
  const milestoneStatusLabel = {
    reached: "Reached",
    onTrack: "On track",
    withPass: "With Pass",
    short: "Short",
  } as const;
  const currentProgress = Math.min(Math.max(totalPoints / maxPoints, 0), 1) * 100;
  const tempoFillWidth = Math.min(requiredPointsPerDay / maxPointsPerDay, 1) * 100;
  const tempoMarkerLeft = (dailyTaskCeiling / maxPointsPerDay) * 100;
  const tempoMessage =
    tempoState === "comfortable"
      ? `Easy and medium tasks cover it, with ${(dailyTaskCeiling - requiredPointsPerDay).toFixed(1)} PP/day to spare.`
      : tempoState === "tight"
      ? `Easy and medium tasks are not enough — ${(requiredPointsPerDay - dailyTaskCeiling).toFixed(1)} PP/day has to come from your special task pool.`
      : `Beyond your ceiling of ${maxPointsPerDay.toFixed(1)} PP/day, even using every special task you have.`;
  const progressSourceTotal = loginPoints + challengePoints + otherPoints;
  const loginProgress = progressSourceTotal > 0 ? (loginPoints / progressSourceTotal) * 100 : 0;
  const challengeProgress = progressSourceTotal > 0 ? (challengePoints / progressSourceTotal) * 100 : 0;
  const taskProgress = progressSourceTotal > 0 ? (otherPoints / progressSourceTotal) * 100 : 0;

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
            <h1 className="brand-name">War Thunder Battle Pass Calculator</h1>
            <p className="brand-subtitle">Season 24 progress planner</p>
          </div>
        </div>
        <div className="header-meta">
          <span className="live-indicator">LIVE CALCULATOR</span>
          <ChangelogDialog />
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
            <NumberInput label="Current level" callback={setBpLevel} value={bpLevel.toString()} min={0} max={battlepassRules.maxLevel} />
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
          </div>
          {hasInputConflict && <p className="input-warning">Current progress is lower than the points implied by your logins and challenges. Check the values before relying on the forecast.</p>}
        </section>

        <section className="track-zone" aria-labelledby="track-heading">
          <div className="zone-heading compact-heading">
            <div>
              <div>
                <p className="section-label">Season track</p>
                <h2 id="track-heading">Level {battlepassRules.maxLevel} ladder</h2>
              </div>
            </div>
            <span className="input-hint">{daysRemaining} days left</span>
          </div>
          <div className="track-scale" aria-hidden="true">
            {milestones.map((milestone) => (
              <span key={milestone.level} style={{ left: `${trackPercent(milestone.level)}%` }}>{milestone.level}</span>
            ))}
          </div>
          <div className="track-bar">
            <span className="track-fill track-pass" style={{ width: `${trackPercent(possibleLevelsWithPass)}%` }} />
            <span className="track-fill track-free" style={{ width: `${trackPercent(possibleLevelsAllTasks)}%` }} />
            <span className="track-fill track-earned" style={{ width: `${trackPercent(currentLevel)}%` }} />
            {milestones.map((milestone) => (
              <span key={milestone.level} className={`track-pin pin-${milestone.status}`} style={{ left: `${trackPercent(milestone.level)}%` }} />
            ))}
          </div>
          <div className="track-legend">
            <span className="legend-earned">Earned {currentLevel.toFixed(1)}</span>
            <span className="legend-free">Projected {possibleLevelsAllTasks}</span>
            <span className="legend-pass">With Improved Pass {possibleLevelsWithPass.toFixed(1)}</span>
          </div>
          {nextMilestone && (
            <p className="track-next">
              <strong>Next up · level {nextMilestone.level}, {nextMilestone.label.toLowerCase()}</strong>
              {nextMilestone.status === "onTrack"
                ? " — on track with everything you can do for free."
                : nextMilestone.status === "withPass"
                ? ` — ${nextMilestone.gap.toFixed(1)} levels short for free, but the Improved Pass covers it.`
                : ` — ${nextMilestone.gap.toFixed(1)} levels short, even with the Improved Pass.`}
            </p>
          )}
        </section>

        <section className="result-grid" aria-label="Battlepass result">
          <div className="result-panel">
            <div className="panel-topline">
              <p className="section-label">Best case scenario</p>
              <span className="result-tag">LOGINS + DAILY + SPECIAL</span>
            </div>
            <div className="result-number">{possibleLevelsAllTasks}<span> lvl</span></div>
            <p className="result-description">Projected level from remaining logins, daily tasks and the special tasks you have available.</p>
            <div className="special-task-note"><span>{availableSpecialTasks} special tasks available</span><strong>+{futureSpecialTaskPoints} PP possible</strong></div>
            <div className="result-progress"><span style={{ width: `${Math.min((possibleLevelsAllTasks / battlepassRules.maxLevel) * 100, 100)}%` }} /></div>
            <div className="result-footer"><span>Current level {bpLevel}</span><strong>{daysRemaining} days left</strong></div>
          </div>
          <div className="milestone-panel">
            <div className="panel-topline">
              <p className="section-label">Season milestones</p>
              <span className="input-hint">Pick a target</span>
            </div>
            <ul className="milestone-list">
              {milestones.map((milestone) => (
                <li key={milestone.level}>
                  <button
                    type="button"
                    className={`milestone-row status-${milestone.status}${milestone.level === targetLevel ? " is-target" : ""}`}
                    aria-pressed={milestone.level === targetLevel}
                    onClick={() => setPickedTarget(milestone.level)}
                  >
                    <span className="milestone-level">{milestone.level}</span>
                    <span className="milestone-label">{milestone.label}</span>
                    <span className="milestone-status">
                      {milestone.status === "short"
                        ? `${milestone.gap.toFixed(1)} short`
                        : milestoneStatusLabel[milestone.status]}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            {milestones.find((milestone) => milestone.note) && (
              <p className="milestone-note">{milestones.find((milestone) => milestone.note)?.note}</p>
            )}
          </div>
        </section>

        <section className={`tempo-zone tempo-${tempoState}`} aria-labelledby="tempo-heading">
          <div className="zone-heading compact-heading">
            <div>
              <div>
                <p className="section-label">Reward gap</p>
                <h2 id="tempo-heading">Level {targetLevel} tempo</h2>
              </div>
            </div>
            <span className="input-hint">{pickedTarget === null ? "Next milestone" : <button className="text-button muted-button" type="button" onClick={() => setPickedTarget(null)}>Back to next milestone</button>}</span>
          </div>
          <div className="tempo-layout">
            <div className="tempo-gap">
              {targetMargin < 0 ? (
                <>
                  <strong>{Math.abs(targetMargin).toFixed(1)}</strong>
                  <span>levels short at season end, doing everything you can for free</span>
                </>
              ) : (
                <>
                  <strong>+{targetMargin.toFixed(1)}</strong>
                  <span>levels of margin over level {targetLevel} at season end</span>
                </>
              )}
              <small>{levelsToTarget > 0 ? `${levelsToTarget.toFixed(1)} levels to climb from here` : "Already past this milestone"}</small>
            </div>
            <div className="tempo-meter">
              {tempoState === "reached" ? (
                <p className="tempo-message">Level {targetLevel} is already behind you — nothing left to grind for it.</p>
              ) : tempoState === "logins" ? (
                <p className="tempo-message">Daily logins alone carry you past level {targetLevel}. Tasks are optional from here.</p>
              ) : daysRemaining === 0 ? (
                <p className="tempo-message">The season is over, so there is no tempo left to set.</p>
              ) : (
                <>
                  <div className="tempo-figure">
                    <strong>{requiredPointsPerDay.toFixed(1)}</strong>
                    <span>PP per day needed from tasks, for {daysRemaining} days</span>
                  </div>
                  <div className="tempo-track">
                    <span className="tempo-fill" style={{ width: `${tempoFillWidth}%` }} />
                    {specialPointsPerDay > 0 && <span className="tempo-marker" style={{ left: `${tempoMarkerLeft}%` }} />}
                  </div>
                  <div className="tempo-scale">
                    <span>0</span>
                    <span>{specialPointsPerDay > 0 ? `${dailyTaskCeiling} daily + ${specialPointsPerDay.toFixed(1)} special = ${maxPointsPerDay.toFixed(1)} PP/day ceiling` : `${maxPointsPerDay.toFixed(1)} PP/day ceiling`}</span>
                  </div>
                  <p className="tempo-message">{tempoMessage}</p>
                </>
              )}
            </div>
          </div>
          {levelsToBuy > 0 && (
            <div className="buyout">
              <div className="buyout-head">
                <p className="section-label">Closing the gap with Golden Eagles</p>
                <span>{levelsToBuy} {levelsToBuy === 1 ? "level" : "levels"} to buy</span>
              </div>
              <div className="buyout-options">
                <div className={`buyout-option${cheaperWithPass ? "" : " is-cheaper"}`}>
                  <span>Levels only</span>
                  <strong>{buyDirectCost.toLocaleString("en-US")} GE</strong>
                  <small>{levelsToBuy} bought levels</small>
                </div>
                <div className={`buyout-option${cheaperWithPass ? " is-cheaper" : ""}`}>
                  <span>Improved Pass {levelsAfterPass > 0 ? "+ levels" : "only"}</span>
                  <strong>{buyWithPassCost.toLocaleString("en-US")} GE</strong>
                  <small>{battlepassRules.premiumCost} GE for {passLevels} levels{levelsAfterPass > 0 ? ` + ${levelsAfterPass} bought` : ""}</small>
                </div>
              </div>
              <p className="buyout-note">Buying levels requires owning a Battle Pass, and the price climbs from {battlepassRules.levelPriceTiers[0].price} to {battlepassRules.levelPriceTiers[battlepassRules.levelPriceTiers.length - 1].price} GE per level as you buy more. The Improved Pass counts as {passLevels} bought levels, so anything on top of it starts at the higher rate.</p>
            </div>
          )}
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
              <div className="breakdown-source breakdown-logins"><i /> <span>Logins</span><strong>{loginPoints} pts</strong></div>
              <div className="breakdown-source breakdown-challenges"><i /> <span>Challenges</span><strong>{challengePoints} pts</strong></div>
              <div className="breakdown-source breakdown-tasks"><i /> <span>Daily and special tasks</span><strong>{otherPoints} pts</strong></div>
              <div className="breakdown-total"><span>Total progress</span><strong>{totalPoints} pts</strong></div>
            </div>
            <div className="progress-track">
              <div className="current-progress" style={{ width: `${currentProgress}%` }}>
                <span className="progress-segment progress-logins" data-tooltip={`${loginPoints} PP / ${(loginPoints / 10).toFixed(1)} levels`} style={{ width: `${loginProgress}%` }} />
                <span className="progress-segment progress-challenges" data-tooltip={`${challengePoints} PP / ${(challengePoints / 10).toFixed(1)} levels`} style={{ width: `${challengeProgress}%` }} />
                <span className="progress-segment progress-tasks" data-tooltip={`${otherPoints} PP / ${(otherPoints / 10).toFixed(1)} levels`} style={{ width: `${taskProgress}%` }} />
              </div>
            </div>
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
