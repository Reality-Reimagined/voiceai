create table api_keys (
  id uuid primary key default gen_random_uuid(),
  provider text not null,
  key text not null,
  created_at timestamptz default now(),
  unique(provider)
);

-- Enable RLS
alter table api_keys enable row level security;

-- Add RLS policies
create policy "Users can read their own API keys"
  on api_keys for select
  to authenticated
  using (true);

create policy "Users can insert their own API keys"
  on api_keys for insert
  to authenticated
  with check (true);

create policy "Users can update their own API keys"
  on api_keys for update
  to authenticated
  using (true);
