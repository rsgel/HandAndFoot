import React, { useState } from 'react';
import { addTeam } from '../store/gameStore';

export default function TeamSetup() {
  const [teamName, setTeamName] = useState('');
  const [player1, setPlayer1] = useState('');
  const [player2, setPlayer2] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!teamName || !player1) return;

    const teamId = Date.now();
    const players = [
      { id: `p1-${teamId}`, name: player1, teamId },
      ...(player2 ? [{ id: `p2-${teamId}`, name: player2, teamId }] : []),
    ];

    addTeam({
      id: teamId,
      name: teamName,
      players,
    });

    setTeamName('');
    setPlayer1('');
    setPlayer2('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-200">Team Name</label>
        <input
          type="text"
          value={teamName}
          onChange={(e) => setTeamName(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-gray-700 text-white"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-200">Player 1</label>
        <input
          type="text"
          value={player1}
          onChange={(e) => setPlayer1(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-gray-700 text-white"
          required
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-200">Player 2 (Optional)</label>
        <input
          type="text"
          value={player2}
          onChange={(e) => setPlayer2(e.target.value)}
          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-300 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 bg-gray-700 text-white"
        />
      </div>
      <button
        type="submit"
        className="w-full bg-indigo-600 text-white py-2 px-4 rounded-md hover:bg-indigo-700 transition-colors"
      >
        Add Team
      </button>
    </form>
  );
}