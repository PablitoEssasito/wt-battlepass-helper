export interface SeasonMilestone {
  level: number;
  label: string;
  note?: string;
}

// Rewards move every season — update this list, not the components.
export const seasonMilestones: SeasonMilestone[] = [
  { level: 51, label: "Premium vehicle" },
  { level: 75, label: "Main season reward" },
  { level: 100, label: "Loading screen" },
  { level: 105, label: "Upgrade coupon 1 of 2" },
  {
    level: 125,
    label: "Upgrade coupon 2 of 2",
    note: "Both coupons together unlock the next Battle Pass for free.",
  },
  { level: 150, label: "Season title" },
];
