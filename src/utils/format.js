/** @param {number} amountMinor */
export function formatMoney(amountMinor) {
  return new Intl.NumberFormat('pl-PL', {
    style: 'currency',
    currency: 'PLN',
  }).format(amountMinor / 100);
}

/** @param {string} value Data ISO 8601 */
export function formatDate(value) {
  return new Intl.DateTimeFormat('pl-PL', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Europe/Warsaw',
  }).format(new Date(value));
}
