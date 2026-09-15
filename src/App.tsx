import { useState } from "react";
import dayjs from "dayjs";

import "./App.css";
import NumberInput from "./components/NumberInput";
import DateInput from "./components/DateInput";
import ChangelogDialog from "./components/ChangelogDialog";
import PointValuesDialog from "./components/PointValuesDialog";
import { buildForecast, PassOwned } from "./helpers/forecast";
import { battlepassRules } from "./data/battlepassRules";
import { season } from "./data/season";

function App() {
  const originalLastDay = dayjs(season.endDate);
  const [bpLevel, setBpLevel] = useState(0);
  const [levelProgress, setLevelProgress] = useState(0);
  const [loginCount, setLoginCount] = useState(0);
  const [challengeCount, setChallengeCount] = useState(0);
  const [availableSpecialTasks, setAvailableSpecialTasks] = useState(0);
  const [lastDayOverride, setLastDayOverride] = useState(originalLastDay.format("YYYY-MM-DD"));
  const [lastDay, setLastDay] = useState(originalLastDay);
  const [pickedTarget, setPickedTarget] = useState<number | null>(null);
  const [passOwned, setPassOwned] = useState<PassOwned>("none");

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
    possibleLevelsAllTasks,
    possibleLevelsWithPass,
    contributions,
    milestones,
    nextMilestone,
    hasInputConflict,
    passLevels,
    levelsToBuy,
    levelsAfterPass,
    manualCost,
    withBattlePassCost,
    withImprovedCost,
    cheaperWithImproved,
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
    passOwned,
  });
  const passOptions: { id: PassOwned; label: string }[] = [
    { id: "none", label: "Nothing yet" },
    { id: "battle", label: "Battle Pass" },
    { id: "improved", label: "Improved Pass" },
  ];
  const ge = (amount: number) => `${amount.toLocaleString("en-US")} GE`;
  const buyoutNote =
    passOwned === "none"
      ? "Levels can only be bought once you own a pass, so both routes include one."
      : passOwned === "improved"
      ? `Its ${passLevels} levels are already part of the level you entered. They also count as bought levels, so anything further starts at a higher rate.`
      : "The Improved Pass cannot be added once you own the Battle Pass, so the levels have to be bought one at a time.";
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
  const milestoneNote = milestones.find((milestone) => milestone.note)?.note;
  const waterfall = [
    { label: "Logins only", value: contributions.logins, lead: true },
    { label: "+ easy tasks", value: contributions.easy },
    { label: "+ medium tasks", value: contributions.medium },
    { label: "+ special pool", value: contributions.special },
  ];

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
            <p className="brand-subtitle">Season {season.number} · {season.name}</p>
          </div>
        </div>
        <dl className="header-stats">
          <div>
            <dt>Ends</dt>
            <dd>{lastDay.format("DD/MM/YYYY")}</dd>
          </div>
          <div>
            <dt>Remaining</dt>
            <dd>{daysRemaining} {daysRemaining === 1 ? "day" : "days"}</dd>
          </div>
        </dl>
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
              <small className="known-deadline">Official: {originalLastDay.format("DD/MM/YYYY")}</small>
            </div>
          </div>
          {hasInputConflict && <p className="input-warning">Current progress is lower than the points implied by your logins and challenges. Check the values before relying on the forecast.</p>}
        </section>

        <section className="finish-zone" aria-labelledby="finish-heading">
          <div className="zone-heading compact-heading">
            <div>
              <div>
                <p className="section-label">Projected finish</p>
                <h2 id="finish-heading">Where the season ends</h2>
              </div>
            </div>
          </div>
          <div className="finish-figure">
            <strong>{possibleLevelsAllTasks.toFixed(1)}</strong>
            <span>lvl</span>
            <em>
              {currentLevel.toFixed(1)} now <i>&rarr;</i> {possibleLevelsWithPass.toFixed(1)} with Improved Pass
            </em>
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
            <span className="legend-earned">Earned</span>
            <span className="legend-free">Projected</span>
            <span className="legend-pass">With Improved Pass</span>
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

        <section className="panel-grid" aria-label="Milestones and tempo">
          <div className="tile milestone-panel">
            <div className="panel-head">
              <h3>Season milestones</h3>
              <span>Pick a target</span>
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
            {milestoneNote && <p className="milestone-note">{milestoneNote}</p>}
          </div>

          <div className={`tile tempo-panel tempo-${tempoState}`}>
            <div className="panel-head">
              <h3>Level {targetLevel} tempo</h3>
              <span>
                {pickedTarget === null ? (
                  "Default target"
                ) : (
                  <button className="text-button muted-button" type="button" onClick={() => setPickedTarget(null)}>Back to default</button>
                )}
              </span>
            </div>
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
                  <span>PP per day needed from tasks</span>
                </div>
                <div className="tempo-track">
                  <span className="tempo-fill" style={{ width: `${tempoFillWidth}%` }} />
                  {specialPointsPerDay > 0 && <span className="tempo-marker" style={{ left: `${tempoMarkerLeft}%` }} />}
                </div>
                <div className="tempo-scale">
                  <span>0</span>
                  <span>{specialPointsPerDay > 0 ? `${dailyTaskCeiling} daily + ${specialPointsPerDay.toFixed(1)} special = ${maxPointsPerDay.toFixed(1)} ceiling` : `${maxPointsPerDay.toFixed(1)} PP/day ceiling`}</span>
                </div>
                <p className="tempo-message">{tempoMessage}</p>
              </>
            )}
            {levelsToBuy > 0 && (
              <div className="buyout">
                <div className="buyout-head">
                  <h4>Closing the gap with Golden Eagles</h4>
                  <span>{levelsToBuy} {levelsToBuy === 1 ? "level" : "levels"} to buy</span>
                </div>
                <div className="pass-picker" role="group" aria-label="Pass you already own">
                  <span>I own</span>
                  {passOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      className={option.id === passOwned ? "is-owned" : ""}
                      aria-pressed={option.id === passOwned}
                      onClick={() => setPassOwned(option.id)}
                    >
                      {option.label}
                    </button>
                  ))}
                </div>
                {passOwned === "none" ? (
                  <div className="buyout-options">
                    <div className={`buyout-option${cheaperWithImproved ? "" : " is-cheaper"}`}>
                      <span>Battle Pass + levels</span>
                      <strong>{ge(withBattlePassCost)}</strong>
                      <small>{ge(battlepassRules.battlePassCost)} pass + {levelsToBuy} bought levels</small>
                    </div>
                    <div className={`buyout-option${cheaperWithImproved ? " is-cheaper" : ""}`}>
                      <span>Improved Pass {levelsAfterPass > 0 ? "+ levels" : "only"}</span>
                      <strong>{ge(withImprovedCost)}</strong>
                      <small>{ge(battlepassRules.improvedPassCost)} pass, {passLevels} levels included{levelsAfterPass > 0 ? ` + ${levelsAfterPass} bought` : ""}</small>
                    </div>
                  </div>
                ) : (
                  <div className="buyout-options buyout-single">
                    <div className="buyout-option">
                      <span>Levels only</span>
                      <strong>{ge(manualCost)}</strong>
                      <small>{levelsToBuy} bought levels{passOwned === "improved" ? `, priced from number ${passLevels + 1}` : ""}</small>
                    </div>
                  </div>
                )}
                <p className="buyout-note">{buyoutNote}</p>
              </div>
            )}
          </div>
        </section>

        <section className="panel-grid" aria-label="Point sources">
          <div className="tile">
            <div className="panel-head">
              <h3>What gets you there</h3>
              <span>{daysRemaining} days of effort</span>
            </div>
            <dl className="waterfall">
              {waterfall.map((row) => (
                <div key={row.label}>
                  <dt>{row.label}</dt>
                  <dd>{row.lead ? row.value.toFixed(1) : `+${row.value.toFixed(1)}`}</dd>
                </div>
              ))}
              <div className="waterfall-total">
                <dt>Projected finish</dt>
                <dd>{possibleLevelsAllTasks.toFixed(1)}</dd>
              </div>
            </dl>
          </div>

          <div className="tile">
            <div className="panel-head">
              <h3>Progress breakdown</h3>
              <span>{totalPoints} pts so far</span>
            </div>
            <div className="breakdown-list">
              <div className="breakdown-source breakdown-logins"><i /> <span>Logins</span><strong>{loginPoints} pts</strong></div>
              <div className="breakdown-source breakdown-challenges"><i /> <span>Challenges</span><strong>{challengePoints} pts</strong></div>
              <div className="breakdown-source breakdown-tasks"><i /> <span>Daily and special tasks</span><strong>{otherPoints} pts</strong></div>
            </div>
            <div className="progress-track">
              <div className="current-progress" style={{ width: `${currentProgress}%` }}>
                <span className="progress-segment progress-logins" data-tooltip={`${loginPoints} PP / ${(loginPoints / 10).toFixed(1)} levels`} style={{ width: `${loginProgress}%` }} />
                <span className="progress-segment progress-challenges" data-tooltip={`${challengePoints} PP / ${(challengePoints / 10).toFixed(1)} levels`} style={{ width: `${challengeProgress}%` }} />
                <span className="progress-segment progress-tasks" data-tooltip={`${otherPoints} PP / ${(otherPoints / 10).toFixed(1)} levels`} style={{ width: `${taskProgress}%` }} />
              </div>
            </div>
          </div>
        </section>
      </main>

      <footer className="site-footer">
        <p className="footer-credit">
          Based on the <a href="https://github.com/Gardnem6/wt-passhelper" target="_blank" rel="noreferrer">original tool by Gardnem6</a>
        </p>
        <nav className="footer-meta">
          <PointValuesDialog />
          <ChangelogDialog />
          <span className="footer-version">v{APP_VERSION}</span>
          <a href="https://github.com/PablitoEssasito/wt-battlepass-helper" target="_blank" rel="noreferrer">Source on GitHub</a>
        </nav>
      </footer>
    </div>
  );
}

export default App;
