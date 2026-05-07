import { useState, useEffect } from 'react'
import { format, isToday, isTomorrow, isPast } from 'date-fns'
import { Calendar, Filter, RefreshCw, Check, X, Clock, User, Scissors } from 'lucide-react'
import { getAppointments, updateAppointmentStatus } from '../lib/supabase'
import LoadingSpinner from '../components/ui/LoadingSpinner'

const SALON_ID = import.meta.env.VITE_SALON_ID || '00000000-0000-0000-0000-000000000001'

const STATUS_CONFIG = {
  pending: { label: 'Pending', color: '#f7a85e', bg: 'rgba(247,168,94,0.12)' },
  confirmed: { label: 'Confirmed', color: '#5eb87d', bg: 'rgba(94,184,125,0.12)' },
  cancelled: { label: 'Cancelled', color: '#e8735a', bg: 'rgba(232,115,90,0.12)' },
  completed: { label: 'Completed', color: '#9b7a84', bg: 'rgba(155,122,132,0.12)' },
}

function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || STATUS_CONFIG.pending
  return (
    <span
      className="px-2.5 py-0.5 rounded-full text-xs font-medium"
      style={{ color: cfg.color, background: cfg.bg, fontFamily: "'DM Sans', sans-serif" }}
    >
      {cfg.label}
    </span>
  )
}

function DateLabel({ dateStr }) {
  const d = new Date(dateStr + 'T00:00:00')
  if (isToday(d)) return <span style={{ color: '#9b4f5e', fontWeight: 600 }}>Today</span>
  if (isTomorrow(d)) return <span style={{ color: '#b76e79' }}>Tomorrow</span>
  return <span>{format(d, 'EEE, MMM d, yyyy')}</span>
}

