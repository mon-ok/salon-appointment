import { useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { CheckCircle, Calendar, Clock, Scissors, User, Sparkles, Download } from 'lucide-react'
import { format, addMinutes } from 'date-fns'
import useBookingStore from '../store/bookingStore'

export default function Confirmation() {
  const {
    confirmedAppointment, selectedServices, selectedStaff, noPreference,
    selectedDate, selectedTime, clientDetails, getTotalDuration, getTotalPrice,
    resetBooking,
  } = useBookingStore()

  const navigate = useNavigate()

  useEffect(() => {
    if (!confirmedAppointment) {
      navigate('/')
    }
  }, [confirmedAppointment, navigate])

  if (!confirmedAppointment) return null

  const duration = getTotalDuration()
  const totalPrice = getTotalPrice()

  const formatTime = (t) => {
    if (!t) return ''
    const [h, m] = t.split(':').map(Number)
    const d = new Date()
    d.setHours(h, m, 0)
    return format(d, 'h:mm aa')
  }

  const getEndTime = () => {
    if (!selectedTime) return ''
    const [h, m] = selectedTime.split(':').map(Number)
    const start = new Date()
    start.setHours(h, m, 0)
    const end = addMinutes(start, duration)
    return format(end, 'h:mm aa')
  }

  const referenceNumber = confirmedAppointment.id?.split('-')[0]?.toUpperCase() || 'LMR-00001'

  return (
    <div className="gradient-mesh min-h-screen px-6 sm:px-10" style={{ width: '100%', paddingTop: '96px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: '32rem', marginLeft: 'auto', marginRight: 'auto', paddingTop: '3rem', paddingBottom: '3rem' }}>
        {/* Success Icon */}
        <div className="text-center animate-fade-in-up" style={{ marginBottom: '2rem' }}>
          <div className="inline-flex rounded-full animate-float"
            style={{
              width: '6rem', height: '6rem',
              display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
              background: 'linear-gradient(135deg, rgba(183,110,121,0.15), rgba(232,115,90,0.15))',
              border: '3px solid rgba(183,110,121,0.25)',
              marginBottom: '1rem',
            }}
          >
            <CheckCircle size={44} color="#9b4f5e" strokeWidth={1.5} />
          </div>
          <h1
            className="section-title"
            style={{ color: '#3d2c35', fontFamily: "'Cormorant Garamond', serif", marginBottom: '0.5rem' }}
          >
            You're all booked!
          </h1>
          <p className="text-sm" style={{ color: '#9b7a84' }}>
            A confirmation has been sent to <strong style={{ color: '#9b4f5e' }}>{clientDetails.email}</strong>
          </p>
        </div>

        {/* Booking Card */}
        <div className="glass-card rounded-3xl overflow-hidden animate-fade-in-up delay-200" style={{ marginBottom: '1.5rem' }}>
          {/* Ref banner */}
          <div
            className="text-center"
            style={{ background: 'linear-gradient(135deg, #b76e79, #9b4f5e)', padding: '1rem 1.5rem' }}
          >
            <p className="text-xs font-medium" style={{ color: 'rgba(255,255,255,0.7)', fontFamily: "'DM Sans', sans-serif", letterSpacing: '0.1em', marginBottom: '0.125rem' }}>
              BOOKING REFERENCE
            </p>
            <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.6rem', fontWeight: 700, color: 'white', letterSpacing: '0.1em' }}>
              #{referenceNumber}
            </p>
          </div>

          {/* Details */}
          <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              { icon: Scissors, label: 'Services', content: (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.125rem' }}>
                  {selectedServices.map((s) => (
                    <p key={s.id} className="text-sm" style={{ color: '#3d2c35' }}>{s.name}</p>
                  ))}
                </div>
              )},
              { icon: User, label: 'Stylist', content: (
                <p className="text-sm" style={{ color: '#3d2c35' }}>{selectedStaff ? selectedStaff.name : 'Any available stylist'}</p>
              )},
              { icon: Calendar, label: 'Date', content: (
                <p className="text-sm" style={{ color: '#3d2c35' }}>{selectedDate ? format(selectedDate, 'EEEE, MMMM d, yyyy') : '—'}</p>
              )},
              { icon: Clock, label: 'Time', content: (
                <p className="text-sm" style={{ color: '#3d2c35' }}>{selectedTime ? `${formatTime(selectedTime)} — ${getEndTime()} (${duration} min)` : '—'}</p>
              )},
            ].map(({ icon: Icon, label, content }) => (
              <div key={label} style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem' }}>
                <div className="rounded-full" style={{ width: '2.25rem', height: '2.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: 'rgba(183,110,121,0.1)' }}>
                  <Icon size={15} color="#b76e79" />
                </div>
                <div>
                  <p className="text-xs font-medium" style={{ color: '#c4a8b0', fontFamily: "'DM Sans', sans-serif", marginBottom: '0.25rem' }}>{label}</p>
                  {content}
                </div>
              </div>
            ))}

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid rgba(183,110,121,0.12)', paddingTop: '0.75rem' }}>
              <span className="text-sm font-medium" style={{ color: '#7d5a62', fontFamily: "'DM Sans', sans-serif" }}>Total</span>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', fontWeight: 600, color: '#9b4f5e' }}>
                ${totalPrice.toFixed(2)}
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="animate-fade-in-up delay-300" style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          <Link
            to="/"
            className="btn-secondary text-center"
            onClick={resetBooking}
            style={{ textDecoration: 'none', justifyContent: 'center' }}
          >
            Back to Home
          </Link>
          <Link
            to="/book"
            className="btn-primary text-center animate-pulse-soft"
            onClick={resetBooking}
            style={{ textDecoration: 'none', justifyContent: 'center' }}
          >
            <Sparkles size={15} /> Book Another
          </Link>
        </div>

        {/* Note */}
        <p
          className="text-center text-xs animate-fade-in-up delay-400"
          style={{ color: '#c4a8b0', marginTop: '1.5rem' }}
        >
          Need to change your appointment?{' '}
          <a href="tel:+13105550192" style={{ color: '#b76e79' }}>Call us at (310) 555-0192</a>
        </p>
      </div>
    </div>
  )
}
