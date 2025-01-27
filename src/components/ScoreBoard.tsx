import React from 'react';
import useGameStore from '../store/gameStore';

export default function ScoreBoard() {
  const { teams, scores } = useGameStore();

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full bg-gray-800 text-white">
        <thead>
          <tr>
            <th className="px-4 py-2 text-left">Team</th>
            <th className="px-4 py-2 text-center">Round 1</th>
            <th className="px-4 py-2 text-center">Round 2</th>
            <th className="px-4 py-2 text-center">Round 3</th>
            <th className="px-4 py-2 text-center">Round 4</th>
            <th className="px-4 py-2 text-center">Total</th>
          </tr>
        </thead>
        <tbody>
          {teams.map((team) => {
            const teamScore = scores.find((s) => s.teamId === team.id);
            return (
              <tr key={team.id} className="border-t border-gray-700">
                <td className="px-4 py-2">
                  <div className="font-semibold">{team.name}</div>
                </td>
                {teamScore?.rounds.map((round, index) => (
                  <td key={index} className="px-4 py-2 text-center">
                    {round.totalScore.toLocaleString()}
                  </td>
                ))}
                <td className="px-4 py-2 text-center font-bold">
                  {teamScore?.totalScore.toLocaleString()}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}