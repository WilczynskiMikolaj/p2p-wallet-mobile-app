## Raport dotyczy wersji z 2026.11.09 i wymaga dalszej analizy, ponieważ znalezione pliki nie zostały dokładnie sprawdzone

| Miejsce | Co znaleziono | Ryzyko |
| --- | --- | --- |
| Uprawnienia systemowe | W ustawieniach aplikacji, w emulatorze, nie znaleziono przyznanych uprawnień kamery, kontaktów ani powiadomień. W manifeście należy zwrócić uwagę na Deep link, SYSTEM_ALERT_WINDOW, android:allowBackup="true" | Średnie - brak wersji mvp jeszcze - wymaga sprawdzenia dokladniejszego |
| SecureStore | Podczas zalogowania sesja Supabase jest przechowywana przez SecureStore. Po wylogowaniu sesji już nie ma. | Wysokie, gdy sesja jest aktywna jej tokeny mogą umożliwić dostęp do konta. |
| Pliki aplikacji: `app_webview/Default/Cookies` i `Cookies-journal` | Znaleziono pliki danych WebView. | Nieustalone |
| Pliki aplikacji: `cache/http-cache/*` | Znaleziono pliki cache HTTP i dziennik cache.| **Niskie lub nieustalone:** ryzyko zależy od zawartości. Cache może zawierać pobrane dane; nie zakładaj, że zawiera tokeny lub historię bez dowodu. |
| Pliki aplikacji: `cache/image_cache/*` | Znaleziono plik cache obrazu | Niskie|
| Plik aplikacji: `files/BridgelessReactNativeDevBundle.js` | Znaleziono plik bundle JavaScript potrzebny środowisku React Native w buildzie developerskim. | Niskie |
| Plik aplikacji: `files/profileInstalled` | Znaleziono plik związany ze stanem instalacji/profilu środowiska. | Niskie |
| SecureStore | Znaleziono plik używany przez SecureStore. | Wysokie - magazyn danych uwierzytelniających.|
| Preferencje: `com.anonymous.p2pwalletmobileapp_preferences.xml` | Znaleziono plik preferencji aplikacji. Nie ustalono, jakie klucze i wartości zawiera. | Nieustalono |
| Preferencje: `WebViewChromiumPrefs.xml` i `expo.modules.kotlin.PersistentDataManager.xml` | Znaleziono pliki preferencji bibliotek Android/WebView/Expo.| Niskie
| Logi aplikacji | W sprawdzonych logach nie zauważyłem haseł, tokenów ani danych transakcji. | Niskie w sprawdzonym zakresie.|