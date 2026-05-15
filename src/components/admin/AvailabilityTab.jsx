import { useState, useEffect } from 'react'
import {
  format, startOfMonth, endOfMonth, eachDayOfInterval,
  getDay, addMonths, subMonths, isToday,
} from 'date-fns'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  getStaffAvailability, setRecurringDayOff,
  getStaffDaysOff, addStaffDayOff, removeStaffDayOff,
} from '../../lib/supabase'

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']

const selectStyle = {
  padding: '0.5rem 1rem',
  borderRadius: '0.75rem',
  border: '1px solid rgba(183,110,121,0.25)',
  background: 'rgba(255,255,255,0.7)',
  color: '#3d2c35',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '0.875rem',
  outline: 'none',
  cursor: 'pointer',
}

// A weekday is recurring-off if any of its rows has is_available = false.
function buildRecurringOff(rows) {
  const off = new Set()
  for (let i = 0; i <= 6; i++) {
    if (rows.filter((r) => r.day_of_week === i).some((r) => !r.is_available)) off.add(i)
  }
  return off
}

export default function AvailabilityTab({ staff }) {
  const [selectedId, setSelectedId] = useState(staff[0]?.id || '')
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [recurringOff, setRecurringOff] = useState(new Set()) // day_of_week values
  const [specificOff, setSpecificOff] = useState(new Set())   // 'yyyy-MM-dd' strings
  const [loading, setLoading] = useState(false)
  const [togglingDow, setTogglingDow] = useState(null)
  const [togglingDate, setTogglingDate] = useState(null)
  const [flashDow, setFlashDow] = useState(null)
  const [flashDate, setFlashDate] = useState(null)
  const [error, setError] = useState(null)

  // Reload both data sources when the selected stylist changes
  useEffect(() => {
    if (!selectedId) return
    setRecurringOff(new Set())
    setSpecificOff(new Set())
    setError(null)
    setLoading(true)
    Promise.all([getStaffAvailability(selectedId), getStaffDaysOff(selectedId)])
      .then(([availRows, datesOff]) => {
        setRecurringOff(buildRecurringOff(availRows))
        setSpecificOff(new Set(datesOff))
      })
      .catch((err) => setError(err.message || 'Failed to load. Ensure migrations 004 and 005 have been run.'))
      .finally(() => setLoading(false))
  }, [selectedId])

  // Toggle a recurring weekday off (staff_availability)
  const toggleRecurring = async (dow) => {
    if (togglingDow !== null) return
    setTogglingDow(dow)
    setError(null)
    const wasOff = recurringOff.has(dow)
    const nowOff = !wasOff
    setRecurringOff((prev) => { const n = new Set(prev); nowOff ? n.add(dow) : n.delete(dow); return n })
    try {
      await setRecurringDayOff(selectedId, dow, nowOff)
      setFlashDow(dow); setTimeout(() => setFlashDow(null), 1200)
    } catch (err) {
      setRecurringOff((prev) => { const n = new Set(prev); wasOff ? n.add(dow) : n.delete(dow); return n })
      setError(err.message || 'Failed to save recurring day off.')
    } finally {
      setTogglingDow(null)
    }
  }

  // Toggle a specific calendar date off (staff_days_off)
  const toggleDate = async (dateStr) => {
    if (togglingDate) return
    setTogglingDate(dateStr)
    setError(null)
    const wasOff = specificOff.has(dateStr)
    setSpecificOff((prev) => { const n = new Set(prev); wasOff ? n.delete(dateStr) : n.add(dateStr); return n })
    try {
      if (wasOff) await removeStaffDayOff(selectedId, dateStr)
      else await addStaffDayOff(selectedId, dateStr)
      setFlashDate(dateStr); setTimeout(() => setFlashDate(null), 1200)
    } catch (err) {
      setSpecificOff((prev) => { const n = new Set(prev); wasOff ? n.add(dateStr) : n.delete(dateStr); return n })
      setError(err.message || 'Failed to save specific day off.')
    } finally {
      setTogglingDate(null)
    }
  }

  const monthStart = startOfMonth(currentMonth)
  const days = eachDayOfInterval({ start: monthStart, end: endOfMonth(currentMonth) })
  const startOffset = getDay(monthStart)
  const selectedMember = staff.find((s) => s.id === selectedId)

  return (
    <div>
      {/* Header + staff selector */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '0.75rem' }}>
        <div>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', color: '#3d2c35', fontWeight: 600 }}>
            Availability
          </h3>
          <p style={{ fontSize: '0.8rem', color: '#9b7a84', fontFamily: "'DM Sans', sans-serif", marginTop: '0.25rem' }}>
            All staff are available by default. Mark days off below.
          </p>
        </div>
        {staff.length > 0 && (
          <select value={selectedId} onChange={(e) => setSelectedId(e.target.value)} style={selectStyle}>
            {staff.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
          </select>
        )}
      </div>

      {staff.length === 0 ? (
        <div className="glass-card rounded-2xl text-center" style={{ padding: '3rem' }}>
          <p style={{ color: '#c4a8b0', fontFamily: "'DM Sans', sans-serif" }}>No stylists yet. Add stylists first.</p>
        </div>
      ) : loading ? (
        <div style={{ textAlign: 'center', padding: '3rem', color: '#c4a8b0', fontFamily: "'DM Sans', sans-serif", fontSize: '0.85rem' }}>
          Loading…
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {error && (
            <div style={{ padding: '0.625rem 0.875rem', borderRadius: '0.625rem', background: 'rgba(232,115,90,0.1)', color: '#c4553d', fontSize: '0.8rem', fontFamily: "'DM Sans', sans-serif", border: '1px solid rgba(232,115,90,0.2)' }}>
              {error}
            </div>
          )}

          {/* ── Recurring days off ── */}
          <div className="glass-card rounded-2xl" style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ marginBottom: '0.875rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#b76e79', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: "'DM Sans', sans-serif", marginBottom: '0.2rem' }}>
                Recurring Days Off
              </p>
              <p style={{ fontSize: '0.78rem', color: '#9b7a84', fontFamily: "'DM Sans', sans-serif" }}>
                Toggle weekdays that {selectedMember?.name || 'this stylist'} never works. Applies to every week.
              </p>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {DAY_NAMES.map((name, i) => {
                const isOff = recurringOff.has(i)
                const isSaving = togglingDow === i
                const justSaved = flashDow === i
                return (
                  <button
                    key={i}
                    onClick={() => toggleRecurring(i)}
                    disabled={togglingDow !== null}
                    style={{
                      padding: '0.5rem 1rem',
                      borderRadius: '9999px',
                      border: `1px solid ${justSaved ? 'rgba(94,184,125,0.4)' : isOff ? 'rgba(232,115,90,0.35)' : 'rgba(183,110,121,0.2)'}`,
                      cursor: isSaving ? 'wait' : 'pointer',
                      fontFamily: "'DM Sans', sans-serif",
                      fontSize: '0.8rem',
                      fontWeight: 600,
                      transition: 'all 0.15s',
                      opacity: isSaving ? 0.5 : 1,
                      background: justSaved
                        ? 'rgba(94,184,125,0.12)'
                        : isOff
                          ? 'rgba(232,115,90,0.1)'
                          : 'rgba(255,255,255,0.5)',
                      color: justSaved ? '#5eb87d' : isOff ? '#e8735a' : '#9b7a84',
                    }}
                  >
                    {name.slice(0, 3)} {justSaved ? '✓' : isOff ? '✕' : ''}
                  </button>
                )
              })}
            </div>
          </div>

          {/* ── Specific date days off ── */}
          <div className="glass-card rounded-2xl" style={{ padding: '1.25rem 1.5rem' }}>
            <div style={{ marginBottom: '0.875rem' }}>
              <p style={{ fontSize: '0.7rem', fontWeight: 600, color: '#b76e79', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: "'DM Sans', sans-serif", marginBottom: '0.2rem' }}>
                Specific Dates Off
              </p>
              <p style={{ fontSize: '0.78rem', color: '#9b7a84', fontFamily: "'DM Sans', sans-serif" }}>
                Click individual dates to mark or unmark a one-time day off. Saves instantly.
              </p>
            </div>

            {/* Month nav */}
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <button onClick={() => setCurrentMonth(subMonths(currentMonth, 1))} className="glass-card rounded-full" style={{ padding: '0.4rem', border: 'none', cursor: 'pointer', display: 'flex', color: '#9b7a84' }}>
                <ChevronLeft size={16} />
              </button>
              <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', color: '#3d2c35', fontWeight: 600 }}>
                {format(currentMonth, 'MMMM yyyy')}
              </span>
              <button onClick={() => setCurrentMonth(addMonths(currentMonth, 1))} className="glass-card rounded-full" style={{ padding: '0.4rem', border: 'none', cursor: 'pointer', display: 'flex', color: '#9b7a84' }}>
                <ChevronRight size={16} />
              </button>
            </div>

            {/* Day headers */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem', marginBottom: '0.375rem' }}>
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((d) => (
                <div key={d} style={{ textAlign: 'center', fontSize: '0.68rem', fontWeight: 600, color: '#c4a8b0', fontFamily: "'DM Sans', sans-serif" }}>
                  {d}
                </div>
              ))}
            </div>

            {/* Calendar grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '0.25rem' }}>
              {Array.from({ length: startOffset }).map((_, i) => <div key={`e-${i}`} />)}

              {days.map((day) => {
                const dow = getDay(day)
                const dateStr = format(day, 'yyyy-MM-dd')
                const isRecurringOff = recurringOff.has(dow)
                const isSpecificOff = specificOff.has(dateStr)
                const isSaving = togglingDate === dateStr
                const justSaved = flashDate === dateStr
                const todayDay = isToday(day)

                // Visual priority: specific > recurring > available
                let bg, border, labelColor
                if (justSaved) {
                  bg = 'rgba(94,184,125,0.18)'; border = 'rgba(94,184,125,0.4)'; labelColor = '#5eb87d'
                } else if (isSpecificOff) {
                  bg = 'rgba(232,115,90,0.18)'; border = 'rgba(232,115,90,0.4)'; labelColor = '#e8735a'
                } else if (isRecurringOff) {
                  bg = 'rgba(232,115,90,0.07)'; border = 'rgba(232,115,90,0.2)'; labelColor = '#e8a090'
                } else if (todayDay) {
                  bg = 'rgba(183,110,121,0.07)'; border = 'rgba(183,110,121,0.35)'; labelColor = null
                } else {
                  bg = 'rgba(255,255,255,0.35)'; border = 'rgba(183,110,121,0.1)'; labelColor = null
                }

                const label = justSaved ? '✓' : isSpecificOff ? 'OFF' : isRecurringOff ? 'OFF' : null

                return (
                  <div
                    key={dateStr}
                    onClick={() => toggleDate(dateStr)}
                    title={
                      isRecurringOff && !isSpecificOff
                        ? `${DAY_NAMES[dow]} is a recurring day off — click to also mark this specific date`
                        : isSpecificOff
                          ? 'Click to remove this specific day off'
                          : 'Click to mark as a day off'
                    }
                    style={{
                      cursor: isSaving ? 'wait' : 'pointer',
                      borderRadius: '0.5rem',
                      minHeight: '3rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '0.15rem',
                      opacity: isSaving ? 0.45 : 1,
                      transition: 'all 0.12s',
                      background: bg,
                      border: `1px solid ${border}`,
                    }}
                  >
                    <span style={{
                      fontSize: '0.75rem',
                      fontWeight: todayDay ? 700 : 400,
                      color: (isSpecificOff || isRecurringOff) ? labelColor : todayDay ? '#9b4f5e' : '#3d2c35',
                      fontFamily: "'DM Sans', sans-serif",
                      lineHeight: 1,
                    }}>
                      {format(day, 'd')}
                    </span>
                    {label && (
                      <span style={{ fontSize: '0.55rem', color: labelColor, fontFamily: "'DM Sans', sans-serif", fontWeight: 700 }}>
                        {label}
                      </span>
                    )}
                  </div>
                )
              })}
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '0.875rem', justifyContent: 'flex-end' }}>
              {[
                { bg: 'rgba(255,255,255,0.35)', border: 'rgba(183,110,121,0.1)', label: 'Available' },
                { bg: 'rgba(232,115,90,0.07)', border: 'rgba(232,115,90,0.2)', label: 'Recurring off' },
                { bg: 'rgba(232,115,90,0.18)', border: 'rgba(232,115,90,0.4)', label: 'Specific date off' },
              ].map(({ bg, border, label }) => (
                <div key={label} style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.68rem', color: '#9b7a84', fontFamily: "'DM Sans', sans-serif" }}>
                  <div style={{ width: '0.8rem', height: '0.8rem', borderRadius: '0.2rem', background: bg, border: `1px solid ${border}`, flexShrink: 0 }} />
                  {label}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
