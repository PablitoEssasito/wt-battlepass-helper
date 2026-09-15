import { expect, test } from "vitest";
import { battlepassRules } from "../data/battlepassRules";
import { pointsFromChallenges } from "./pointsFromChallenges";
import { pointsFromLogins } from "./pointsFromLogins";

// Special tasks have no cap, so there is no true ceiling — this is the reference
// season the original tool was built around: one special task for every day.
test("a season with one special task a day is worth 1627 points", () => {
  const totalPoints =
    pointsFromLogins(battlepassRules.totalDays) +
    battlepassRules.totalDays * battlepassRules.easyTaskPoints +
    battlepassRules.totalDays * battlepassRules.mediumTaskPoints +
    battlepassRules.totalDays * battlepassRules.specialTaskPoints +
    pointsFromChallenges(battlepassRules.challengeBonusAfter);

  expect(totalPoints).toBe(1627);
});

test("the login bracket table has to end on the last day of the season", () => {
  const lastBracket =
    battlepassRules.loginBrackets[battlepassRules.loginBrackets.length - 1];

  expect(lastBracket).toBe(battlepassRules.totalDays);
});
