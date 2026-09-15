import { battlepassRules } from "../data/battlepassRules";

export const goldenEaglesForLevels = (levels: number, alreadyBought = 0) => {
  const tiers = battlepassRules.levelPriceTiers;
  const wanted = Math.min(
    Math.max(Math.ceil(levels), 0),
    battlepassRules.maxLevel
  );

  let cost = 0;
  for (let index = 0; index < wanted; index += 1) {
    const bought = alreadyBought + index;
    const tier =
      tiers.find((candidate) => bought < candidate.boughtBelow) ??
      tiers[tiers.length - 1];
    cost += tier.price;
  }

  return cost;
};
