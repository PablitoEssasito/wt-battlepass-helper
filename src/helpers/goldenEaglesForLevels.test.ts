import { expect, test } from "vitest";
import { goldenEaglesForLevels } from "./goldenEaglesForLevels";

test("the first fifteen levels sit in the cheapest tier", () => {
  expect(goldenEaglesForLevels(1)).toBe(75);
  expect(goldenEaglesForLevels(15)).toBe(15 * 75);
});

test("the price climbs through every tier", () => {
  // 15x75 + 10x125 + 10x175 + 1x250
  expect(goldenEaglesForLevels(36)).toBe(1125 + 1250 + 1750 + 250);
});

test("levels already bought push the next ones into a higher tier", () => {
  expect(goldenEaglesForLevels(1, 15)).toBe(125);
  expect(goldenEaglesForLevels(1, 25)).toBe(175);
  expect(goldenEaglesForLevels(1, 40)).toBe(250);
});

test("buying nothing costs nothing", () => {
  expect(goldenEaglesForLevels(0)).toBe(0);
  expect(goldenEaglesForLevels(-5)).toBe(0);
});

test("fractional gaps round up to whole levels", () => {
  expect(goldenEaglesForLevels(2.1)).toBe(3 * 75);
});
