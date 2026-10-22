// Wyłącznie publiczne, fikcyjne dane demonstracyjne.
// Kwoty zapisujemy w groszach, aby nie operować na ułamkach waluty.
export const demoCredentials = {
  email: 'alex@example.com',
  password: 'demo1234',
};

export const demoProfile = {
  id: 'user-alex',
  displayName: 'Alex',
  email: demoCredentials.email,
};

export const demoWallet = {
  id: 'wallet-alex',
  userId: demoProfile.id,
  balanceMinor: 100000,
  currency: 'PLN',
  status: 'active',
};

// Widok historii dla UI: amountMinor jest dodatnie; direction określa kierunek.
// Backend docelowo wyprowadzi ten widok z nadawcy i odbiorcy transakcji.
export const demoTransactions = [
  { id: 'tx-6', counterpartyName: 'Anna Kowalska', description: 'Obiad', direction: 'outgoing', amountMinor: 2500, createdAt: '2026-10-22T10:30:00Z' },
  { id: 'tx-5', counterpartyName: 'Jan Nowak', description: 'Zwrot za bilety', direction: 'incoming', amountMinor: 4000, createdAt: '2026-10-21T16:15:00Z' },
  { id: 'tx-4', counterpartyName: 'Maja Wiśniewska', description: 'Kawa', direction: 'outgoing', amountMinor: 1250, createdAt: '2026-10-21T07:42:00Z' },
  { id: 'tx-3', counterpartyName: 'Jan Nowak', description: 'Wspólne zakupy', direction: 'outgoing', amountMinor: 6350, createdAt: '2026-10-20T15:00:00Z' },
  { id: 'tx-2', counterpartyName: 'Anna Kowalska', description: 'Rozliczenie wyjazdu', direction: 'incoming', amountMinor: 10000, createdAt: '2026-10-19T09:20:00Z' },
  { id: 'tx-1', counterpartyName: 'Maja Wiśniewska', description: 'Bilet na koncert', direction: 'outgoing', amountMinor: 13900, createdAt: '2026-10-18T18:10:00Z' },
];
