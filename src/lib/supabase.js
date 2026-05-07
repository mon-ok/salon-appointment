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