export default function Admin() {
  const [appointments, setAppointments] = useState([])
  const [loading, setLoading] = useState(true)
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterStaff, setFilterStaff] = useState('all')
  const [updating, setUpdating] = useState(null)

  const fetchAppointments = () => {
    setLoading(true)
    getAppointments(SALON_ID)
      .then(setAppointments)
      .catch(console.error)
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    fetchAppointments()
  }, [])

  const staffList = [...new Set(appointments.map((a) => a.staff?.name).filter(Boolean))]

  const filtered = appointments.filter((a) => {
    if (filterStatus !== 'all' && a.status !== filterStatus) return false
    if (filterStaff !== 'all' && a.staff?.name !== filterStaff) return false
    return true
  })

  const handleStatusChange = async (id, newStatus) => {
    setUpdating(id)
    try {
      await updateAppointmentStatus(id, newStatus)
      setAppointments((prev) =>
        prev.map((a) => (a.id === id ? { ...a, status: newStatus } : a))
      )
    } catch (err) {
      console.error(err)
    } finally {
      setUpdating(null)
    }
  }

  // Stats
  const stats = {
    today: appointments.filter((a) => isToday(new Date(a.appointment_date + 'T00:00:00'))).length,
    pending: appointments.filter((a) => a.status === 'pending').length,
    confirmed: appointments.filter((a) => a.status === 'confirmed').length,
    total: appointments.length,
  }

  return (
    <div className="gradient-mesh min-h-screen" style={{ width: '100%', paddingTop: '96px' }}>
      <div className="px-6 sm:px-10 lg:px-16" style={{ maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto', width: '100%', paddingTop: '3rem', paddingBottom: '3rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '2rem' }}>
          <div>
            <p
              className="text-xs font-semibold uppercase tracking-widest"
              style={{ color: '#b76e79', fontFamily: "'DM Sans', sans-serif", marginBottom: '0.25rem' }}
            >
              Admin
            </p>
            <h1
              style={{
                fontFamily: "'Cormorant Garamond', serif",
                fontSize: 'clamp(1.8rem, 3vw, 2.4rem)',
                color: '#3d2c35',
                fontWeight: 600,
              }}
            >
              Appointment Dashboard
            </h1>
          </div>
          <button
            onClick={fetchAppointments}
            className="rounded-full glass-card transition-colors"
            title="Refresh"
            style={{ color: '#9b7a84', padding: '0.625rem' }}
          >
            <RefreshCw size={18} />
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: '1rem', marginBottom: '2rem' }}>
          {[
            { label: 'Today', value: stats.today, icon: Calendar, color: '#9b4f5e' },
            { label: 'Pending', value: stats.pending, icon: Clock, color: '#f7a85e' },
            { label: 'Confirmed', value: stats.confirmed, icon: Check, color: '#5eb87d' },
            { label: 'All Time', value: stats.total, icon: Scissors, color: '#b76e79' },
          ].map(({ label, value, icon: Icon, color }) => (
            <div key={label} className="glass-card rounded-2xl text-center" style={{ padding: '1rem' }}>
              <div
                className="rounded-full"
                style={{ width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', marginLeft: 'auto', marginRight: 'auto', marginBottom: '0.5rem', background: `${color}18` }}
              >
                <Icon size={18} color={color} />
              </div>
              <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.8rem', fontWeight: 700, color: '#3d2c35' }}>
                {value}
              </div>
              <div className="text-xs" style={{ color: '#9b7a84', fontFamily: "'DM Sans', sans-serif" }}>
                {label}
              </div>
            </div>
          ))}
        </div>

        {/* Filters */}
        <div className="glass-card rounded-2xl" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', alignItems: 'center' }}>
          <Filter size={15} color="#b76e79" />
          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            {['all', 'pending', 'confirmed', 'cancelled', 'completed'].map((s) => (
              <button
                key={s}
                onClick={() => setFilterStatus(s)}
                className="rounded-full text-xs font-medium transition-all"
                style={{
                  padding: '0.25rem 0.75rem',
                  background: filterStatus === s ? 'linear-gradient(135deg, #b76e79, #9b4f5e)' : 'rgba(183,110,121,0.1)',
                  color: filterStatus === s ? 'white' : '#9b7a84',
                  fontFamily: "'DM Sans', sans-serif",
                  border: 'none',
                  cursor: 'pointer',
                }}
              >
                {s.charAt(0).toUpperCase() + s.slice(1)}
              </button>
            ))}
          </div>

          {staffList.length > 0 && (
            <select
              value={filterStaff}
              onChange={(e) => setFilterStaff(e.target.value)}
              className="rounded-xl text-xs"
              style={{
                marginLeft: 'auto',
                padding: '0.25rem 0.75rem',
                border: '1px solid rgba(183,110,121,0.25)',
                background: 'rgba(255,255,255,0.7)',
                color: '#7d5a62',
                fontFamily: "'DM Sans', sans-serif",
                outline: 'none',
              }}
            >
              <option value="all">All Stylists</option>
              {staffList.map((s) => (
                <option key={s} value={s}>{s}</option>
              ))}
            </select>
          )}
        </div>

        {/* List */}
        {loading ? (
          <LoadingSpinner />
        ) : filtered.length === 0 ? (
          <div className="glass-card rounded-2xl text-center" style={{ padding: '3rem' }}>
            <Calendar size={40} color="#d4bfc4" style={{ marginLeft: 'auto', marginRight: 'auto', marginBottom: '0.75rem' }} />
            <p style={{ color: '#c4a8b0', fontFamily: "'DM Sans', sans-serif" }}>No appointments found</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {filtered.map((appt, i) => (
              <div
                key={appt.id}
                className="glass-card rounded-2xl animate-fade-in-up"
                style={{ animationDelay: `${i * 0.04}s`, padding: '1.25rem' }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', flexWrap: 'wrap' }}>
                  {/* Left: client + service info */}
                  <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flex: 1, minWidth: 0 }}>
                    <div
                      className="rounded-full font-semibold"
                      style={{
                        width: '2.5rem', height: '2.5rem', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.875rem',
                        background: 'linear-gradient(135deg, rgba(244,194,194,0.5), rgba(247,231,206,0.7))',
                        color: '#9b4f5e',
                        fontFamily: "'Cormorant Garamond', serif",
                      }}
                    >
                      {appt.clients?.full_name?.[0] || '?'}
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                        <span className="font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#3d2c35', fontSize: '1rem' }}>
                          {appt.clients?.full_name || 'Unknown Client'}
                        </span>
                        <StatusBadge status={appt.status} />
                      </div>
                      <p className="text-xs" style={{ color: '#9b7a84', marginTop: '0.125rem' }}>
                        {appt.clients?.email} · {appt.clients?.phone}
                      </p>
                      <div className="text-xs" style={{ color: '#7d5a62', display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginTop: '0.375rem' }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Calendar size={11} />
                          <DateLabel dateStr={appt.appointment_date} />
                        </span>
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Clock size={11} />
                          {appt.start_time?.slice(0, 5)} – {appt.end_time?.slice(0, 5)}
                        </span>
                        {appt.staff && (
                          <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                            <User size={11} />
                            {appt.staff.name}
                          </span>
                        )}
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <Scissors size={11} />
                          {appt.appointment_services?.map((s) => s.services?.name).join(', ') || '—'}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Right: price + actions */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', flexShrink: 0 }}>
                    <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', fontWeight: 600, color: '#9b4f5e' }}>
                      ${parseFloat(appt.total_price || 0).toFixed(0)}
                    </span>

                    {appt.status === 'pending' && (
                      <div style={{ display: 'flex', gap: '0.375rem' }}>
                        <button
                          onClick={() => handleStatusChange(appt.id, 'confirmed')}
                          disabled={updating === appt.id}
                          className="rounded-lg text-xs font-medium transition-all"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.625rem', background: 'rgba(94,184,125,0.12)', color: '#5eb87d', border: '1px solid rgba(94,184,125,0.25)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                        >
                          <Check size={11} /> Confirm
                        </button>
                        <button
                          onClick={() => handleStatusChange(appt.id, 'cancelled')}
                          disabled={updating === appt.id}
                          className="rounded-lg text-xs font-medium transition-all"
                          style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.625rem', background: 'rgba(232,115,90,0.1)', color: '#e8735a', border: '1px solid rgba(232,115,90,0.2)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                        >
                          <X size={11} /> Cancel
                        </button>
                      </div>
                    )}

                    {appt.status === 'confirmed' && (
                      <button
                        onClick={() => handleStatusChange(appt.id, 'completed')}
                        disabled={updating === appt.id}
                        className="rounded-lg text-xs font-medium transition-all"
                        style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', padding: '0.25rem 0.625rem', background: 'rgba(155,122,132,0.12)', color: '#9b7a84', border: '1px solid rgba(155,122,132,0.25)', cursor: 'pointer', fontFamily: "'DM Sans', sans-serif" }}
                      >
                        <Check size={11} /> Mark Complete
                      </button>
                    )}
                  </div>
                </div>

                {appt.notes && (
                  <p
                    className="text-xs rounded-lg"
                    style={{ marginTop: '0.75rem', padding: '0.5rem 0.75rem', background: 'rgba(183,110,121,0.06)', color: '#7d5a62', borderLeft: '2px solid rgba(183,110,121,0.3)', fontFamily: "'DM Sans', sans-serif" }}
                  >
                    📝 {appt.notes}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
