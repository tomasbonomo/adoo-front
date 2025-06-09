import { createContext, useContext, useState } from "react";

const PartidoContext = createContext();

export function usePartido() {
  return useContext(PartidoContext);
}

export function PartidoProvider({ children }) {
  const [lastUpdate, setLastUpdate] = useState({}); // { [id]: Date }

  // Llamá esto cuando se actualiza un partido
  function notifyPartidoUpdated(partidoId) {
    setLastUpdate(prev => ({ ...prev, [partidoId]: Date.now() }));
  }

  return (
    <PartidoContext.Provider value={{ lastUpdate, notifyPartidoUpdated }}>
      {children}
    </PartidoContext.Provider>
  );
}

export { PartidoContext };