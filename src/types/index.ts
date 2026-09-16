export type PlayerRole = "All Rounder" | "Batsman" | "Bowler" | "Wicket Keeper";
export type BattingStyle = "RHB" | "LHB";
export type AuctionStatus = "NOT_STARTED" | "CURRENT" | "SOLD" | "UNSOLD";
export type SessionStatus = "SETUP" | "LIVE" | "PAUSED" | "COMPLETED";
export type AuctionEventType =
  | "PLAYER_STARTED"
  | "BID"
  | "SOLD"
  | "UNSOLD"
  | "BUDGET_UPDATED"
  | "AUCTION_RESET";

export interface IPlayerStatistics {
  statsPlayerId: number;
  seasonId: number | null;
  playerOfTheMatch: number | null;
  bestBowler: number | null;
  bestBatter: number | null;
  matches: number | null;
  battingInnings: number | null;
  runs: number | null;
  hs: string | null;
  hsRuns: number | null;
  hsNotOut: boolean;
  avg: number | null;
  sr: number | null;
  s30: number | null;
  s50: number | null;
  s100: number | null;
  s4: number | null;
  s6: number | null;
  ducks: number | null;
  bowlingInnings: number | null;
  overs: number | null;
  wickets: number | null;
  bestBowling: string | null;
  w3: number | null;
  w5: number | null;
  maidens: number | null;
  economy: number | null;
}

export interface IPlayer {
  _id?: string;
  id: number;
  name: string;
  role: PlayerRole;
  battingStyle: BattingStyle;
  bowlingStyle: string | null;
  basePrice: number;
  soldPrice: number | null;
  auctionStatus: AuctionStatus;
  teamId: string | null;
  teamName: string | null;
  imageUrl: string | null;
  statistics: IPlayerStatistics;
}

export interface ITeamPlayer {
  playerId: number;
  name: string;
  role: PlayerRole;
  soldPrice: number;
  imageUrl?: string | null;
}

export interface ITeam {
  _id?: string;
  id: string; // "team-a", "team-b", "team-c"
  name: string;
  shortName: string;
  color: string;
  initialBudget: number;
  remainingBudget: number;
  totalSpent: number;
  playerCount: number;
  players: ITeamPlayer[];
}

export interface IBidHistoryItem {
  teamId: string;
  teamName: string;
  amount: number;
  timestamp: string | Date;
}

export interface IAuctionState {
  _id?: string;
  sessionKey: string;
  status: SessionStatus;
  currentPlayerId: number | null;
  currentBid: number;
  currentTeamId: string | null;
  currentTeamName: string | null;
  bidHistory: IBidHistoryItem[];
  updatedAt?: Date;
}

export interface IAuctionEvent {
  _id?: string;
  eventType: AuctionEventType;
  playerId: number | null;
  playerName: string | null;
  teamId: string | null;
  teamName: string | null;
  amount: number | null;
  details?: Record<string, any>;
  timestamp: Date;
}
