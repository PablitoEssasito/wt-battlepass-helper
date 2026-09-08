import { expect, test } from "vitest";
import { pointsFromChallenges } from "./pointsFromChallenges";

test("challenge points without completion bonus", () => {
  expect(pointsFromChallenges(13)).toBe(390);
});

test("challenge points include the completion bonus", () => {
  expect(pointsFromChallenges(14)).toBe(465);
});

test("challenge points keep the bonus when input exceeds the seasonal pool", () => {
  expect(pointsFromChallenges(15)).toBe(465);
});
