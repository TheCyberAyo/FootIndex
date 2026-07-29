import { differenceInYears, parseISO } from "date-fns";

import type { PlayerPosition } from "@/types/database";

export function getPlayerAge(dateOfBirth: string): number {
  return differenceInYears(new Date(), parseISO(dateOfBirth));
}

export function formatPosition(position: PlayerPosition): string {
  switch (position) {
    case "GK":
      return "Goalkeeper";
    case "DF":
      return "Defender";
    case "MF":
      return "Midfielder";
    case "FW":
      return "Forward";
    default:
      return position;
  }
}

export function formatHeight(heightCm: number): string {
  return `${heightCm} cm`;
}

export function formatStat(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) {
    return "—";
  }
  return new Intl.NumberFormat("en-US").format(value);
}

export function formatGoalsPerGame(value: number | null | undefined): string {
  if (value == null || Number.isNaN(value)) {
    return "—";
  }
  return value.toFixed(3);
}
