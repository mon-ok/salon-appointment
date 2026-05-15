import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export async function getSalon(salonId) {
  const { data, error } = await supabase
    .from('salons')
    .select('*')
    .eq('id', salonId)
    .single()
  if (error) throw error
  return data
}

export async function getServices(salonId) {
  const { data, error } = await supabase
    .from('services')
    .select('*')
    .eq('salon_id', salonId)
    .order('category')
  if (error) throw error
  return data
}

export async function getStaff(salonId) {
  const { data, error } = await supabase
    .from('staff')
    .select('*')
    .eq('salon_id', salonId)
    .eq('is_available', true)
  if (error) throw error
  return data
}

export async function getStaffForServices(serviceIds) {
  const { data, error } = await supabase
    .from('staff_services')
    .select('staff_id, staff(*, salon_id)')
    .in('service_id', serviceIds)
  if (error) throw error

  // Return staff who can perform ALL selected services
  const staffCounts = {}
  const staffMap = {}
  data.forEach(({ staff_id, staff }) => {
    staffCounts[staff_id] = (staffCounts[staff_id] || 0) + 1
    staffMap[staff_id] = staff
  })

  return Object.entries(staffCounts)
    .filter(([, count]) => count >= serviceIds.length)
    .map(([staffId]) => staffMap[staffId])
    .filter(Boolean)
}

export async function getStaffWithServices(salonId) {
  const { data, error } = await supabase
    .from('staff')
    .select('*, staff_services(service_id)')
    .eq('salon_id', salonId)
    .eq('is_available', true)
  if (error) throw error
  return data
}

export async function getAllBookedSlotsForDate(salonId, date) {
  const { data, error } = await supabase
    .from('appointments')
    .select('staff_id, start_time, end_time')
    .eq('salon_id', salonId)
    .eq('appointment_date', date)
    .in('status', ['pending', 'confirmed'])
  if (error) throw error
  return data
}

export async function getBookedSlots(staffId, date) {
  const { data, error } = await supabase
    .from('appointments')
    .select('start_time, end_time')
    .eq('staff_id', staffId)
    .eq('appointment_date', date)
    .in('status', ['pending', 'confirmed'])
  if (error) throw error
  return data
}

export async function getOrCreateClient(clientData) {
  const { full_name, email, phone, notes } = clientData

  const { data: existing } = await supabase
    .from('clients')
    .select('*')
    .eq('email', email)
    .single()

  if (existing) return existing

  const { data, error } = await supabase
    .from('clients')
    .insert({ full_name, email, phone, notes })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function createAppointment({ salonId, clientId, staffId, date, startTime, endTime, serviceIds, servicePrices, totalPrice, notes }) {
  const { data: appointment, error: apptError } = await supabase
    .from('appointments')
    .insert({
      salon_id: salonId,
      client_id: clientId,
      staff_id: staffId,
      appointment_date: date,
      start_time: startTime,
      end_time: endTime,
      status: 'pending',
      total_price: totalPrice,
      notes: notes || null,
    })
    .select()
    .single()

  if (apptError) throw apptError

  const apptServices = serviceIds.map((serviceId) => ({
    appointment_id: appointment.id,
    service_id: serviceId,
    price_at_booking: servicePrices[serviceId],
  }))

  const { error: svcError } = await supabase
    .from('appointment_services')
    .insert(apptServices)

  if (svcError) throw svcError

  return appointment
}

export async function getAppointments(salonId) {
  const { data, error } = await supabase
    .from('appointments')
    .select(`
      *,
      clients(full_name, email, phone),
      staff(name, role, avatar_url),
      appointment_services(service_id, price_at_booking, services(name, category))
    `)
    .eq('salon_id', salonId)
    .order('appointment_date', { ascending: true })
    .order('start_time', { ascending: true })
  if (error) throw error
  return data
}

export async function updateAppointmentStatus(appointmentId, status) {
  const { data, error } = await supabase
    .from('appointments')
    .update({ status })
    .eq('id', appointmentId)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Admin: Staff ────────────────────────────────────────────

export async function getAllStaff(salonId) {
  const { data, error } = await supabase
    .from('staff')
    .select('*, staff_services(service_id)')
    .eq('salon_id', salonId)
    .order('name')
  if (error) throw error
  return data
}

export async function createStaff({ salonId, name, role, bio }) {
  const { data, error } = await supabase
    .from('staff')
    .insert({ salon_id: salonId, name, role: role || null, bio: bio || null, is_available: true })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateStaff(id, updates) {
  const { data, error } = await supabase
    .from('staff')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

export async function setStaffServices(staffId, serviceIds) {
  await supabase.from('staff_services').delete().eq('staff_id', staffId)
  if (serviceIds.length === 0) return
  const { error } = await supabase
    .from('staff_services')
    .insert(serviceIds.map((service_id) => ({ staff_id: staffId, service_id })))
  if (error) throw error
}

// ── Admin: Services ─────────────────────────────────────────

export async function createService({ salonId, name, category, description, price, durationMinutes }) {
  const { data, error } = await supabase
    .from('services')
    .insert({
      salon_id: salonId,
      name,
      category,
      description: description || null,
      price,
      duration_minutes: durationMinutes,
    })
    .select()
    .single()
  if (error) throw error
  return data
}

export async function updateService(id, updates) {
  const { data, error } = await supabase
    .from('services')
    .update(updates)
    .eq('id', id)
    .select()
    .single()
  if (error) throw error
  return data
}

// ── Admin: Staff Availability ───────────────────────────────

export async function getStaffAvailability(staffId) {
  const { data, error } = await supabase
    .from('staff_availability')
    .select('*')
    .eq('staff_id', staffId)
  if (error) throw error
  return data
}

export async function upsertStaffAvailability(staffId, schedules) {
  await supabase.from('staff_availability').delete().eq('staff_id', staffId)
  if (schedules.length === 0) return
  const { error } = await supabase
    .from('staff_availability')
    .insert(schedules.map((s) => ({ staff_id: staffId, ...s })))
  if (error) throw error
}

// ── Admin: Recurring weekday off (staff_availability) ───────
// A weekday is "recurring off" when it has any row with is_available = false.
// We use start_time='00:00' / end_time='23:59' as the sentinel for a full-day block.

export async function setRecurringDayOff(staffId, dayOfWeek, isOff) {
  if (isOff) {
    const { error } = await supabase.from('staff_availability').upsert(
      { staff_id: staffId, day_of_week: dayOfWeek, start_time: '00:00', end_time: '23:59', is_available: false },
      { onConflict: 'staff_id,day_of_week,start_time' }
    )
    if (error) throw error
  } else {
    // Remove only the sentinel "full-day off" row; leave any real working-hours rows intact.
    const { error } = await supabase.from('staff_availability')
      .delete()
      .eq('staff_id', staffId)
      .eq('day_of_week', dayOfWeek)
      .eq('is_available', false)
    if (error) throw error
  }
}

// ── Admin: Specific date days off (staff_days_off) ──────────

export async function getStaffDaysOff(staffId) {
  const { data, error } = await supabase.from('staff_days_off').select('date').eq('staff_id', staffId)
  if (error) throw error
  return data.map((d) => d.date)
}

export async function addStaffDayOff(staffId, date) {
  const { error } = await supabase.from('staff_days_off').insert({ staff_id: staffId, date })
  if (error) throw error
}

export async function removeStaffDayOff(staffId, date) {
  const { error } = await supabase.from('staff_days_off').delete().eq('staff_id', staffId).eq('date', date)
  if (error) throw error
}
