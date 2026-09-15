export interface ChangelogEntry {
  version: string;
  date: string;
  changes: string[];
}

// Newest first.
export const changelog: ChangelogEntry[] = [
  {
    version: "1.1.0",
    date: "2026-09-15",
    changes: [
      "Rebuilt the page around one reading order: where you land, what that unlocks, what it takes to get there.",
      "Merged the best case panel into the projected finish block, so the headline level is stated once instead of twice.",
      "Replaced the forecast table with a breakdown of what each activity contributes, adding up to the projected level — the old table ended on a different number.",
      "Moved point values into a dialog in the header, next to the changelog.",
      "Cut the type scale from 24 improvised sizes to seven and raised the body text.",
      "Fixed the tempo block leaving half a row empty whenever there was no daily quota to show.",
      "Removed the LIVE CALCULATOR indicator.",
    ],
  },
  {
    version: "1.0.0",
    date: "2026-09-15",
    changes: [
      "Added a season track showing earned, projected and Improved Pass levels against every reward milestone.",
      "Added a milestone ladder — pick any of the six reward levels as your target instead of only level 75.",
      "Added a tempo gauge: the points per day you need from tasks, measured against what a day can actually yield.",
      "Added a Golden Eagle estimate for the levels the grind will not reach, comparing bought levels against the Improved Pass.",
      "Removed the Improved Pass toggle — it added its 15 levels a second time on top of the level you enter.",
      "Fixed the day counter dropping the last day of the season, which understated every forecast.",
      "Checked all point values against the War Thunder wiki and covered the forecast with tests.",
    ],
  },
  {
    version: "0.1.0",
    date: "2026-09-08",
    changes: [
      "First standalone release, continuing the original WT Passhelper by Gardnem6.",
    ],
  },
];
