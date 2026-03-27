import { createContext, useContext } from 'react';
import type { VersionState, VersionActions } from './useVersionState';

interface VersionContextValue {
  state: VersionState;
  actions: VersionActions;
}

export const VersionContext = createContext<VersionContextValue | null>(null);

export function useVersion() {
  const ctx = useContext(VersionContext);
  if (!ctx) throw new Error('useVersion must be used inside VersionContext.Provider');
  return ctx;
}
