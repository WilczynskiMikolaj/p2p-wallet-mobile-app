import { getSupabase } from './supabase';


export async function fetchAccount(userId) {
  const client = getSupabase();
  const results = await Promise.all([
    client.from('profiles').select('id, display_name, created_at').eq('id', userId).single(),
    client.from('user_roles').select('role').eq('user_id', userId).single(),
    client.from('wallets').select('id, user_id, balance_minor, currency, status').eq('user_id', userId).single(),
  ]);
  for (const result of results) if (result.error) throw result.error;
  const profile = results[0].data;
  const role = results[1].data;
  const wallet = results[2].data;
  if (!profile || !wallet || !role || !['user', 'admin'].includes(role.role)) throw new Error('Niekompletne konto.');
  return { profile, role: role.role, wallet };
}


export async function updateDisplayName(userId, displayName) {
  const { data, error } = await getSupabase().from('profiles')
    .update({ display_name: displayName.trim() }).eq('id', userId).select('id').single();
  if (error) throw error;
  return data;
}


export async function fetchTransactions(walletId) {
  const { data, error } = await getSupabase().from('transactions')
    .select('id, sender_wallet_id, recipient_wallet_id, kind, amount_minor, title, created_at')
    .or(`sender_wallet_id.eq.${walletId},recipient_wallet_id.eq.${walletId}`)
    .order('created_at', { ascending: false }).limit(50);
  if (error) throw error;
  return (data || []).map((item) => ({
    id: item.id,
    counterpartyName: item.kind === 'test_credit' ? 'Środki testowe' : 'Przelew P2P',
    description: item.title,
    direction: item.recipient_wallet_id === walletId ? 'incoming' : 'outgoing',
    amountMinor: Number(item.amount_minor),
    createdAt: item.created_at,
  }));
}

export async function fetchAdminAccounts(offset = 0) {
  const { data, error } = await getSupabase().rpc('admin_list_accounts', { p_limit: 50, p_offset: offset });
  if (error) throw error;
  return data || [];
}
