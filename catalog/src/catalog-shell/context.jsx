import { createContext, useContext } from 'react';

const CatalogShellContext = createContext(null);

export function CatalogShellProvider({ value, children }) {
  return <CatalogShellContext.Provider value={value}>{children}</CatalogShellContext.Provider>;
}

export function useCatalogShell() {
  return useContext(CatalogShellContext);
}
