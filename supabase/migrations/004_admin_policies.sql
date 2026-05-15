-- ============================================================
-- Admin write policies + staff availability schedule table
-- ============================================================

-- Weekly schedule for each staff member
create table if not exists staff_availability (
  id           uuid primary key default gen_random_uuid(),
  staff_id     uuid references staff(id) on delete cascade not null,
  day_of_week  int not null check (day_of_week between 0 and 6), -- 0=Sun … 6=Sat
  start_time   time not null default '09:00',
  end_time     time not null default '17:00',
  unique(staff_id, day_of_week)
);

create index if not exists idx_staff_availability_staff on staff_availability(staff_id);

alter table staff_availability enable row level security;

create policy "Public can read staff_availability"
  on staff_availability for select using (true);

create policy "Public can insert staff_availability"
  on staff_availability for insert with check (true);

create policy "Public can update staff_availability"
  on staff_availability for update using (true);

create policy "Public can delete staff_availability"
  on staff_availability for delete using (true);

-- Admin write access for staff
create policy "Admin can insert staff"
  on staff for insert with check (true);

create policy "Admin can update staff"
  on staff for update using (true);

-- Admin write access for services
create policy "Admin can insert services"
  on services for insert with check (true);

create policy "Admin can update services"
  on services for update using (true);

-- Admin write access for staff_services junction
create policy "Admin can insert staff_services"
  on staff_services for insert with check (true);

create policy "Admin can delete staff_services"
  on staff_services for delete using (true);
