-- ============================================================================
-- HomeCare Connect schema
--
-- Design note: public.users.id IS the Supabase auth user id (auth.uid()).
-- There is no separate "auth_uid" column — the frontend always works with
-- the id returned by supabase.auth.getUser(), and uses it directly as
-- provider_id / client_id, so the schema now matches that reality instead
-- of introducing a second id that the app never actually uses.
--
-- This file is safe to re-run: every `create table` uses `if not exists`,
-- and every column is added separately with `add column if not exists`.
-- That second part matters — `create table if not exists` is a no-op if the
-- table already exists in any form, which is exactly what caused the
-- original "column auth_uid does not exist" error: the table had been
-- created once already (without that column) and later edits to this file
-- were silently never applied. Splitting column definitions out into their
-- own `alter table` statements means running this file again always brings
-- the schema up to date, no matter what state the database is currently in.
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Users
-- ---------------------------------------------------------------------------
create table if not exists public.users (
    id uuid primary key references auth.users(id) on delete cascade
);

alter table public.users add column if not exists name text;
alter table public.users add column if not exists email text unique;
alter table public.users add column if not exists role text check (role in ('client','nurse','caregiver','admin'));
alter table public.users add column if not exists phone text;
alter table public.users add column if not exists address text;
alter table public.users add column if not exists city text;
alter table public.users add column if not exists state text;
alter table public.users add column if not exists zip_code text;
alter table public.users add column if not exists profile_image_url text;
alter table public.users add column if not exists bio text;
alter table public.users add column if not exists experience text;
alter table public.users add column if not exists hourly_rate numeric;
alter table public.users add column if not exists ratings numeric default 0;
alter table public.users add column if not exists total_reviews integer default 0;
alter table public.users add column if not exists specialties text[] default '{}';
alter table public.users add column if not exists is_available boolean default true;
alter table public.users add column if not exists created_at timestamp with time zone default now();
alter table public.users add column if not exists updated_at timestamp with time zone default now();

-- ---------------------------------------------------------------------------
-- Services
-- ---------------------------------------------------------------------------
create table if not exists public.services (
    id uuid primary key default uuid_generate_v4()
);

alter table public.services add column if not exists provider_id uuid references public.users(id) on delete cascade;
alter table public.services add column if not exists title text not null;
alter table public.services add column if not exists description text;
alter table public.services add column if not exists category text not null;
alter table public.services add column if not exists price_per_hour numeric not null check (price_per_hour >= 0);
alter table public.services add column if not exists location text;
alter table public.services add column if not exists city text;
alter table public.services add column if not exists state text;
alter table public.services add column if not exists zip_code text;
alter table public.services add column if not exists duration integer;
alter table public.services add column if not exists is_active boolean default true;
alter table public.services add column if not exists images text[] default '{}';
alter table public.services add column if not exists availability jsonb;
alter table public.services add column if not exists created_at timestamp with time zone default now();
alter table public.services add column if not exists updated_at timestamp with time zone default now();

-- ---------------------------------------------------------------------------
-- Bookings
-- ---------------------------------------------------------------------------
create table if not exists public.bookings (
    id uuid primary key default uuid_generate_v4()
);

alter table public.bookings add column if not exists client_id uuid references public.users(id) on delete cascade;
alter table public.bookings add column if not exists provider_id uuid references public.users(id) on delete cascade;
alter table public.bookings add column if not exists service_id uuid references public.services(id) on delete cascade;
alter table public.bookings add column if not exists booking_date date not null;
alter table public.bookings add column if not exists start_time time without time zone not null;
alter table public.bookings add column if not exists end_time time without time zone not null;
alter table public.bookings add column if not exists duration integer not null check (duration > 0);
alter table public.bookings add column if not exists status text check (status in ('pending','confirmed','completed','cancelled')) default 'pending';
alter table public.bookings add column if not exists total_amount numeric not null check (total_amount >= 0);
alter table public.bookings add column if not exists address text;
alter table public.bookings add column if not exists city text;
alter table public.bookings add column if not exists state text;
alter table public.bookings add column if not exists zip_code text;
alter table public.bookings add column if not exists special_instructions text;
alter table public.bookings add column if not exists created_at timestamp with time zone default now();
alter table public.bookings add column if not exists updated_at timestamp with time zone default now();

-- ---------------------------------------------------------------------------
-- Auto-provisioning: create a public.users row whenever someone signs up.
-- Without this, sign-up never populates public.users at all, and every
-- query that joins through it (services, bookings) breaks.
-- ---------------------------------------------------------------------------
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
    insert into public.users (id, name, email, role, phone, address, city, state, zip_code)
    values (
        new.id,
        new.raw_user_meta_data ->> 'name',
        new.email,
        coalesce(new.raw_user_meta_data ->> 'role', 'client'),
        new.raw_user_meta_data ->> 'phone',
        new.raw_user_meta_data ->> 'address',
        new.raw_user_meta_data ->> 'city',
        new.raw_user_meta_data ->> 'state',
        new.raw_user_meta_data ->> 'zip_code'
    )
    on conflict (id) do nothing;
    return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
    after insert on auth.users
    for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------------
alter table public.users enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;

drop policy if exists "Users can view their own profile" on public.users;
create policy "Users can view their own profile"
    on public.users for select
    using (auth.uid() = id);

drop policy if exists "Users can update their own profile" on public.users;
create policy "Users can update their own profile"
    on public.users for update
    using (auth.uid() = id);

drop policy if exists "Anyone can view provider profiles" on public.users;
create policy "Anyone can view provider profiles"
    on public.users for select
    using (role in ('nurse', 'caregiver'));

drop policy if exists "Admins can view all users" on public.users;
create policy "Admins can view all users"
    on public.users for select
    using (exists (
        select 1 from public.users u
        where u.id = auth.uid() and u.role = 'admin'
    ));

drop policy if exists "Admins can update all users" on public.users;
create policy "Admins can update all users"
    on public.users for update
    using (exists (
        select 1 from public.users u
        where u.id = auth.uid() and u.role = 'admin'
    ));

-- Services table policies
drop policy if exists "Anyone can view active services" on public.services;
create policy "Anyone can view active services"
    on public.services for select
    using (is_active = true);

drop policy if exists "Providers can insert their own services" on public.services;
create policy "Providers can insert their own services"
    on public.services for insert
    with check (auth.uid() = provider_id);

drop policy if exists "Providers can update their own services" on public.services;
create policy "Providers can update their own services"
    on public.services for update
    using (auth.uid() = provider_id);

drop policy if exists "Providers can delete their own services" on public.services;
create policy "Providers can delete their own services"
    on public.services for delete
    using (auth.uid() = provider_id);

-- Bookings table policies
drop policy if exists "Users can view bookings where they are client or provider" on public.bookings;
create policy "Users can view bookings where they are client or provider"
    on public.bookings for select
    using (auth.uid() = client_id or auth.uid() = provider_id);

drop policy if exists "Clients can insert bookings" on public.bookings;
create policy "Clients can insert bookings"
    on public.bookings for insert
    with check (auth.uid() = client_id);

drop policy if exists "Users can update their own bookings" on public.bookings;
create policy "Users can update their own bookings"
    on public.bookings for update
    using (auth.uid() = client_id or auth.uid() = provider_id);

drop policy if exists "Users can delete their own bookings" on public.bookings;
create policy "Users can delete their own bookings"
    on public.bookings for delete
    using (auth.uid() = client_id or auth.uid() = provider_id);
