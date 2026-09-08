import { battlepassRules } from "../data/battlepassRules";

export const pointsFromLogins = (loginCount: number) => {
  const completedLogins = Math.min(
    Math.max(loginCount, 0),
    battlepassRules.totalDays
  );
  let loginPoints = 0;
  battlepassRules.loginBrackets.forEach((bracketLastDay, index) => {
    if (completedLogins === 0) return 0;
    const pointValue = index + 1;

    // for first bracket, either we add 21,
    // or the logincount is less than 21 and we add that and stop
    if (pointValue === 1) {
      loginPoints += Math.min(completedLogins, bracketLastDay);

      // if the logincount is greater than the previous last day,
      // add points for each day since the last bracket ended.
    } else if (
      completedLogins > battlepassRules.loginBrackets[index - 1]
    ) {
      loginPoints +=
        (Math.min(completedLogins, bracketLastDay) -
          battlepassRules.loginBrackets[index - 1]) *
        pointValue;
    }
  });

  return loginPoints;
};
