import { battlepassRules } from "../data/battlepassRules";
import { SeasonMilestone, seasonMilestones } from "../data/seasonMilestones";
import { goldenEaglesForLevels } from "./goldenEaglesForLevels";
import { pointsFromChallenges } from "./pointsFromChallenges";
import { pointsFromLogins } from "./pointsFromLogins";

export type MilestoneStatus = "reached" | "onTrack" | "withPass" | "short";

export type TempoState =
  | "reached"
  | "logins"
  | "comfortable"
  | "tight"
  | "impossible";

export interface MilestoneProjection extends SeasonMilestone {
  status: MilestoneStatus;
  gap: number;
}

/** The three projections a level is judged against. */
export interface LevelOutlook {
  currentLevel: number;
  possibleLevelsAllTasks: number;
  possibleLevelsWithPass: number;
}

export const projectLevel = (level: number, outlook: LevelOutlook) => ({
  status: (outlook.currentLevel >= level
    ? "reached"
    : outlook.possibleLevelsAllTasks >= level
    ? "onTrack"
    : outlook.possibleLevelsWithPass >= level
    ? "withPass"
    : "short") as MilestoneStatus,
  gap: Math.max(level - outlook.possibleLevelsAllTasks, 0),
});

/** Which pass the player already owns, which decides how levels can be bought. */
export type PassOwned = "none" | "battle" | "improved";

export interface ForecastInput {
  bpLevel: number;
  levelProgress: number;
  loginCount: number;
  challengeCount: number;
  availableSpecialTasks: number;
  daysRemaining: number;
  passOwned?: PassOwned;
  /** Defaults to the milestone flagged primary — the level most players aim for. */
  targetLevel?: number;
}

const toLevels = (points: number) => Math.round(points) / 10;

