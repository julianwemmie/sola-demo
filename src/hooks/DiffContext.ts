import { createContext, useContext } from 'react';
import type { DiffState, DiffActions } from './useDiffState';

interface DiffContextValue {
  state: DiffState;
  actions: DiffActions;
}

export const DiffContext = createContext<DiffContextValue | null>(null);

export function useDiff() {
  const ctx = useContext(DiffContext);
  if (!ctx) throw new Error('useDiff must be used inside DiffContext.Provider');
  return ctx;
}
