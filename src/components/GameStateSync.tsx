import React, { useEffect } from 'react';
import useGameStore from '../store/gameStore';
import { decodeGameState, encodeGameState, copyCurrentStateUrl } from '../utils/urlState';

export default function GameStateSync() {
  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1));
    const encoded = params.get('state');
    if (encoded) {
      const state = decodeGameState(encoded);
      if (state) {
        useGameStore.setState(state);
      }
    }
  }, []);

  useEffect(() => {
    const unsub = useGameStore.subscribe((newState) => {
      const encoded = encodeGameState(newState);
      const params = new URLSearchParams();
      params.set('state', encoded);
      window.history.replaceState(null, '', `#${params.toString()}`);
    });
    return unsub;
  }, []);

  return (
    <div className="mb-4 text-right">
      <button
        onClick={copyCurrentStateUrl}
        className="px-3 py-1 bg-indigo-600 rounded text-white hover:bg-indigo-700"
      >
        Copy Game Link
      </button>
    </div>
  );
}
