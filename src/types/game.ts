export interface Player {
  id: string;
  name: string;
  teamId: number;
}

export interface Team {
  id: number;
  name: string;
  players: Player[];
}

export interface BookScore {
  red: number;
  black: number;
  sevens: number;
  fives: number;
  wilds: number;
}

export interface RoundScore {
  books: BookScore;
  meldedCards: {
    jokers: number;
    acesAndTwos: number;
    eightToKing: number;
    fourToSeven: number;
  };
  penalties: {
    blackThrees: number;
    redThrees: number;
    remainingCards: number;
  };
  bonuses: {
    goingOut: boolean;
    redThrees: number;
  };
  totalScore: number;
}

export interface TeamScore {
  teamId: number;
  rounds: RoundScore[];
  totalScore: number;
}

export interface GameState {
  teams: Team[];
  currentRound: number;
  scores: TeamScore[];
  meldRequirements: number[];
  completedRounds: Set<string>;
}