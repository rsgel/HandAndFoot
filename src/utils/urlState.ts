import type { GameState } from '../types/game';
import useGameStore from '../store/gameStore';

// FNV-1a 32bit hash
function fnv1a(str: string): number {
  let h = 0x811c9dc5;
  for (let i = 0; i < str.length; i++) {
    h ^= str.charCodeAt(i);
    h = Math.imul(h, 0x01000193);
  }
  return h >>> 0;
}

// Simple LZW compression returning base64 string
function lzwCompress(str: string): string {
  const dict = new Map<string, number>();
  for (let i = 0; i < 256; i++) {
    dict.set(String.fromCharCode(i), i);
  }
  let dictSize = 256;
  let w = '';
  const result: number[] = [];
  for (const c of str) {
    const wc = w + c;
    if (dict.has(wc)) {
      w = wc;
    } else {
      result.push(dict.get(w)!);
      dict.set(wc, dictSize++);
      w = c;
    }
  }
  if (w !== '') result.push(dict.get(w)!);
  const bytes: number[] = [];
  for (const code of result) {
    bytes.push(code >> 8, code & 0xff);
  }
  return encodeURIComponent(btoa(String.fromCharCode(...bytes)));
}

function lzwDecompress(data: string): string | null {
  try {
    const decoded = atob(decodeURIComponent(data));
    const bytes = Array.from(decoded, (c) => c.charCodeAt(0));
    const codes: number[] = [];
    for (let i = 0; i < bytes.length; i += 2) {
      codes.push((bytes[i] << 8) | bytes[i + 1]);
    }
    const dict = new Map<number, string>();
    for (let i = 0; i < 256; i++) {
      dict.set(i, String.fromCharCode(i));
    }
    let dictSize = 256;
    let w = String.fromCharCode(codes[0]);
    let result = w;
    for (let i = 1; i < codes.length; i++) {
      const k = codes[i];
      let entry: string;
      if (dict.has(k)) {
        entry = dict.get(k)!;
      } else if (k === dictSize) {
        entry = w + w[0];
      } else {
        return null;
      }
      result += entry;
      dict.set(dictSize++, w + entry[0]);
      w = entry;
    }
    return result;
  } catch {
    return null;
  }
}

export function encodeGameState(state: GameState): string {
  const json = JSON.stringify(state, (_key, value) =>
    value instanceof Set ? Array.from(value) : value
  );
  const compressed = lzwCompress(json);
  const hash = fnv1a(json).toString(16);
  return `${hash}-${compressed}`;
}

export function decodeGameState(value: string): GameState | null {
  const index = value.indexOf('-');
  if (index === -1) return null;
  const hash = value.slice(0, index);
  const compressed = value.slice(index + 1);
  const json = lzwDecompress(compressed);
  if (!json) return null;
  if (fnv1a(json).toString(16) !== hash) return null;
  try {
    const parsed = JSON.parse(json) as GameState & { completedRounds: string[] };
    if (Array.isArray(parsed.completedRounds)) {
      parsed.completedRounds = new Set(parsed.completedRounds);
    } else {
      parsed.completedRounds = new Set();
    }
    return parsed as GameState;
  } catch {
    return null;
  }
}

export function copyCurrentStateUrl() {
  const state = useGameStore.getState();
  const encoded = encodeGameState(state);
  const params = new URLSearchParams();
  params.set('state', encoded);
  const url = `${window.location.origin}${window.location.pathname}#${params.toString()}`;
  navigator.clipboard.writeText(url);
}
