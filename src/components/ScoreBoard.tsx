import React, { useEffect, useState } from 'react';
import useGameStore from '../store/gameStore';

const ScoreBoard: React.FC = () => {
  const { teams, completedRounds }: { teams: { id: number; name: string }[]; completedRounds: Set<string> } = useGameStore();
  const [scores, setScores] = useState<{ [key: number]: number[] }>({});

  useEffect(() => {
    const savedScores = sessionStorage.getItem('scores');
    if (savedScores) {
      setScores(JSON.parse(savedScores));
    }
  }, []);

  useEffect(() => {
    sessionStorage.setItem('scores', JSON.stringify(scores));
  }, [scores]);

  useEffect(() => {
    const newScores = teams.reduce((acc, team) => {
      const teamScores = Array.from(completedRounds)
        .filter(round => round.startsWith(`${team.id}-`))
        .map(round => {
          const [, score] = round.split('-');
          return parseInt(score, 10);
        });
      acc[team.id] = teamScores;
      return acc;
    }, {} as { [key: number]: number[] });
    setScores(newScores);
  }, [teams, completedRounds]);

  return (
    <div>
      <h2 className="text-2xl font-bold text-white mb-4">Scoreboard</h2>
      <div className="overflow-x-auto">
        <table className="min-w-full bg-gray-800 rounded-lg">
          <thead>
            <tr>
              <th className="px-4 py-2 text-white">Team</th>
              {[...Array(4)].map((_, index) => (
                <th key={index} className="px-4 py-2 text-white">Round {index + 1}</th>
              ))}
              <th className="px-4 py-2 text-white">Total</th>
            </tr>
          </thead>
          <tbody>
            {teams.map(team => (
              <tr key={team.id}>
                <td className="border px-4 py-2 text-white">{team.name}</td>
                {[...Array(4)].map((_, index) => (
                  <td key={index} className="border px-4 py-2 text-green-400">
                    {scores[team.id] && scores[team.id][index] !== undefined ? scores[team.id][index] : 0}
                  </td>
                ))}
                <td className="border px-4 py-2 text-green-400">
                  {scores[team.id] ? scores[team.id].reduce((acc, score) => acc + score, 0) : 0}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default ScoreBoard;