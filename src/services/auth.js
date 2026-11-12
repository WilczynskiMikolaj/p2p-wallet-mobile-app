import { getSupabase } from "./supabase";

export async function signIn(email, password) {
  const { error } = await getSupabase().auth.signInWithPassword({
    email: email.trim().toLowerCase(),
    password,
  });
  if (error) throw error;
}

export async function signUp(email, password, name) {
  const { data, error } = await getSupabase().auth.signUp({
    email: email.trim().toLowerCase(),
    password,
    options: { data: { display_name: name.trim() } },
  });
  if (error) throw error;
  return data.session;
}

export async function confirmEmail(email, token) {
  const { error } = await getSupabase().auth.verifyOtp({
    email: email.trim().toLowerCase(),
    token: token.trim(),
    type: "email",
  });
  if (error) throw error;
}

export async function resendConfirmation(email) {
  const { error } = await getSupabase().auth.resend({
    type: "signup",
    email: email.trim().toLowerCase(),
  });
  if (error) throw error;
}
