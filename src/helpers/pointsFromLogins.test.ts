import { expect, test } from 'vitest'
import { pointsFromLogins } from "./pointsFromLogins";

test('points available from 0 logins', () => {
    expect(pointsFromLogins(0)).toBe(0);
});

test('points available from 22 logins', () => {
    expect(pointsFromLogins(22)).toBe(23);
});

test('points available from 87 logins', () => {
    expect(pointsFromLogins(87)).toBe(232);
});

test('max points available from logins', () => {
    expect(pointsFromLogins(91)).toBe(252);
});

test('login points never exceed the 91-day season', () => {
    expect(pointsFromLogins(100)).toBe(252);
});

test('negative login counts produce no points', () => {
    expect(pointsFromLogins(-1)).toBe(0);
});