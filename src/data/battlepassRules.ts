import { loginBrackets } from "./loginBrackets";

export const battlepassRules = {
  totalDays: 91,
  maxLevel: 150,
  loginBrackets,
  easyTaskPoints: 2,
  mediumTaskPoints: 3,
  specialTaskPoints: 5,
  maxSpecialTasks: 91,
  challengePoints: 30,
  challengeBonusAfter: 14,
  challengeBonusPoints: 45,
  premiumPoints: 150,
  battlePassCost: 2000,
  // Includes the Battle Pass itself, so the 15 levels effectively cost 500 GE.
  improvedPassCost: 2500,
  // Price per bought level rises with how many you have already bought this season.
  levelPriceTiers: [
    { boughtBelow: 15, price: 75 },
    { boughtBelow: 25, price: 125 },
    { boughtBelow: 35, price: 175 },
    { boughtBelow: Infinity, price: 250 },
  ],
} as const;
