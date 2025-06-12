import assert from 'node:assert';
import { test, beforeEach } from 'node:test';
import useGameStore, { updateRoundScore, updateTeamName, addCompletedRound } from '../build/store/gameStore.js';

const initialRoundScore = () => ({
  books: { red: 0, black: 0, sevens: 0, fives: 0, wilds: 0 },
  meldedCards: 0,
  penalties: { blackThrees: 0, redThrees: 0, remainingCards: 0 },
  bonuses: { goingOut: false, redThrees: 0 },
  totalScore: 0,
});

const initialState = {
  teams: [
    { id: 1, name: 'Team 1', players: [] },
    { id: 2, name: 'Team 2', players: [] }
  ],
  currentRound: 1,
  scores: [
    { teamId: 1, rounds: Array.from({ length: 4 }, () => initialRoundScore()), totalScore: 0 },
    { teamId: 2, rounds: Array.from({ length: 4 }, () => initialRoundScore()), totalScore: 0 }
  ],
  meldRequirements: [50, 90, 120, 150],
  completedRounds: new Set(),
};

beforeEach(() => {
  useGameStore.setState(initialState, true);
});

test('updateRoundScore calculates totals correctly', () => {
  const round = {
    books: { red: 1, black: 1, sevens: 0, fives: 0, wilds: 0 },
    meldedCards: 0,
    penalties: { blackThrees: 1, redThrees: 0, remainingCards: 0 },
    bonuses: { goingOut: false, redThrees: 2 },
    totalScore: 0,
  };

  updateRoundScore(1, 0, round, 100);
  const state = useGameStore.getState();
  const score = state.scores[0].rounds[0].totalScore;
  const teamTotal = state.scores[0].totalScore;
  assert.equal(score, 1000);
  assert.equal(teamTotal, 1000);
});

test('updateTeamName changes the team name', () => {
  updateTeamName(1, 'Winners');
  assert.equal(useGameStore.getState().teams[0].name, 'Winners');
});

test('addCompletedRound marks a round as completed', () => {
  addCompletedRound(2, 3);
  assert.ok(useGameStore.getState().completedRounds.has('2-3'));
});
