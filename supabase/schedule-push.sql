create extension if not exists pg_cron;
create extension if not exists pg_net with schema extensions;
select cron.schedule('p2p-push-every-minute', '* * * * *', $$
 select net.http_post(
  url := (select decrypted_secret from vault.decrypted_secrets where name='p2p_project_url') || '/functions/v1/dispatch-push',
  headers := jsonb_build_object('Content-Type','application/json','x-dispatch-secret',
   (select decrypted_secret from vault.decrypted_secrets where name='p2p_dispatch_secret')),
  body := '{}'::jsonb
 );
$$);
