import { create } from 'zustand';
import type { GameState, Team, TeamScore, RoundScore } from '../types/game';

const calculateRoundScore = (round: RoundScore, meldedPoints: number): number => {
  const bookPoints = 
    round.books.red * 500 +
    round.books.black * 300 +
    round.books.sevens * 5000 +
    round.books.fives * 3000 +
    round.books.wilds * 2500;

  const penaltyPoints = 
    (round.penalties.blackThrees * -100) +
    (round.penalties.redThrees * -500) +
    round.penalties.remainingCards;

  const bonusPoints = 
    (round.bonuses.goingOut ? 100 : 0) +
    (round.bonuses.redThrees * 100) +
    (round.bonuses.redThrees >= 7 ? 300 : 0);

  return bookPoints + meldedPoints + penaltyPoints + bonusPoints;
};

const initialRoundScore = (): RoundScore => ({
  books: { red: 0, black: 0, sevens: 0, fives: 0, wilds: 0 },
  meldedCards: 0,
  penalties: {
    blackThrees: 0,
    redThrees: 0,
    remainingCards: 0,
  },
  bonuses: {
    goingOut: false,
    redThrees: 0,
  },
  totalScore: 0,
});

const useGameStore = create<GameState>((set) => ({
  teams: [
    { id: 1, name: 'Team 1', players: [] },
    { id: 2, name: 'Team 2', players: [] }
  ],
  currentRound: 1,
  scores: [
    { teamId: 1, rounds: Array(4).fill(initialRoundScore()), totalScore: 0 },
    { teamId: 2, rounds: Array(4).fill(initialRoundScore()), totalScore: 0 }
  ],
  meldRequirements: [50, 90, 120, 150],
  completedRounds: new Set<string>(),
}));

export const updateTeamName = (teamId: number, name: string) =>
  useGameStore.setState((state) => ({
    teams: state.teams.map((team) =>
      team.id === teamId ? { ...team, name } : team
    ),
  }));

export const addCompletedRound = (teamId: number, roundIndex: number) =>
  useGameStore.setState((state) => ({
    completedRounds: new Set([...state.completedRounds, `${teamId}-${roundIndex}`])
  }));

export const updateRoundScore = (teamId: number, roundIndex: number, score: RoundScore, meldedPoints: number) =>
  useGameStore.setState((state) => {
    const newScores = state.scores.map((teamScore) => {
      if (teamScore.teamId === teamId) {
        const newRounds = [...teamScore.rounds];
        newRounds[roundIndex] = {
          ...score,
          totalScore: calculateRoundScore(score, meldedPoints),
        };
        return {
          ...teamScore,
          rounds: newRounds,
          totalScore: newRounds.reduce((sum, round) => sum + round.totalScore, 0),
        };
      }
      return teamScore;
    });

    return { scores: newScores };
  });

export default useGameStore;