# Access token i refresh token Supabase
Po co na urządzeniu: zachować zalogowanie po zamknięciu aplikacji i odświeżyć access token.

Klasyfikacja: szczególnie wrażliwe

Magazyn: Supabase Auth

Dostępność: WHEN_UNLOCKED_THIS_DEVICE_ONLY

Uzasadnienie decyzji: potrzebne do utrzymania sesji i komunikacji z Supabase, nie do pracy przelewów offline. Kod AuthContext uruchamia auto-refresh, gdy aplikacja jest aktywna, i zatrzymuje go po przejściu w tło.

Zasady: 2, 3, 5

# Próba przelewu oczekująca na rozstrzygnięcie
Po co na urządzeniu: po przerwaniu połączenia ponowić tę samą próbę z tym samym kluczem idempotencji i nie pobrać kwoty drugi raz.

Klasyfikacja: szczególnie wrażliwe

Magazyn: Expo SecureStore pod kluczem pending-payment-{userId}

Dostępność: aplikacja zapisuje próbę tuż przed żądaniem do backendu i usuwa ją po potwierdzonej odpowiedzi.

Uzasadnienie: potrzebna tylko do wyjaśnienia niejednoznacznego wyniku albo bezpiecznego ponowienia.

Decyzja: zostawiona do czasu sprawdzenia historii i ponowienia z tym samym kluczem. Po rozstrzygnięciu do usunięcia.

Zasady: 1, 2, 5

# Token Expo Push
Po co na urządzeniu: usunąć rejestrację tego urządzenia z backendu podczas wyłączenia push/wylogowania.

Klasyfikacja: poufne

Magazyn: Expo SecureStore, klucz p2p-push-token;

Stan obecny: zapisywany po świadomym włączeniu push; usuwany po udanym stage3_unregister_push i wylogowaniu.

Decyzja: trzymane tylko po włączeniu push i usunąć z serwera oraz SecureStore przy wyłączeniu/wylogowaniu.

Zasady: 1, 2, 3, 5

# Cache, logi i pozostałe dane - Nieskonczone

Decyzja: 

Dowód z emulatora 09.11.2026: zanotowano katalogi app_webview, cache/http-cache, cache/image_cache, BridgelessReactNativeDevBundle.js oraz preferencje Android. Nazwa pliku sama nie potwierdza, że jest w nim token, historia lub prywatne zdjęcie. 

Zasady: 1, 4, 5