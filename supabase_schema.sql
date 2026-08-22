-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Users table
create table if not exists public.users (
    id uuid primary key default uuid_generate_v4(),
    auth_uid uuid unique references auth.users(id) on delete cascade,
    full_name text not null,
    email text unique not null,
    role text check (role in ('client','nurse','caregiver','admin')) not null,
    phone text,
    address text,
    avatar_url text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Services table
create table if not exists public.services (
    id uuid primary key default uuid_generate_v4(),
    provider_id uuid references public.users(id) on delete cascade,
    title text not null,
    description text,
    category text not null,
    price_per_hour numeric not null check (price_per_hour >= 0),
    location text not null,
    is_active boolean default true,
    images text[] default '{}',
    availability jsonb,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Bookings table
create table if not exists public.bookings (
    id uuid primary key default uuid_generate_v4(),
    client_id uuid references public.users(id) on delete cascade,
    service_id uuid references public.services(id) on delete cascade,
    booking_date date not null,
    start_time time without time zone not null,
    end_time time without time zone not null,
    duration integer not null check (duration > 0),
    status text check (status in ('pending','confirmed','completed','cancelled')) default 'pending',
    total_price numeric not null check (total_price >= 0),
    notes text,
    created_at timestamp with time zone default now(),
    updated_at timestamp with time zone default now()
);

-- Enable Row Level Security
alter table public.users enable row level security;
alter table public.services enable row level security;
alter table public.bookings enable row level security;

-- Users table policies
create policy "Users can view their own profile"
    on public.users for select
    using (auth.uid() = auth_uid);

create policy "Users can update their own profile"
    on public.users for update
    using (auth.uid() = auth_uid);

create policy "Admins can view all users"
    on public.users for select
    using (exists (
        select 1 from public.users
        where auth_uid = auth.uid() and role = 'admin'
    ));

create policy "Admins can update all users"
    on public.users for update
    using (exists (
        select 1 from public.users
        where auth_uid = auth.uid() and role = 'admin'
    ));

-- Services table policies
create policy "Anyone can view active services"
    on public.services for select
    using (is_active = true);

create policy "Providers can insert their own services"
    on public.services for insert
    with check (auth.uid() = provider_id);

create policy "Providers can update their own services"
    on public.services for update
    using (auth.uid() = provider_id);

create policy "Providers can delete their own services"
    on public.services for delete
    using (auth.uid() = provider_id);

-- Bookings table policies
create policy "Users can view bookings where they are client or provider"
    on public.bookings for select
    using (
        exists (
            select 1 from public.services
            where services.id = bookings.service_id and services.provider_id = auth.uid()
        )
        or
        exists (
            select 1 from public.users
            where users.id = bookings.client_id and users.auth_uid = auth.uid()
        )
    );

create policy "Clients can insert bookings"
    on public.bookings for insert
    with check (
        exists (
            select 1 from public.users
            where users.id = bookings.client_id and users.auth_uid = auth.uid()
        )
    );

create policy "Users can update their own bookings"
    on public.bookings for update
    using (
        exists (
            select 1 from public.services
            where services.id = bookings.service_id and services.provider_id = auth.uid()
        )
        or
        exists (
            select 1 from public.users
            where users.id = bookings.client_id and users.auth_uid = auth.uid()
        )
    );

create policy "Users can delete their own bookings"
    on public.bookings for delete
    using (
        exists (
            select 1 from public.services
            where services.id = bookings.service_id and services.provider_id = auth.uid()
        )
        or
        exists (
            select 1 from public.users
            where users.id = bookings.client_id and users.auth_uid = auth.uid()
        )
    );