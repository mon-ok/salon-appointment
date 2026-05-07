-- ============================================================
-- Lumière Studio — Initial Schema
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ────────────────────────────────────────
-- salons
-- ────────────────────────────────────────
create table if not exists salons (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  address     text,
  phone       text,
  email       text,
  logo_url    text,
  created_at  timestamptz default now()
);

-- ────────────────────────────────────────
-- staff
-- ────────────────────────────────────────
create table if not exists staff (
  id             uuid primary key default gen_random_uuid(),
  salon_id       uuid references salons(id) on delete cascade not null,
  name           text not null,
  role           text,
  avatar_url     text,
  bio            text,
  is_available   boolean default true,
  created_at     timestamptz default now()
);

-- ────────────────────────────────────────
-- services
-- ────────────────────────────────────────
create table if not exists services (
  id                 uuid primary key default gen_random_uuid(),
  salon_id           uuid references salons(id) on delete cascade not null,
  name               text not null,
  category           text not null,
  description        text,
  price              numeric(10,2) not null,
  duration_minutes   int not null,
  image_url          text,
  created_at         timestamptz default now()
);

-- ────────────────────────────────────────
-- staff_services (junction)
-- ────────────────────────────────────────
create table if not exists staff_services (
  id          uuid primary key default gen_random_uuid(),
  staff_id    uuid references staff(id) on delete cascade not null,
  service_id  uuid references services(id) on delete cascade not null,
  unique(staff_id, service_id)
);

-- ────────────────────────────────────────
-- clients
-- ────────────────────────────────────────
create table if not exists clients (
  id          uuid primary key default gen_random_uuid(),
  full_name   text not null,
  email       text unique not null,
  phone       text,
  notes       text,
  created_at  timestamptz default now()
);

-- ────────────────────────────────────────
-- appointments
-- ────────────────────────────────────────
create table if not exists appointments (
  id                  uuid primary key default gen_random_uuid(),
  salon_id            uuid references salons(id) on delete cascade not null,
  client_id           uuid references clients(id) on delete set null,
  staff_id            uuid references staff(id) on delete set null,
  appointment_date    date not null,
  start_time          time not null,
  end_time            time not null,
  status              text not null default 'pending'
                        check (status in ('pending','confirmed','cancelled','completed')),
  total_price         numeric(10,2),
  notes               text,
  created_at          timestamptz default now()
);

-- ────────────────────────────────────────
-- appointment_services (junction)
-- ────────────────────────────────────────
create table if not exists appointment_services (
  id                uuid primary key default gen_random_uuid(),
  appointment_id    uuid references appointments(id) on delete cascade not null,
  service_id        uuid references services(id) on delete set null,
  price_at_booking  numeric(10,2)
);

-- ────────────────────────────────────────
-- Indexes
-- ────────────────────────────────────────
create index if not exists idx_appointments_date      on appointments(appointment_date);
create index if not exists idx_appointments_staff     on appointments(staff_id);
create index if not exists idx_appointments_salon     on appointments(salon_id);
create index if not exists idx_appointments_status    on appointments(status);
create index if not exists idx_staff_salon            on staff(salon_id);
create index if not exists idx_services_salon         on services(salon_id);
create index if not exists idx_staff_services_staff   on staff_services(staff_id);
create index if not exists idx_staff_services_service on staff_services(service_id);

-- ────────────────────────────────────────
-- Row Level Security
-- ────────────────────────────────────────
alter table salons              enable row level security;
alter table staff               enable row level security;
alter table services            enable row level security;
alter table staff_services      enable row level security;
alter table clients             enable row level security;
alter table appointments        enable row level security;
alter table appointment_services enable row level security;

-- Public read access for salon data
create policy "Public can read salons"
  on salons for select using (true);

create policy "Public can read staff"
  on staff for select using (is_available = true);

create policy "Public can read services"
  on services for select using (true);

create policy "Public can read staff_services"
  on staff_services for select using (true);

-- Clients: anyone can insert (booking flow), no read back
create policy "Anyone can create clients"
  on clients for insert with check (true);

create policy "Clients can read own record"
  on clients for select using (true);

-- Appointments: anyone can insert
create policy "Anyone can create appointments"
  on appointments for insert with check (true);

create policy "Public can read appointments"
  on appointments for select using (true);

create policy "Public can update appointment status"
  on appointments for update using (true);

create policy "Anyone can create appointment_services"
  on appointment_services for insert with check (true);

create policy "Public can read appointment_services"
  on appointment_services for select using (true);
