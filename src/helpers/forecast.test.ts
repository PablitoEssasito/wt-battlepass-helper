import { expect, test } from "vitest";
import { battlepassRules } from "../data/battlepassRules";
import { buildForecast, ForecastInput } from "./forecast";
import { goldenEaglesForLevels } from "./goldenEaglesForLevels";

const input = (overrides: Partial<ForecastInput> = {}): ForecastInput => ({
  bpLevel: 0,
  levelProgress: 0,
  loginCount: 0,
  challengeCount: 0,
  availableSpecialTasks: 0,
  daysRemaining: 0,
  ...overrides,
});

test("splits current points into logins, challenges and everything else", () => {
  const { totalPoints, loginPoints, challengePoints, otherPoints } =
    buildForecast(input({ bpLevel: 50, levelProgress: 5, loginCount: 21, challengeCount: 3 }));

  expect(totalPoints).toBe(505);
  expect(loginPoints).toBe(21);
  expect(challengePoints).toBe(90);
  expect(otherPoints).toBe(394);
});

test("the Improved Pass never counts towards current points", () => {
  const forecast = buildForecast(input({ bpLevel: 60, daysRemaining: 20, loginCount: 20 }));

  expect(forecast.totalPoints).toBe(600);
  expect(forecast.currentLevel).toBe(60);
  expect(forecast.possibleLevelsWithPass - forecast.possibleLevelsAllTasks).toBeCloseTo(15, 5);
});

test("with no days left every scenario equals the current level", () => {
  const forecast = buildForecast(
    input({ bpLevel: 40, levelProgress: 7, loginCount: 30, availableSpecialTasks: 10 })
  );

  expect(forecast.possibleLevelsLogins).toBe(40.7);
  expect(forecast.possibleLevelsMedium).toBe(40.7);
  expect(forecast.possibleLevelsAllTasks).toBe(40.7);
  expect(forecast.futureSpecialTaskPoints).toBe(0);
});

test("future logins stop at the season login cap", () => {
  const forecast = buildForecast(input({ loginCount: 85, daysRemaining: 30 }));

  expect(forecast.possibleLevelsLogins).toBe(3);
});

test("a full season of logins is worth the documented 252 points", () => {
  const forecast = buildForecast(input({ daysRemaining: battlepassRules.totalDays }));

  expect(forecast.possibleLevelsLogins).toBe(25.2);
});

test("special tasks only move the all-tasks scenario", () => {
  const forecast = buildForecast(
    input({ bpLevel: 50, daysRemaining: 5, availableSpecialTasks: 10 })
  );

  expect(forecast.futureSpecialTaskPoints).toBe(50);
  expect(forecast.possibleLevelsAllTasks - forecast.possibleLevelsMedium).toBeCloseTo(5, 5);
});

test("the contributions add up to the projected level", () => {
  const forecast = buildForecast(
    input({ bpLevel: 62, levelProgress: 4, loginCount: 48, availableSpecialTasks: 6, daysRemaining: 36 })
  );
  const { logins, easy, medium, special } = forecast.contributions;

  expect(logins + easy + medium + special).toBeCloseTo(
    forecast.possibleLevelsAllTasks,
    5
  );
});

test("milestones report every status from reached to out of reach", () => {
  const { milestones } = buildForecast(
    input({ bpLevel: 60, loginCount: 30, daysRemaining: 36, availableSpecialTasks: 20 })
  );
  const status = Object.fromEntries(milestones.map((m) => [m.level, m.status]));

  expect(status[51]).toBe("reached");
  expect(status[75]).toBe("onTrack");
  expect(status[100]).toBe("withPass");
  expect(status[125]).toBe("short");
});

test("a short milestone reports the gap against the free projection", () => {
  const { milestones, possibleLevelsAllTasks } = buildForecast(
    input({ bpLevel: 60, loginCount: 30, daysRemaining: 36, availableSpecialTasks: 20 })
  );
  const level125 = milestones.find((m) => m.level === 125);

  expect(possibleLevelsAllTasks).toBe(97.9);
  expect(level125?.gap).toBeCloseTo(27.1, 5);
});

test("the target defaults to the primary milestone, not the nearest one", () => {
  // Level 51 is the next one ahead, but almost everyone plays towards 75.
  const forecast = buildForecast(input({ bpLevel: 20, loginCount: 30, daysRemaining: 36 }));

  expect(forecast.nextMilestone?.level).toBe(51);
  expect(forecast.targetLevel).toBe(75);
});

test("an explicit target overrides the default", () => {
  const forecast = buildForecast(
    input({ bpLevel: 60, loginCount: 30, daysRemaining: 36, targetLevel: 125 })
  );

  expect(forecast.targetLevel).toBe(125);
  expect(forecast.levelsToTarget).toBe(65);
});

