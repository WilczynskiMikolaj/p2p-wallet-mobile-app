import { createContext, useContext, useState } from 'react';
import { demoCredentials } from '../data/demo';

/** @typedef {{ isSignedIn: boolean, signIn: (email: string, password: string) => boolean, signOut: () => void }} DemoSession */
const DemoSessionContext = createContext(/** @type {DemoSession | null} */ (null));

/** @param {{ children: import('react').ReactNode }} props */
export function DemoSessionProvider({ children }) {
  const [isSignedIn, setIsSignedIn] = useState(false);

  /** @param {string} email @param {string} password */
  function signIn(email, password) {
    const matches = email.trim().toLowerCase() === demoCredentials.email
      && password === demoCredentials.password;
    if (matches) setIsSignedIn(true);
    return matches;
  }

  function signOut() {
    setIsSignedIn(false);
  }

  return (
    <DemoSessionContext.Provider value={{ isSignedIn, signIn, signOut }}>
      {children}
    </DemoSessionContext.Provider>
  );
}

export function useDemoSession() {
  const context = useContext(DemoSessionContext);
  if (!context) throw new Error('Brak DemoSessionProvider.');
  return context;
}
