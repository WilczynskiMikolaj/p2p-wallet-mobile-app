| STRIDE | Zagrożenie | Ryzyko | Decyzja | 
|---|---|---|---| 
| S | Spreparowany lub wygasły token JWT| Wysokie  |  Weryfikacja ważności tokenów na serwerze oraz pobieranie tożsamości użytkownika z jego sesji. |
| T | Zmodyfikowany klient wysyła nieprawidłową kwotę przelewu lub zmienia odbiorcę. | Wysokie  | Walidacja kwot przelewów, kontrola dostępnego salda oraz weryfikacja danych odbiorcy. |
| E | Zwykły użytkownik próbuje wykonać operację administratora. | Wysokie | Kontrola uprawnień na serwerze oraz zabezpieczenie przed samodzielną zmianą ról. |
| T | Podstawiony kod QR lub link kieruje do innej prośby o płatność | Wysokie  |  Weryfikacja danych płatności na serwerze oraz potwierdzanie kwoty i odbiorcy przed przelewem.  |
| D | Masowe żądania odczytów lub przelewów przeciążają serwer i bazę danych. | Wysokie | Ograniczenie liczby żądań, wprowadzenie limitów czasu operacji |
| I | Błędna kontrola dostępu ujawnia cudze profile, salda i historię transakcji. | Wysokie | Ograniczenie dostępu do danych wyłącznie do uprawnionych użytkowników |
| T | Dwa przelewy w tym samym czasie mogą spowodować wydanie większej ilości środków | Wysokie  |  Kontrola salda podczas przelewu oraz zabezpieczenie przed jednoczesnym wykorzystaniem tych samych środków. |
| T | Ponowione żądanie lub wielokrotne użycie QR powoduje podwójne wykonanie przelewu. | Wysokie |  Wprowadzenie unikalnych identyfikatorów operacji oraz zabezpieczenie przed ponownym wykonaniem przelewu. |
| R | Brak spójnego audytu uniemożliwia potwierdzenie i odtworzenie operacji. | Średnie | Rejestrowanie historii operacji wraz z użytkownikiem i czasem oraz zabezpieczenie zapisów przed modyfikacją. |
| E | Ujawnienie klucza administracyjnego lub nadmierne uprawnienia. | Wysokie | Bezpieczne przechowywanie kluczy na serwerze, kontrola uprawnień oraz wymiana ujawnionych kluczy. |