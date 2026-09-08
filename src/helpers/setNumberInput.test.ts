import { expect, test } from "vitest";
import { setNumberInput } from "./setNumberInput";

const readValue = (value: string, min = 0, max = 100) => {
  let result = -1;
  setNumberInput((nextValue) => {
    result = nextValue;
  }, value, min, max);
  return result;
};

test("numeric input is truncated and clamped to the allowed range", () => {
  expect(readValue("12.8", 0, 20)).toBe(12);
  expect(readValue("-4", 0, 20)).toBe(0);
  expect(readValue("999", 0, 20)).toBe(20);
});

test("invalid numeric input falls back to the minimum", () => {
  expect(readValue("not-a-number", 0, 20)).toBe(0);
});