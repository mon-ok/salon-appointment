-- ============================================================
-- Prevent double-booking: reject an INSERT or UPDATE on
-- appointments when the same staff member already has a
-- pending/confirmed appointment whose time window overlaps.
--
-- Overlap condition (standard interval logic):
--   existing.start_time < new.end_time
--   AND existing.end_time > new.start_time
-- ============================================================

create or replace function prevent_double_booking()
returns trigger as $$
begin
  -- No staff assigned — nothing to check.
  if new.staff_id is null then
    return new;
  end if;

  if exists (
    select 1
    from   appointments
    where  staff_id         = new.staff_id
      and  appointment_date = new.appointment_date
      and  id              <> new.id          -- ignore self on UPDATE
      and  status          in ('pending', 'confirmed')
      and  start_time       < new.end_time    -- existing starts before new ends
      and  end_time         > new.start_time  -- existing ends after new starts
  ) then
    raise exception
      'This time slot is no longer available. Please go back and choose a different time.';
  end if;

  return new;
end;
$$ language plpgsql;

-- Drop first so re-running the migration is safe
drop trigger if exists check_double_booking on appointments;

create trigger check_double_booking
  before insert or update on appointments
  for each row
  execute function prevent_double_booking();
