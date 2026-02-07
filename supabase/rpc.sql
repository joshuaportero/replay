-- Remote Procedure Call to fetch secret safely
create or replace function get_secret(secret_id uuid)
returns table (
  id uuid,
  delivery_date timestamptz,
  content text,
  media_url text,
  user_id uuid,
  created_at timestamptz
) 
language plpgsql
security definer
as $$
declare
  secret_record record;
begin
  select * into secret_record from secrets where secrets.id = secret_id;
  
  if not found then
    return;
  end if;

  if secret_record.delivery_date > now() then
    -- Return only metadata, mask content
    return query select 
      secret_record.id, 
      secret_record.delivery_date, 
      null::text as content, 
      null::text as media_url,
      secret_record.user_id,
      secret_record.created_at;
  else
    -- Return everything
    return query select 
      secret_record.id, 
      secret_record.delivery_date, 
      secret_record.content, 
      secret_record.media_url,
      secret_record.user_id,
      secret_record.created_at;
  end if;
end;
$$;
