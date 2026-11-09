
| Dane | Gdzie są teraz | Klasyfikacja | Musi być na urządzeniu? | Docelowe miejsca i opcja |
| :--- | :---: | :---: | :---: | :---: |
| Tokeny sesji supabase | expo-secure-store, używany jako magazyn sesji Supabase Auth | Szczególnie wrażliwe | Tak | Zostawić w magazynie chronionym przez system. Usunąć przy wylogowaniu. |
| Podgląd kamery i wynik kodu qr | Bufor kamery/detektora expo-camera | Poufne | Nie trwale. | Po zamknięciu widoku zatrzymać podgląd; nie zapisywać klatek ani zrzutów ekranu. QR zweryfikować na serwerze. |
| Treść kodu QR, bieżące saldo, profil, rola, historia transakcji i powiadomienia pobrane z bazy danych | Pamięć React oraz chwilowe żądania i odpowiedzi HTTPS. | Szczególnie wrażliwe | Tylko w pamięci podczas korzystania z ekranu. | Źródłem danych pozostaje Supabase. |
| Informacje o kontakcie | Expo-contacts; zwrócony kontakt i e-maile są chwilowo w pamięci aplikacji. | Poufne | Nie trwale. | Kontakty pozostają w telefonie i nie są kopiowana |
| Formularz przelewu | Pamięć komponentu React. | Poufne | Nie trwale. | Trzymać w pamięci widoku; wyczyścić po opuszczeniu/anulowaniu. |
| Powiadomienia push | Powiadomienie systemowe i tymczasowy stan SDK powiadomień. | Poufne - może zawierać informacje o przelewach | Krótko, ale tak | Zostawić ogólną, minimalną treść. Systemową kopię można usunąć |
| Preferencje użytkownika | Brak obecnie 09.11.2026 | Wewnętrzne | Nie | Dodać trwały zapis tylko jeśli pojawi się funkcja |
| Zgody systemowe: kamera, kontakty i powiadomienia;| Zgodami zarządza system. | Wewnętrzne | Tak | Pozostawić zarządzanie systemowi. |
| Preferencje użytkownika | Brak obecnie 09.11.2026 | Wewnętrzne | Nie | Dodać trwały zapis tylko jeśli pojawi się funkcja |

