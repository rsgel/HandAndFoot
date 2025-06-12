import React, { useState, useMemo } from 'react';
import type { RoundScore } from '../types/game';
import useGameStore, { updateRoundScore, updateTeamName, addCompletedRound, removeCompletedRound } from '../store/gameStore';

interface ScoreInputProps {
  teamId: number;
  onRoundComplete?: () => void;
}

export default function ScoreInput({ teamId, onRoundComplete }: ScoreInputProps) {
  const { teams, completedRounds } = useGameStore();
  const team = teams.find(t => t.id === teamId)!;
  const [isEditingName, setIsEditingName] = useState(false);
  const [teamName, setTeamName] = useState(team.name);
  const [activeRound, setActiveRound] = useState(0);
  const meldRequirements = [50, 90, 120, 150];
  const emptyRound = (): RoundScore => ({
    books: { red: 0, black: 0, sevens: 0, fives: 0, wilds: 0 },
    meldedCards: 0,
    penalties: { blackThrees: 0, redThrees: 0, remainingCards: 0 },
    bonuses: { goingOut: false, redThrees: 0 },
    totalScore: 0,
  });

  const [scores, setScores] = useState<RoundScore[]>(
    Array.from({ length: 4 }, () => emptyRound())
  );
  const [meldedPoints, setMeldedPoints] = useState<number[]>([0, 0, 0, 0]);

  const score = scores[activeRound];
  const currentScore = useMemo(
    () => calculateScore(score, meldedPoints[activeRound]),
    [score, meldedPoints[activeRound]]
  );

  function calculateScore(currentScore: RoundScore, meldedPoints: number): number {
    const bookPoints = 
      currentScore.books.red * 500 +
      currentScore.books.black * 300 +
      currentScore.books.sevens * 5000 +
      currentScore.books.fives * 3000 +
      currentScore.books.wilds * 2500;

    const penaltyPoints = 
      (currentScore.penalties.blackThrees * -100) +
      (currentScore.penalties.redThrees * -500) +
      currentScore.penalties.remainingCards;

    const bonusPoints = 
      (currentScore.bonuses.goingOut ? 100 : 0) +
      (currentScore.bonuses.redThrees * 100) +
      (currentScore.bonuses.redThrees >= 7 ? 300 : 0);

    return bookPoints + meldedPoints + penaltyPoints + bonusPoints;
  }


  const handleChange = (
    category: string,
    subcategory: string,
    value: number | boolean
  ) => {
    setScores(prev => {
      const updated = [...prev];
      const current = { ...updated[activeRound] } as any;
      current[category] = {
        ...(current[category] as object),
        [subcategory]: value,
      };
      updated[activeRound] = { ...current };
      return updated;
    });
  };

  const handleSubmit = () => {
    const round = scores[activeRound];
    const total = calculateScore(round, meldedPoints[activeRound]);
    const finalScore = {
      ...round,
      meldedCards: meldedPoints[activeRound],
      totalScore: total,
    };
    updateRoundScore(teamId, activeRound, finalScore);
    addCompletedRound(teamId, activeRound);
    setScores(prev => {
      const updated = [...prev];
      updated[activeRound] = finalScore;
      return updated;
    });
  };

  const handleEdit = () => {
    removeCompletedRound(teamId, activeRound);
  };

  const handleTeamNameSubmit = () => {
    updateTeamName(teamId, teamName);
    setIsEditingName(false);
  };

  const isRoundCompleted = (round: number) => completedRounds.has(`${teamId}-${round}`);

  const submitted = isRoundCompleted(activeRound);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        {isEditingName ? (
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={teamName}
              onChange={(e) => setTeamName(e.target.value)}
              className="px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              autoFocus
            />
            <button
              onClick={handleTeamNameSubmit}
              className="px-3 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700"
            >
              Save
            </button>
          </div>
        ) : (
          <div className="flex items-center space-x-2">
            <h3 className="text-xl font-bold text-white">{team.name}</h3>
            <button
              onClick={() => setIsEditingName(true)}
              className="text-gray-400 hover:text-white"
            >
              ✎
            </button>
          </div>
        )}
      </div>

      <div className="flex space-x-2 mb-4">
        {[0, 1, 2, 3].map((round) => (
          <button
            key={round}
            onClick={() => setActiveRound(round)}
            className={`px-4 py-2 rounded-t-lg flex items-center space-x-2 ${
              activeRound === round
                ? 'bg-green-700 text-white'
                : 'bg-gray-700 text-gray-300'
            }`}
          >
            <span>Round {round + 1}</span>
            {isRoundCompleted(round) && (
              <span className="text-green-500">✓</span>
            )}
          </button>
        ))}
      </div>

      <div className="space-y-4 p-4 bg-gray-800 rounded-lg">
        <p className="text-gray-300">Meld Requirement: {meldRequirements[activeRound]} points
          <span className="absolute inline-flex size-3 ml-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-sky-400 opacity-75"></span>
            <span className="relative inline-flex size-3 rounded-full bg-sky-500"></span>
          </span>
        </p>
        <p className="text-lg font-semibold text-green-400">Current Score: {currentScore.toLocaleString()}</p>

        <div className="space-y-2">
          <h4 className="text-lg font-semibold text-white">Special Books</h4>
          <p className="text-sm text-gray-400 mt-1">
              Enter the number of books for each category (7 cards)
          </p>
          <div className="grid grid-cols-3 gap-2">
            <div>
              <label className="block text-sm text-gray-300">7's Books</label>
              <input
                type="number"
                min="0"
                value={score.books.sevens}
                onChange={(e) => handleChange('books', 'sevens', parseInt(e.target.value) || 0)}
                onFocus={(e) => e.target.value === "0" && (e.target.value = "")}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                disabled={submitted}
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300">5's Books</label>
              <input
                type="number"
                min="0"
                value={score.books.fives}
                onChange={(e) => handleChange('books', 'fives', parseInt(e.target.value) || 0)}
                onFocus={(e) => e.target.value === "0" && (e.target.value = "")}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                disabled={submitted}
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300">Wild Books</label>
              <input
                type="number"
                min="0"
                value={score.books.wilds}
                onChange={(e) => handleChange('books', 'wilds', parseInt(e.target.value) || 0)}
                onFocus={(e) => e.target.value === "0" && (e.target.value = "")}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                disabled={submitted}
                inputMode="numeric"
              />
            </div>
          </div>
        </div>
        
        <div className="space-y-2">
          <h4 className="text-lg font-semibold text-white">Books</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm text-gray-300">Red Books</label>
              <input
                type="number"
                min="0"
                value={score.books.red}
                onChange={(e) => handleChange('books', 'red', parseInt(e.target.value) || 0)}
                onFocus={(e) => e.target.value === "0" && (e.target.value = "")}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                disabled={submitted}
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300">Black Books</label>
              <input
                type="number"
                min="0"
                value={score.books.black}
                onChange={(e) => handleChange('books', 'black', parseInt(e.target.value) || 0)}
                onFocus={(e) => e.target.value === "0" && (e.target.value = "")}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                disabled={submitted}
                inputMode="numeric"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-lg font-semibold text-white">Card Points</h4>
          <div>
            <p className="text-sm text-gray-400 mt-1">
              Enter the total points from melded cards (Jokers: 50, Aces/2s: 20, 8-K: 10, 4-7: 5)
            </p>
            <input
              type="number"
              value={meldedPoints[activeRound]}
              onChange={(e) =>
                setMeldedPoints(prev => {
                  const arr = [...prev];
                  arr[activeRound] = parseInt(e.target.value) || 0;
                  return arr;
                })
              }
              onFocus={(e) => e.target.value === "0" && (e.target.value = "")}
              className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
              disabled={submitted}
              inputMode="numeric"
            />
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-lg font-semibold text-white">Penalties</h4>
          <p className="text-sm text-gray-400 mt-1">
              Enter the number of special cards left in your hand (or foot)
          </p>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-sm text-gray-300">Black 3s</label>
              <input
                type="number"
                min="0"
                value={score.penalties.blackThrees}
                onChange={(e) => handleChange('penalties', 'blackThrees', parseInt(e.target.value) || 0)}
                onFocus={(e) => e.target.value === "0" && (e.target.value = "")}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                disabled={submitted}
                inputMode="numeric"
              />
            </div>
            <div>
              <label className="block text-sm text-gray-300">Red 3s</label>
              <input
                type="number"
                min="0"
                value={score.penalties.redThrees}
                onChange={(e) => handleChange('penalties', 'redThrees', parseInt(e.target.value) || 0)}
                onFocus={(e) => e.target.value === "0" && (e.target.value = "")}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                disabled={submitted}
                inputMode="numeric"
              />
            </div>
          </div>
        </div>

        <div className="space-y-2">
          <h4 className="text-lg font-semibold text-white">Bonuses</h4>
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2">
              <button
                type="button"
                onClick={() => handleChange('bonuses', 'goingOut', !score.bonuses.goingOut)}
                className={`px-4 py-2 rounded ${score.bonuses.goingOut ? 'bg-indigo-600 text-white' : 'bg-gray-300 text-gray-700'}`}
                disabled={submitted}
              >
                Going Out
              </button>
            </label>
            <div>
              <label className="block text-sm text-gray-300">Red 3s Collected</label>
              <input
                type="number"
                min="0"
                max="7"
                value={score.bonuses.redThrees}
                onChange={(e) => handleChange('bonuses', 'redThrees', parseInt(e.target.value) || 0)}
                className="w-20 px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50"
                disabled={submitted}
                inputMode="numeric"
              />
            </div>
          </div>
        </div>

        {submitted ? (
          <>
            <button
              disabled
              className="w-full py-2 px-4 rounded-md bg-gray-600 text-white font-semibold cursor-not-allowed"
            >
              Score Submitted
            </button>
            <button
              onClick={handleEdit}
              className="w-full mt-2 py-2 px-4 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
            >
              Edit
            </button>
          </>
        ) : (
          <button
            onClick={handleSubmit}
            className="w-full py-2 px-4 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold"
          >
            Submit Score
          </button>
        )}
      </div>
    </div>
  );
}