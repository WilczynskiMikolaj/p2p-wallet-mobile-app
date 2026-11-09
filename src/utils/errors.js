
export function userError(error) {
  const value =  (error || {});
  const code = value.code || '';
  if (code === 'invalid_credentials') return 'Nie udało się zalogować. Sprawdź e-mail i hasło.';
  if (code === 'email_not_confirmed') return 'Potwierdź adres e-mail kodem z wiadomości.';
  if (code === 'otp_expired' || code === 'otp_disabled') return 'Kod jest niepoprawny lub wygasł. Poproś o nowy kod.';
  if (code === 'weak_password') return 'Hasło nie spełnia wymagań serwera. Użyj co najmniej 12 znaków, małej i wielkiej litery oraz cyfry.';
  if (code.includes('rate_limit') || code === 'over_email_send_rate_limit') return 'Zbyt wiele prób. Odczekaj przed ponowieniem.';
  if (code === '42501') return 'Brak uprawnień do tej operacji.';
  if (code === 'PGRST116' || code === '42P01' || code === 'PGRST205') return 'Brakuje danych konta lub tabel. Sprawdź migrację etapu 2 w Supabase.';
  if (code === 'unexpected_failure') return 'Nie udało się utworzyć konta. Sprawdź konfigurację Auth i logi projektu Supabase.';
  if (/network|fetch|connection|timeout/i.test(value.message || '')) return 'Brak połączenia z serwerem. Sprawdź internet i spróbuj ponownie.';
  if (/secure|keychain|keystore|magazyn|sesji/i.test(value.message || '')) return 'Nie udało się odczytać lub zapisać bezpiecznej sesji na urządzeniu. Spróbuj ponownie.';
  return 'Operacja nie powiodła się. Sprawdź połączenie i konfigurację Supabase, a następnie spróbuj ponownie.';
}
