export function userError(error) {
  const value = error || {};
  const paymentErrors = {
    INVALID_AMOUNT:
      "Podaj kwotę od 0,01 do 1 000 000,00 PLN, z maksymalnie dwoma miejscami po przecinku.",
    INVALID_TITLE: "Tytuł musi mieć od 1 do 140 znaków.",
    INVALID_PAYMENT: "Dane płatności są nieprawidłowe.",
    INVALID_QR: "To nie jest prawidłowy kod prośby P2P Wallet.",
    REQUEST_UNAVAILABLE:
      "Prośba wygasła, została opłacona lub nie jest dostępna dla tego konta.",
    RECIPIENT_NOT_FOUND:
      "Nie znaleziono innego aktywnego konta z tym adresem e-mail.",
    SELF_TRANSFER: "Nie możesz wykonać przelewu do siebie.",
    WALLET_BLOCKED: "Portfel nadawcy lub odbiorcy jest zablokowany.",
    INSUFFICIENT_FUNDS: "Brak wystarczających środków.",
    BALANCE_LIMIT: "Odbiorca osiągnął limit salda.",
    IDEMPOTENCY_CONFLICT:
      "Ta próba ma inne dane niż zapisany przelew. Sprawdź historię.",
    AUTH_REQUIRED: "Zaloguj się ponownie.",
    RATE_LIMIT: "Zbyt wiele prób. Spróbuj ponownie za minutę.",
    CONTACTS_UNAVAILABLE: "Wybór kontaktów jest dostępny w aplikacji mobilnej.",
    CONTACTS_DENIED:
      "Brak zgody na odczyt kontaktów. Możesz wpisać e-mail ręcznie.",
    CONTACT_NO_EMAIL: "Wybrany kontakt nie ma adresu e-mail. Wpisz go ręcznie.",
    PUSH_DENIED:
      "Brak zgody na powiadomienia. Możesz zmienić ją w ustawieniach systemu.",
    PUSH_BUILD_REQUIRED:
      "Otwórz własną kompilację aplikacji na urządzeniu. Push jest niedostępny w Expo Go i w przeglądarce.",
    PUSH_PROJECT_REQUIRED:
      "Brakuje identyfikatora projektu EAS. Sprawdź extra.eas.projectId w konfiguracji Expo.",
    PUSH_SETTINGS_FAILED:
      "Nie udało się przygotować powiadomień systemowych. Sprawdź ustawienia powiadomień aplikacji.",
    PUSH_FCM_FAILED:
      "Urządzenie nie uzyskało tokenu FCM. Sprawdź połączenie, Usługi Google Play i konfigurację Firebase w APK.",
    PUSH_APNS_FAILED:
      "Urządzenie nie uzyskało tokenu APNs. Sprawdź połączenie i konfigurację push dla iOS.",
    PUSH_EXPO_FAILED:
      "Urządzenie ma token systemowy, ale rejestracja w Expo nie powiodła się. Sprawdź połączenie i identyfikator projektu EAS.",
    PUSH_STORAGE_FAILED:
      "Nie udało się zapisać tokenu push w bezpiecznym magazynie urządzenia.",
    PUSH_REGISTER_FAILED:
      "Uzyskano token Expo, ale aplikacja nie potwierdziła rejestracji w Supabase. Sprawdź logi stage3_register_push.",
  };
  if (
    value.message === "PUSH_FCM_FAILED" &&
    /googleServicesFile|Default FirebaseApp is not initialized/i.test(
      value.cause?.message || "",
    )
  )
    return "Firebase nie uruchomił się w tej kompilacji. Sprawdź android.googleServicesFile i zainstaluj nowo zbudowany APK.";
  if (value.message === "PUSH_REGISTER_FAILED") {
    const message = paymentErrors.PUSH_REGISTER_FAILED;
    const cause = value.cause || {};
    if (cause.message === "AUTH_REQUIRED" || cause.message === "RATE_LIMIT")
      return `${message} ${paymentErrors[cause.message]}`;
    if (
      typeof cause.code === "string" &&
      /^(?:[0-9A-Z]{5}|PGRST[0-9X]{3})$/.test(cause.code)
    )
      return `${message} Kod: ${cause.code}.`;
  }
  if (paymentErrors[value.message]) return paymentErrors[value.message];
  const code = value.code || "";
  if (code === "invalid_credentials")
    return "Nie udało się zalogować. Sprawdź e-mail i hasło.";
  if (code === "email_not_confirmed")
    return "Potwierdź adres e-mail kodem z wiadomości.";
  if (code === "otp_expired" || code === "otp_disabled")
    return "Kod jest niepoprawny lub wygasł. Poproś o nowy kod.";
  if (code === "weak_password")
    return "Hasło nie spełnia wymagań serwera. Użyj co najmniej 12 znaków, małej i wielkiej litery oraz cyfry.";
  if (code.includes("rate_limit") || code === "over_email_send_rate_limit")
    return "Zbyt wiele prób. Odczekaj przed ponowieniem.";
  if (code === "42501") return "Brak uprawnień do tej operacji.";
  if (code === "PGRST116" || code === "42P01" || code === "PGRST205")
    return "Brakuje danych konta lub tabel. Sprawdź migrację etapu 2 w Supabase.";
  if (code === "unexpected_failure")
    return "Nie udało się utworzyć konta. Sprawdź konfigurację Auth i logi projektu Supabase.";
  if (/network|fetch|connection|timeout/i.test(value.message || ""))
    return "Brak połączenia z serwerem. Sprawdź internet i spróbuj ponownie.";
  if (/secure|keychain|keystore|magazyn|sesji/i.test(value.message || ""))
    return "Nie udało się odczytać lub zapisać bezpiecznej sesji na urządzeniu. Spróbuj ponownie.";
  return "Operacja nie powiodła się. Sprawdź połączenie i konfigurację Supabase, a następnie spróbuj ponownie.";
}
