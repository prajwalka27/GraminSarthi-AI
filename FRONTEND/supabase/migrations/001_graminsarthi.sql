create extension if not exists "pgcrypto";

create table if not exists public.merchants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null unique references auth.users(id) on delete cascade,
  name text not null,
  mobile text,
  language text not null default 'en',
  created_at timestamptz not null default now()
);

create table if not exists public.businesses (
  id uuid primary key default gen_random_uuid(),
  merchant_id uuid not null references public.merchants(id) on delete cascade,
  business_name text not null,
  business_category text,
  location text,
  created_at timestamptz not null default now()
);

create table if not exists public.ledger_entries (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  entry_type text not null check (entry_type in ('SALE', 'PURCHASE', 'STOCK_COST', 'OVERHEAD', 'EXPENSE')),
  amount numeric(14,2) not null check (amount > 0),
  description text not null,
  entry_date date not null,
  created_at timestamptz not null default now()
);

create table if not exists public.expenses (
  id uuid primary key default gen_random_uuid(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  category text not null,
  amount numeric(14,2) not null check (amount > 0),
  description text,
  expense_date date not null,
  created_at timestamptz not null default now()
);

create index if not exists businesses_merchant_id_idx on public.businesses(merchant_id);
create index if not exists ledger_entries_business_date_idx on public.ledger_entries(business_id, entry_date);
create index if not exists ledger_entries_type_idx on public.ledger_entries(entry_type);
create index if not exists expenses_business_date_idx on public.expenses(business_id, expense_date);

alter table public.merchants enable row level security;
alter table public.businesses enable row level security;
alter table public.ledger_entries enable row level security;
alter table public.expenses enable row level security;

create policy "merchants own profile" on public.merchants for all using (user_id = auth.uid()) with check (user_id = auth.uid());
create policy "merchants own businesses" on public.businesses for all using (
  exists (select 1 from public.merchants m where m.id = merchant_id and m.user_id = auth.uid())
) with check (
  exists (select 1 from public.merchants m where m.id = merchant_id and m.user_id = auth.uid())
);
create policy "merchants own ledger" on public.ledger_entries for all using (
  exists (select 1 from public.businesses b join public.merchants m on m.id = b.merchant_id where b.id = business_id and m.user_id = auth.uid())
) with check (
  exists (select 1 from public.businesses b join public.merchants m on m.id = b.merchant_id where b.id = business_id and m.user_id = auth.uid())
);
create policy "merchants own expenses" on public.expenses for all using (
  exists (select 1 from public.businesses b join public.merchants m on m.id = b.merchant_id where b.id = business_id and m.user_id = auth.uid())
) with check (
  exists (select 1 from public.businesses b join public.merchants m on m.id = b.merchant_id where b.id = business_id and m.user_id = auth.uid())
);