export const buildForecast = ({
  bpLevel,
  levelProgress,
  loginCount,
  challengeCount,
  availableSpecialTasks,
  daysRemaining,
  targetLevel,
  passOwned = "none",
}: ForecastInput) => {
  const totalPoints = bpLevel * 10 + levelProgress;
  const currentLevel = totalPoints / 10;
  const loginPoints = pointsFromLogins(loginCount);
  const challengePoints = pointsFromChallenges(challengeCount);
  // An owned Improved Pass put 15 levels into the entered level; they are not grind.
  const passPoints =
    passOwned === "improved" ? battlepassRules.premiumPoints : 0;
  const accountedPoints = loginPoints + challengePoints + passPoints;
  const otherPoints = Math.max(totalPoints - accountedPoints, 0);

  const easyPoints = daysRemaining * battlepassRules.easyTaskPoints;
  const mediumPoints = daysRemaining * battlepassRules.mediumTaskPoints;
  // Special tasks have no daily limit, so the whole pool can be cleared in the time left.
  const futureSpecialTaskPoints =
    (daysRemaining > 0 ? Math.max(availableSpecialTasks, 0) : 0) *
    battlepassRules.specialTaskPoints;

  const remainingLoginSlots = Math.max(
    Math.min(daysRemaining, battlepassRules.totalDays - loginCount),
    0
  );
  const futureLoginPoints =
    pointsFromLogins(loginCount + remainingLoginSlots) - loginPoints;

  const withLogins = totalPoints + futureLoginPoints;
  const withEasy = withLogins + easyPoints;
  const withMedium = withEasy + mediumPoints;

  const possibleLevelsLogins = toLevels(withLogins);
  const possibleLevelsEasy = toLevels(withEasy);
  const possibleLevelsMedium = toLevels(withMedium);
  // A full season of grinding is worth more than the pass has levels to give.
  const uncappedProjection = toLevels(withMedium + futureSpecialTaskPoints);
  const possibleLevelsAllTasks = Math.min(
    uncappedProjection,
    battlepassRules.maxLevel
  );
  const levelsLostToCap =
    Math.round((uncappedProjection - possibleLevelsAllTasks) * 10) / 10;

  // Only a player without a pass can still gain these levels: an Improved Pass owner
  // already has them inside the level they entered, and a Battle Pass owner cannot add it.
  const buyablePassLevels =
    passOwned === "none" ? battlepassRules.premiumPoints / 10 : 0;
  const possibleLevelsWithPass = Math.min(
    possibleLevelsAllTasks + buyablePassLevels,
    battlepassRules.maxLevel
  );
  // Zero once the pass is owned, unavailable, or its levels fall past the cap.
  const improvedPassGain = possibleLevelsWithPass - possibleLevelsAllTasks;

  // What each step adds on top of the one before it, ending on the projected level.
  const contributions = {
    current: currentLevel,
    logins: toLevels(futureLoginPoints),
    easy: toLevels(easyPoints),
    medium: toLevels(mediumPoints),
    special: toLevels(futureSpecialTaskPoints),
  };

  const outlook: LevelOutlook = {
    currentLevel,
    possibleLevelsAllTasks,
    possibleLevelsWithPass,
  };
  const milestones: MilestoneProjection[] = seasonMilestones.map(
    (milestone) => ({ ...milestone, ...projectLevel(milestone.level, outlook) })
  );
  const nextMilestone =
    milestones.find((milestone) => milestone.status !== "reached") ?? null;

  const hasInputConflict = totalPoints < accountedPoints;

  const target =
    targetLevel ??
    seasonMilestones.find((milestone) => milestone.primary)?.level ??
    nextMilestone?.level ??
    battlepassRules.maxLevel;
  const levelsToTarget = Math.max(target - currentLevel, 0);
  const targetMargin = possibleLevelsAllTasks - target;

  // Logins arrive on their own, so the tempo only covers what the player has to play for.
  const taskPointsNeeded = target * 10 - totalPoints - futureLoginPoints;
  const dailyTaskCeiling =
    battlepassRules.easyTaskPoints + battlepassRules.mediumTaskPoints;
  const specialPointsPerDay =
    daysRemaining > 0 ? futureSpecialTaskPoints / daysRemaining : 0;
  const maxPointsPerDay = dailyTaskCeiling + specialPointsPerDay;
  const requiredPointsPerDay =
    daysRemaining > 0 ? Math.max(taskPointsNeeded, 0) / daysRemaining : 0;

  const tempoState: TempoState =
    levelsToTarget === 0
      ? "reached"
      : taskPointsNeeded <= 0
      ? "logins"
      : daysRemaining === 0
      ? "impossible"
      : requiredPointsPerDay <= dailyTaskCeiling
      ? "comfortable"
      : requiredPointsPerDay <= maxPointsPerDay
      ? "tight"
      : "impossible";

  // What it costs to buy the levels the grind will not reach.
  const passLevels = battlepassRules.premiumPoints / 10;
  const levelsToBuy = Math.max(Math.ceil(-targetMargin), 0);
  // Owning the Improved Pass counts as 15 bought levels, so the next one costs more.
  const boughtBefore = passOwned === "improved" ? passLevels : 0;
  const manualCost = goldenEaglesForLevels(levelsToBuy, boughtBefore);
  const levelsAfterPass = Math.max(levelsToBuy - passLevels, 0);
  const withBattlePassCost = battlepassRules.battlePassCost + manualCost;
  const withImprovedCost =
    battlepassRules.improvedPassCost +
    goldenEaglesForLevels(levelsAfterPass, passLevels);
  const cheaperWithImproved = withImprovedCost < withBattlePassCost;

  return {
    passOwned,
    passLevels,
    levelsToBuy,
    levelsAfterPass,
    manualCost,
    withBattlePassCost,
    withImprovedCost,
    cheaperWithImproved,
    totalPoints,
    currentLevel,
    loginPoints,
    challengePoints,
    passPoints,
    otherPoints,
    futureSpecialTaskPoints,
    possibleLevelsLogins,
    possibleLevelsEasy,
    possibleLevelsMedium,
    possibleLevelsAllTasks,
    possibleLevelsWithPass,
    outlook,
    improvedPassGain,
    levelsLostToCap,
    contributions,
    milestones,
    nextMilestone,
    hasInputConflict,
    targetLevel: target,
    levelsToTarget,
    targetMargin,
    requiredPointsPerDay,
    dailyTaskCeiling,
    specialPointsPerDay,
    maxPointsPerDay,
    tempoState,
  };
};
