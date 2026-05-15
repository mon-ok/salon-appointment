-- Specific dates a staff member is unavailable (days off / blocked dates)
create table if not exists staff_days_off (
  id        uuid primary key default gen_random_uuid(),
  staff_id  uuid references staff(id) on delete cascade not null,
  date      date not null,
  unique(staff_id, date)
);

create index if not exists idx_staff_days_off_staff on staff_days_off(staff_id);
create index if not exists idx_staff_days_off_date  on staff_days_off(date);

alter table staff_days_off enable row level security;

create policy "Public can read staff_days_off"
  on staff_days_off for select using (true);

create policy "Public can insert staff_days_off"
  on staff_days_off for insert with check (true);

create policy "Public can delete staff_days_off"
  on staff_days_off for delete using (true);
