import { expect, test } from "vitest";
import { battlepassRules } from "../data/battlepassRules";
import { pointsFromChallenges } from "./pointsFromChallenges";
import { pointsFromLogins } from "./pointsFromLogins";

test("full free-to-play grind reaches the documented maximum", () => {
  const totalPoints =
    pointsFromLogins(battlepassRules.totalDays) +
    battlepassRules.totalDays * battlepassRules.easyTaskPoints +
    battlepassRules.totalDays * battlepassRules.mediumTaskPoints +
    battlepassRules.maxSpecialTasks * battlepassRules.specialTaskPoints +
    pointsFromChallenges(battlepassRules.challengeBonusAfter);

  expect(totalPoints).toBe(1627);
});