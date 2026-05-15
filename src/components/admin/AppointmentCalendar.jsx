import { useState, useMemo } from 'react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, addMonths, subMonths, isSameDay, isToday,
} from 'date-fns'
import { ChevronLeft, ChevronRight, Clock, User, Scissors } from 'lucide-react'

const STATUS_CONFIG = {
  pending:   { label: 'Pending',   color: '#f7a85e', bg: 'rgba(247,168,94,0.12)' },
  confirmed: { label: 'Confirmed', color: '#5eb87d', bg: 'rgba(94,184,125,0.12)' },
  cancelled: { label: 'Cancelled', color: '#e8735a', bg: 'rgba(232,115,90,0.12)' },
  completed: { label: 'Completed', color: '#9b7a84', bg: 'rgba(155,122,132,0.12)' },
}

export default function AppointmentCalendar({ appointments }) {
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDay, setSelectedDay] = useState(null)

  const monthStart = startOfMonth(currentMonth)
  const monthEnd = endOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startOffset = getDay(monthStart)

  const apptByDate = useMemo(() => {
    const map = {}
    appointments.forEach((a) => {
      if (!map[a.appointment_date]) map[a.appointment_date] = []
      map[a.appointment_date].push(a)
    })
    return map
  }, [appointments])

  const selectedDayKey = selectedDay ? format(selectedDay, 'yyyy-MM-dd') : null
  const selectedDayAppts = selectedDayKey ? (apptByDate[selectedDayKey] || []) : []

  return (
    <div>
      {/* Month navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <button
          onClick={() => { setSelectedDay(null); setCurrentMonth(subMonths(currentMonth, 1)) }}
          className="glass-card rounded-full"
          style={{ padding: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', color: '#9b7a84' }}
        >
          <ChevronLeft size={18} />
        </button>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', color: '#3d2c35', fontWeight: 600 }}>
          {format(currentMonth, 'MMMM yyyy')}
        </h3>
        <button
          onClick={() => { setSelectedDay(null); setCurrentMonth(addMonths(currentMonth, 1)) }}
          className="glass-card rounded-full"
          style={{ padding: '0.5rem', border: 'none', cursor: 'pointer', display: 'flex', color: '#9b7a84' }}
        >
          <ChevronRight size={18} />
        </button>
      </div>

      {/* Day-of-week headers */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', marginBottom: '0.375rem' }}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
          <div key={d} style={{ textAlign: 'center', fontSize: '0.7rem', fontWeight: 600, color: '#c4a8b0', fontFamily: "'DM Sans', sans-serif", padding: '0.25rem 0' }}>
            {d}
          </div>
        ))}
      </div>

      {/* Calendar grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
        {Array.from({ length: startOffset }).map((_, i) => <div key={`e-${i}`} />)}

        {days.map((day) => {
          const key = format(day, 'yyyy-MM-dd')
          const dayAppts = apptByDate[key] || []
          const isSelected = selectedDay && isSameDay(day, selectedDay)
          const todayDay = isToday(day)

          return (
            <div
              key={key}
              onClick={() => setSelectedDay(isSelected ? null : day)}
              style={{
                cursor: 'pointer',
                borderRadius: '0.5rem',
                padding: '0.375rem 0.25rem',
                minHeight: '3.5rem',
                background: isSelected
                  ? 'rgba(183,110,121,0.15)'
                  : todayDay
                    ? 'rgba(183,110,121,0.06)'
                    : dayAppts.length > 0
                      ? 'rgba(255,255,255,0.6)'
                      : 'rgba(255,255,255,0.3)',
                border: `1px solid ${isSelected ? 'rgba(183,110,121,0.5)' : todayDay ? 'rgba(183,110,121,0.3)' : 'rgba(183,110,121,0.1)'}`,
                display: 'flex',
                flexDirection: 'column',
                gap: '0.2rem',
                transition: 'background 0.15s',
              }}
            >
              <span style={{ fontSize: '0.75rem', fontWeight: todayDay ? 700 : 400, color: todayDay ? '#9b4f5e' : '#3d2c35', fontFamily: "'DM Sans', sans-serif", textAlign: 'center' }}>
                {format(day, 'd')}
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', gap: '0.15rem', minHeight: '0.5rem' }}>
                {dayAppts.slice(0, 4).map((a, i) => (
                  <div key={i} style={{ width: '0.42rem', height: '0.42rem', borderRadius: '50%', background: STATUS_CONFIG[a.status]?.color || '#9b7a84', flexShrink: 0 }} />
                ))}
                {dayAppts.length > 4 && <span style={{ fontSize: '0.5rem', color: '#9b7a84', lineHeight: 1.2 }}>+{dayAppts.length - 4}</span>}
              </div>
            </div>
          )
        })}
      </div>

      {/* Legend */}
      <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.75rem', justifyContent: 'flex-end' }}>
        {Object.entries(STATUS_CONFIG).map(([k, cfg]) => (
          <div key={k} style={{ display: 'flex', alignItems: 'center', gap: '0.3rem', fontSize: '0.7rem', color: '#9b7a84', fontFamily: "'DM Sans', sans-serif" }}>
            <div style={{ width: '0.5rem', height: '0.5rem', borderRadius: '50%', background: cfg.color }} />
            {cfg.label}
          </div>
        ))}
      </div>

      {/* Selected day detail */}
      {selectedDay && (
        <div style={{ marginTop: '1.5rem', borderTop: '1px solid rgba(183,110,121,0.15)', paddingTop: '1.5rem' }}>
          <h4 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem', color: '#3d2c35', marginBottom: '0.75rem', fontWeight: 600 }}>
            {format(selectedDay, 'EEEE, MMMM d, yyyy')}
          </h4>
          {selectedDayAppts.length === 0 ? (
            <p style={{ color: '#c4a8b0', fontSize: '0.85rem', textAlign: 'center', padding: '1.5rem', fontFamily: "'DM Sans', sans-serif" }}>
              No appointments on this day
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              {selectedDayAppts.map((a) => (
                <div key={a.id} className="glass-card rounded-xl" style={{ padding: '0.75rem 1rem', display: 'flex', alignItems: 'center', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <div className="rounded-full" style={{
                    width: '2rem', height: '2rem', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: '0.8rem', fontWeight: 600,
                    background: 'linear-gradient(135deg, rgba(244,194,194,0.5), rgba(247,231,206,0.7))',
                    color: '#9b4f5e', fontFamily: "'Cormorant Garamond', serif",
                  }}>
                    {a.clients?.full_name?.[0] || '?'}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <span style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 600, color: '#3d2c35', fontSize: '0.875rem' }}>
                        {a.clients?.full_name || 'Unknown'}
                      </span>
                      <span className="rounded-full" style={{
                        padding: '0.125rem 0.625rem', fontSize: '0.7rem', fontFamily: "'DM Sans', sans-serif",
                        color: STATUS_CONFIG[a.status]?.color,
                        background: STATUS_CONFIG[a.status]?.bg,
                      }}>
                        {STATUS_CONFIG[a.status]?.label}
                      </span>
                    </div>
                    <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap', marginTop: '0.2rem', fontSize: '0.75rem', color: '#9b7a84', fontFamily: "'DM Sans', sans-serif" }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Clock size={11} /> {a.start_time?.slice(0, 5)} – {a.end_time?.slice(0, 5)}
                      </span>
                      {a.staff && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                          <User size={11} /> {a.staff.name}
                        </span>
                      )}
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                        <Scissors size={11} /> {a.appointment_services?.map((s) => s.services?.name).join(', ') || '—'}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontWeight: 600, color: '#9b4f5e', flexShrink: 0 }}>
                    ${parseFloat(a.total_price || 0).toFixed(0)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
