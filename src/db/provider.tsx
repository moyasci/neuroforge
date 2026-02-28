"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import { initDatabase, type Database } from "./pglite";

interface DatabaseContextValue {
  db: Database | null;
  isReady: boolean;
  error: Error | null;
}

const DatabaseContext = createContext<DatabaseContextValue>({
  db: null,
  isReady: false,
  error: null,
});

export function DatabaseProvider({ children }: { children: ReactNode }) {
  const [db, setDb] = useState<Database | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    initDatabase()
      .then((database) => {
        setDb(database);
        setIsReady(true);
      })
      .catch((err) => {
        console.error("[PGLite] Failed to initialize:", err);
        setError(err);
      });
  }, []);

  return (
    <DatabaseContext.Provider value={{ db, isReady, error }}>
      {children}
    </DatabaseContext.Provider>
  );
}

export function useDatabase(): Database {
  const { db } = useContext(DatabaseContext);
  if (!db) throw new Error("Database not ready. Wrap your app with <DatabaseProvider>.");
  return db;
}

export function useDatabaseStatus() {
  return useContext(DatabaseContext);
}