test("tempo excludes logins because they arrive without playing", () => {
  const forecast = buildForecast(
    input({ bpLevel: 50, loginCount: 20, daysRemaining: 35, targetLevel: 75 })
  );

  // 250 PP to level 75, of which 82 arrive from logins, leaving 168 over 35 days.
  expect(forecast.requiredPointsPerDay).toBeCloseTo(4.8, 5);
  expect(forecast.tempoState).toBe("comfortable");
});

test("the special task pool raises the daily ceiling", () => {
  const forecast = buildForecast(
    input({ bpLevel: 45, loginCount: 20, daysRemaining: 35, availableSpecialTasks: 14, targetLevel: 75 })
  );

  expect(forecast.maxPointsPerDay).toBeCloseTo(7, 5);
  expect(forecast.tempoState).toBe("tight");
});

test("tempo is impossible when the target is out of reach at full effort", () => {
  const forecast = buildForecast(
    input({ bpLevel: 20, loginCount: 10, daysRemaining: 10, targetLevel: 75 })
  );

  expect(forecast.tempoState).toBe("impossible");
  expect(forecast.targetMargin).toBeLessThan(0);
});

test("tempo and the projected margin never disagree", () => {
  for (const bpLevel of [10, 30, 45, 50, 60, 74, 80]) {
    const forecast = buildForecast(
      input({ bpLevel, loginCount: 20, daysRemaining: 35, availableSpecialTasks: 6, targetLevel: 75 })
    );

    expect(forecast.tempoState === "impossible").toBe(forecast.targetMargin < 0);
  }
});

test("reaching the target leaves no tempo to set", () => {
  const forecast = buildForecast(
    input({ bpLevel: 75, daysRemaining: 35, targetLevel: 75 })
  );

  expect(forecast.levelsToTarget).toBe(0);
  expect(forecast.tempoState).toBe("reached");
});

test("a reachable target needs no bought levels", () => {
  const forecast = buildForecast(
    input({ bpLevel: 60, loginCount: 30, daysRemaining: 36, targetLevel: 75 })
  );

  expect(forecast.levelsToBuy).toBe(0);
});

test("the buyout rounds the gap up and prices both routes for a player with no pass", () => {
  const forecast = buildForecast(
    input({ bpLevel: 60, loginCount: 30, daysRemaining: 36, availableSpecialTasks: 20, targetLevel: 125 })
  );

  // 27.1 levels short rounds up to 28.
  expect(forecast.levelsToBuy).toBe(28);
  expect(forecast.withBattlePassCost).toBe(2000 + 1125 + 1250 + 3 * 175);
  // The Improved Pass covers the first 15; the other 13 still start at tier two.
  expect(forecast.levelsAfterPass).toBe(13);
  expect(forecast.withImprovedCost).toBe(2500 + 10 * 125 + 3 * 175);
  expect(forecast.cheaperWithImproved).toBe(true);
});

test("owning the Battle Pass rules out the Improved one, leaving manual levels", () => {
  const forecast = buildForecast(
    input({ bpLevel: 60, loginCount: 30, daysRemaining: 36, targetLevel: 125, passOwned: "battle" })
  );

  expect(forecast.manualCost).toBe(goldenEaglesForLevels(forecast.levelsToBuy));
});

test("owning the Improved Pass prices further levels from the sixteenth", () => {
  const owned = buildForecast(
    input({ bpLevel: 60, loginCount: 30, daysRemaining: 36, targetLevel: 125, passOwned: "improved" })
  );
  const plain = buildForecast(
    input({ bpLevel: 60, loginCount: 30, daysRemaining: 36, targetLevel: 125, passOwned: "battle" })
  );

  // Same levels to buy, but the Improved Pass owner has already used up the cheapest tier.
  expect(owned.levelsToBuy).toBe(plain.levelsToBuy);
  expect(owned.manualCost).toBeGreaterThan(plain.manualCost);
  expect(owned.manualCost).toBe(goldenEaglesForLevels(owned.levelsToBuy, 15));
});

test("past fifteen levels the Improved Pass always saves the same 625 GE", () => {
  for (const targetLevel of [100, 105, 125, 150]) {
    const forecast = buildForecast(
      input({ bpLevel: 10, loginCount: 5, daysRemaining: 20, targetLevel })
    );

    expect(forecast.levelsToBuy).toBeGreaterThan(15);
    expect(forecast.withBattlePassCost - forecast.withImprovedCost).toBe(625);
  }
});

test("under seven levels short the plain Battle Pass route is cheaper", () => {
  const upgrade =
    battlepassRules.improvedPassCost - battlepassRules.battlePassCost;

  expect(goldenEaglesForLevels(6)).toBeLessThan(upgrade);
  expect(goldenEaglesForLevels(7)).toBeGreaterThan(upgrade);
});

test("progress below the points implied by logins and challenges is flagged", () => {
  const forecast = buildForecast(input({ bpLevel: 10, loginCount: 91, challengeCount: 14 }));

  expect(forecast.hasInputConflict).toBe(true);
  expect(forecast.otherPoints).toBe(0);
});
