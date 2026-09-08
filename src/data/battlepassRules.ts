import { loginBrackets } from "./loginBrackets";

export const battlepassRules = {
  totalDays: 91,
  loginBrackets,
  easyTaskPoints: 2,
  mediumTaskPoints: 3,
  specialTaskPoints: 5,
  maxSpecialTasks: 91,
  challengePoints: 30,
  challengeBonusAfter: 14,
  challengeBonusPoints: 45,
  premiumPoints: 150,
} as const;
