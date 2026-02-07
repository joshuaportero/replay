-- Create the secrets table
create table secrets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users not null,
  content text,
  media_url text,
  delivery_date timestamptz not null,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table secrets enable row level security;

-- Create policies
create policy "Users can create their own secrets"
  on secrets for insert
  to authenticated
  with check (auth.uid() = user_id);

create policy "Anyone can view secrets past delivery date"
  on secrets for select
  using (delivery_date < now());
