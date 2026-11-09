
export function registrationError(email, password, name, repeated) {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return 'Wpisz poprawny adres e-mail.';
  if (name.trim().length < 1 || name.trim().length > 60) return 'Nazwa musi mieć od 1 do 60 znaków.';
  if (password.length < 12 || !/[a-z]/.test(password) || !/[A-Z]/.test(password) || !/[0-9]/.test(password)) {
    return 'Hasło: minimum 12 znaków, mała i wielka litera oraz cyfra.';
  }
  if (password !== repeated) return 'Hasła nie są takie same.';
  return '';
}
