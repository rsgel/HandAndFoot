import React from 'react';

const ResetButton: React.FC = () => {
  const handleResetGame = () => {
    if (window.confirm('Are you sure you want to reset the game?')) {
      sessionStorage.clear();
      window.location.reload();
    }
  };

  return (
    <button
      onClick={handleResetGame}
      className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
    >
      Reset Game
    </button>
  );
};

export default ResetButton;