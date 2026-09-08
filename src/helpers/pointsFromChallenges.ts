import { battlepassRules } from "../data/battlepassRules";

export const pointsFromChallenges = (challengeCount: number) => {
  const completedChallenges = Math.min(
    Math.max(challengeCount, 0),
    battlepassRules.challengeBonusAfter
  );
  const basePoints = completedChallenges * battlepassRules.challengePoints;
  const bonusPoints =
    completedChallenges === battlepassRules.challengeBonusAfter
      ? battlepassRules.challengeBonusPoints
      : 0;

  return basePoints + bonusPoints;
};
