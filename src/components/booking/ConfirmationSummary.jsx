import { useState } from 'react'
import { format, addMinutes, parse } from 'date-fns'
import { Calendar, Clock, User, Scissors, DollarSign, FileText, Loader } from 'lucide-react'
import useBookingStore from '../../store/bookingStore'
import { getOrCreateClient, createAppointment } from '../../lib/supabase'
import { useNavigate } from 'react-router-dom'

function SummaryRow({ icon: Icon, label, value }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', paddingTop: '0.75rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(183,110,121,0.1)' }}>
      <div className="rounded-full" style={{ width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, marginTop: '0.125rem', background: 'rgba(183,110,121,0.1)' }}>
        <Icon size={15} color="#b76e79" />
      </div>
      <div style={{ flex: 1 }}>
        <p className="text-xs font-medium" style={{ color: '#c4a8b0', fontFamily: "'DM Sans', sans-serif", marginBottom: '0.125rem' }}>
          {label}
        </p>
        <div style={{ color: '#3d2c35', fontFamily: "'DM Sans', sans-serif", fontSize: '0.92rem' }}>
          {value}
        </div>
      </div>
    </div>
  )
}

export default function ConfirmationSummary() {
  const {
    salonId, selectedServices, selectedStaff, noPreference,
    selectedDate, selectedTime, clientDetails,
    setConfirmedAppointment, goToPrevStep, getTotalDuration, getTotalPrice,
    getServiceIds, getServicePricesMap,
  } = useBookingStore()

  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const duration = getTotalDuration()
  const totalPrice = getTotalPrice()

  const formatTime = (t) => {
    if (!t) return ''
    const [h, m] = t.split(':').map(Number)
    const d = new Date()
    d.setHours(h, m, 0)
    return format(d, 'h:mm aa')
  }

  const endTime = () => {
    if (!selectedTime) return ''
    const [h, m] = selectedTime.split(':').map(Number)
    const start = new Date()
    start.setHours(h, m, 0)
    const end = addMinutes(start, duration)
    return format(end, 'HH:mm:00')
  }

  const handleConfirm = async () => {
    setError(null)
    setSubmitting(true)
    try {
      const client = await getOrCreateClient(clientDetails)
      const appointment = await createAppointment({
        salonId,
        clientId: client.id,
        staffId: selectedStaff?.id || null,
        date: format(selectedDate, 'yyyy-MM-dd'),
        startTime: selectedTime,
        endTime: endTime(),
        serviceIds: getServiceIds(),
        servicePrices: getServicePricesMap(),
        totalPrice,
        notes: clientDetails.notes,
      })
      setConfirmedAppointment(appointment)
      navigate('/confirmation')
    } catch (err) {
      setError(err.message || 'Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: '32rem', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 className="step-title" style={{ color: '#3d2c35' }}>Review Your Booking</h2>
        <p className="text-sm" style={{ color: '#9b7a84', marginTop: '0.25rem' }}>
          Everything look good? Confirm to book your appointment.
        </p>
      </div>

      <div className="glass-card rounded-2xl overflow-hidden" style={{ marginBottom: '1rem' }}>
        {/* Header */}
        <div style={{ padding: '1rem 1.5rem', background: 'linear-gradient(135deg, rgba(183,110,121,0.1), rgba(232,115,90,0.08))' }}>
          <p className="text-xs font-medium uppercase tracking-widest" style={{ color: '#b76e79', fontFamily: "'DM Sans', sans-serif", marginBottom: '0.25rem' }}>
            Booking Summary
          </p>
          <p className="font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', color: '#3d2c35' }}>
            Lumière Studio
          </p>
        </div>

        <div style={{ paddingLeft: '1.5rem', paddingRight: '1.5rem' }}>
          <SummaryRow icon={Scissors} label="Services" value={
            <ul style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem', listStyle: 'none', padding: 0, margin: 0 }}>
              {selectedServices.map((s) => (
                <li key={s.id} style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <span>{s.name}</span>
                  <span style={{ color: '#9b4f5e', fontWeight: 500 }}>${parseFloat(s.price).toFixed(0)}</span>
                </li>
              ))}
            </ul>
          } />
          <SummaryRow icon={User} label="Stylist" value={selectedStaff ? `${selectedStaff.name} · ${selectedStaff.role}` : 'No preference — any available stylist'} />
          <SummaryRow icon={Calendar} label="Date" value={selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : '—'} />
          <SummaryRow icon={Clock} label="Time" value={selectedTime ? `${formatTime(selectedTime)} — ${formatTime(endTime())} (${duration} min)` : '—'} />
          <SummaryRow icon={User} label="Client" value={
            <div>
              <div>{clientDetails.full_name}</div>
              <div style={{ color: '#9b7a84', fontSize: '0.85rem' }}>{clientDetails.email} · {clientDetails.phone}</div>
            </div>
          } />
          {clientDetails.notes && <SummaryRow icon={FileText} label="Notes" value={clientDetails.notes} />}

          {/* Total */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '1rem', paddingBottom: '1rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <DollarSign size={16} color="#b76e79" />
              <span className="font-medium" style={{ color: '#3d2c35', fontFamily: "'DM Sans', sans-serif" }}>Total</span>
            </div>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.5rem', fontWeight: 600, color: '#9b4f5e' }}>
              ${totalPrice.toFixed(2)}
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="rounded-xl text-sm" style={{ padding: '0.75rem', marginBottom: '1rem', background: 'rgba(232,115,90,0.1)', color: '#c4553d', border: '1px solid rgba(232,115,90,0.2)' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <button className="btn-secondary" onClick={goToPrevStep} disabled={submitting}>← Back</button>
        <button className="btn-primary animate-pulse-soft" onClick={handleConfirm} disabled={submitting} style={{ minWidth: '160px', justifyContent: 'center' }}>
          {submitting ? (
            <>
              <Loader size={15} style={{ animation: 'spin 1s linear infinite' }} />
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
              Confirming…
            </>
          ) : '✦ Confirm Booking'}
        </button>
      </div>
    </div>
  )
}
