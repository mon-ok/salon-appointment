import { useState, useEffect, useMemo } from 'react'
import { ChevronLeft, ChevronRight, Check, User, Calendar, Clock, Sparkles, AlarmClock } from 'lucide-react'
import {
  addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday, format,
} from 'date-fns'
import useBookingStore from '../../store/bookingStore'
import { getServices, getStaffWithServices, getAllBookedSlotsForDate } from '../../lib/supabase'
import LoadingSpinner from '../ui/LoadingSpinner'

const BUSINESS_START = 9 * 60
const BUSINESS_END = 19 * 60
const SLOT_INTERVAL = 30

function generateTimeSlots(duration) {
  const slots = []
  let current = BUSINESS_START
  const endLimit = BUSINESS_END - duration
  while (current <= endLimit) {
    const h = Math.floor(current / 60)
    const m = current % 60
    const ampm = h >= 12 ? 'PM' : 'AM'
    const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
    const label = `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
    slots.push({ value: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`, label })
    current += SLOT_INTERVAL
  }
  return slots
}

function hasFreeSlot(bookedSlots, duration) {
  let current = BUSINESS_START
  const endLimit = BUSINESS_END - duration
  while (current <= endLimit) {
    const slotEnd = current + duration
    const blocked = bookedSlots.some(({ start_time, end_time }) => {
      const [bsh, bsm] = start_time.split(':').map(Number)
      const [beh, bem] = end_time.split(':').map(Number)
      return current < (beh * 60 + bem) && slotEnd > (bsh * 60 + bsm)
    })
    if (!blocked) return true
    current += SLOT_INTERVAL
  }
  return false
}

function isSlotBlocked(slotTime, duration, bookedSlots) {
  const [sh, sm] = slotTime.split(':').map(Number)
  const start = sh * 60 + sm
  const end = start + duration
  return bookedSlots.some(({ start_time, end_time }) => {
    const [bsh, bsm] = start_time.split(':').map(Number)
    const [beh, bem] = end_time.split(':').map(Number)
    return start < (beh * 60 + bem) && end > (bsh * 60 + bsm)
  })
}

function formatTime(value) {
  if (!value) return ''
  const [h, m] = value.split(':').map(Number)
  const ampm = h >= 12 ? 'PM' : 'AM'
  const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h
  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`
}

const PANEL_LABEL = {
  color: '#b76e79',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '0.68rem',
  fontWeight: 700,
  letterSpacing: '0.1em',
  textTransform: 'uppercase',
  marginBottom: '0.65rem',
}

export default function AvailabilityGrid() {
  const {
    salonId,
    selectedServices, toggleService,
    selectedStaff, noPreference, setSelectedStaff, setNoPreference, assignStaff,
    selectedDate, setSelectedDate,
    selectedTime, setSelectedTime,
    goToNextStep, getTotalDuration,
  } = useBookingStore()

  const [viewMonth, setViewMonth] = useState(() => selectedDate ? new Date(selectedDate) : new Date())
  const [allServices, setAllServices] = useState([])
  const [staffList, setStaffList] = useState([])
  const [bookedSlotsMap, setBookedSlotsMap] = useState({})
  const [loadingInit, setLoadingInit] = useState(true)
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [activeCategory, setActiveCategory] = useState('All')

  const duration = getTotalDuration()

  useEffect(() => {
    if (!salonId) return
    Promise.all([getServices(salonId), getStaffWithServices(salonId)])
      .then(([services, staff]) => {
        setAllServices(services)
        setStaffList(staff)
      })
      .finally(() => setLoadingInit(false))
  }, [salonId])

  useEffect(() => {
    if (!selectedDate || !salonId) return
    setLoadingSlots(true)
    getAllBookedSlotsForDate(salonId, format(selectedDate, 'yyyy-MM-dd'))
      .then((rows) => {
        const map = {}
        rows.forEach(({ staff_id, start_time, end_time }) => {
          if (!map[staff_id]) map[staff_id] = []
          map[staff_id].push({ start_time, end_time })
        })
        setBookedSlotsMap(map)
      })
      .finally(() => setLoadingSlots(false))
  }, [selectedDate, salonId])

  const serviceAvailability = useMemo(() => {
    if (!selectedDate) return {}
    const result = {}
    allServices.forEach((svc) => {
      const capable = staffList.filter((st) =>
        st.staff_services.some((ss) => ss.service_id === svc.id)
      )
      result[svc.id] = capable.length > 0 && capable.some((st) =>
        hasFreeSlot(bookedSlotsMap[st.id] || [], svc.duration_minutes)
      )
    })
    return result
  }, [selectedDate, allServices, staffList, bookedSlotsMap])

  const availableStaff = useMemo(() => {
    if (!selectedDate || selectedServices.length === 0) return []
    const serviceIds = selectedServices.map((s) => s.id)
    return staffList.filter((st) => {
      const canDoAll = serviceIds.every((sid) =>
        st.staff_services.some((ss) => ss.service_id === sid)
      )
      if (!canDoAll) return false
      return hasFreeSlot(bookedSlotsMap[st.id] || [], duration)
    })
  }, [selectedDate, selectedServices, staffList, bookedSlotsMap, duration])

  useEffect(() => {
    if (selectedStaff && !availableStaff.some((s) => s.id === selectedStaff.id)) {
      setNoPreference()
    }
  }, [availableStaff, selectedStaff, setNoPreference])

  // For a named stylist, use their booked slots directly.
  // For "any stylist", slot blocking is computed per-stylist in the time grid render.
  const staffBookedSlots = !noPreference && selectedStaff ? (bookedSlotsMap[selectedStaff.id] || []) : []
  const timeSlots = duration > 0 ? generateTimeSlots(duration) : []

  const categories = useMemo(
    () => ['All', ...new Set(allServices.map((s) => s.category))],
    [allServices]
  )
  const filteredServices = activeCategory === 'All'
    ? allServices
    : allServices.filter((s) => s.category === activeCategory)

  const monthStart = startOfMonth(viewMonth)
  const monthEnd = endOfMonth(viewMonth)
  const days = eachDayOfInterval({
    start: startOfWeek(monthStart, { weekStartsOn: 0 }),
    end: endOfWeek(monthEnd, { weekStartsOn: 0 }),
  })

  const isDisabledDay = (day) => {
    const today = new Date(); today.setHours(0, 0, 0, 0)
    return day < today || !isSameMonth(day, viewMonth)
  }

  const totalPrice = selectedServices.reduce((sum, s) => sum + parseFloat(s.price || 0), 0)
  const canContinue = !!(selectedDate && selectedServices.length > 0 && selectedTime && (selectedStaff || noPreference))
  const showStaffTime = selectedServices.length > 0

  if (loadingInit) return <LoadingSpinner />

  return (
    <div className="animate-fade-in-up">
      <div style={{ marginBottom: '1.25rem' }}>
        <h2 className="step-title" style={{ color: '#3d2c35' }}>When would you like to come in?</h2>
        <p className="text-sm" style={{ color: '#9b7a84', marginTop: '0.25rem' }}>
          Pick a date, choose your services, then select a time
        </p>
      </div>

      {/* ── 4-column grid: Calendar | Services | Stylist | Time ── */}
      <div className="grid grid-cols-1 lg:grid-cols-9" style={{ gap: '1rem', alignItems: 'start' }}>

        {/* ── Column 1: Calendar ── */}
        <div className="lg:col-span-2 glass-card rounded-2xl" style={{ padding: '1.1rem' }}>
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.85rem' }}>
            <NavBtn onClick={() => setViewMonth(subMonths(viewMonth, 1))}><ChevronLeft size={16} /></NavBtn>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.05rem', fontWeight: 600, color: '#3d2c35' }}>
              {format(viewMonth, 'MMMM yyyy')}
            </span>
            <NavBtn onClick={() => setViewMonth(addMonths(viewMonth, 1))}><ChevronRight size={16} /></NavBtn>
          </div>

          {/* Weekday labels */}
          <div className="grid grid-cols-7" style={{ marginBottom: '0.2rem' }}>
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((d) => (
              <div key={d} className="text-center" style={{ fontSize: '0.65rem', fontWeight: 600, color: '#c4a8b0', fontFamily: "'DM Sans', sans-serif", padding: '0.2rem 0', letterSpacing: '0.05em' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7" style={{ gap: '0.1rem' }}>
            {days.map((day) => {
              const disabled = isDisabledDay(day)
              const selected = selectedDate && isSameDay(day, selectedDate)
              const outside = !isSameMonth(day, viewMonth)
              return (
                <button
                  key={day.toString()}
                  onClick={() => !disabled && setSelectedDate(day)}
                  disabled={disabled}
                  className={`calendar-day text-sm font-medium w-full ${selected ? 'selected' : ''} ${isToday(day) && !selected ? 'today' : ''} ${disabled ? 'disabled' : ''}`}
                  style={{
                    opacity: outside ? 0 : 1,
                    pointerEvents: outside ? 'none' : 'auto',
                    fontFamily: "'DM Sans', sans-serif",
                    fontSize: '0.8rem',
                    color: disabled && !outside ? '#d4bfc4' : '#3d2c35',
                    paddingTop: '0.3rem',
                    paddingBottom: '0.3rem',
                    background: 'transparent',
                    border: 'none',
                    cursor: disabled ? 'not-allowed' : 'pointer',
                  }}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>

          {selectedDate && (
            <div style={{ marginTop: '0.85rem', paddingTop: '0.85rem', borderTop: '1px solid rgba(183,110,121,0.15)', textAlign: 'center' }}>
              <p style={{ fontSize: '0.8rem', fontWeight: 500, color: '#9b4f5e', fontFamily: "'DM Sans', sans-serif" }}>
                {format(selectedDate, 'EEE, MMM d')}
              </p>
            </div>
          )}
        </div>

        {/* ── Column 2: Services ── */}
        <div className="lg:col-span-3 glass-card rounded-2xl" style={{ padding: '1.1rem', display: 'flex', flexDirection: 'column' }}>
          <p style={PANEL_LABEL}>Services</p>

          {!selectedDate ? (
            <Placeholder icon={<Calendar size={28} />} text="Pick a date to see available services" />
          ) : loadingSlots ? (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flex: 1, minHeight: '8rem' }}>
              <LoadingSpinner size="sm" />
            </div>
          ) : (
            <>
              {/* Category tabs */}
              {categories.length > 2 && (
                <div className="overflow-x-auto scrollbar-hide" style={{ display: 'flex', gap: '0.35rem', marginBottom: '0.65rem', paddingBottom: '0.1rem', flexShrink: 0 }}>
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      onClick={() => setActiveCategory(cat)}
                      className={`category-tab rounded-full text-xs font-medium ${activeCategory === cat ? 'active' : ''}`}
                      style={{
                        padding: '0.25rem 0.75rem',
                        border: activeCategory === cat ? 'none' : '1px solid rgba(183,110,121,0.3)',
                        color: activeCategory === cat ? 'white' : '#9b7a84',
                        whiteSpace: 'nowrap',
                        fontFamily: "'DM Sans', sans-serif",
                        background: activeCategory === cat ? undefined : 'transparent',
                        cursor: 'pointer',
                      }}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              )}

              {/* Service list — scrolls internally */}
              <div className="scrollbar-hide" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.35rem', maxHeight: 'min(380px, 48vh)' }}>
                {filteredServices.map((svc) => {
                  const unavailable = selectedDate && serviceAvailability[svc.id] === false
                  const available = !unavailable
                  const selected = selectedServices.some((s) => s.id === svc.id)
                  return (
                    <div
                      key={svc.id}
                      onClick={() => available && toggleService(svc)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.65rem',
                        padding: '0.6rem 0.75rem',
                        borderRadius: '10px',
                        border: `1.5px solid ${selected ? '#b76e79' : unavailable ? 'rgba(183,110,121,0.1)' : 'rgba(183,110,121,0.2)'}`,
                        background: selected ? 'rgba(183,110,121,0.06)' : 'transparent',
                        cursor: available ? 'pointer' : 'not-allowed',
                        opacity: unavailable ? 0.4 : 1,
                        transition: 'all 0.18s ease',
                        flexShrink: 0,
                      }}
                      onMouseOver={(e) => { if (available && !selected) e.currentTarget.style.borderColor = 'rgba(183,110,121,0.45)' }}
                      onMouseOut={(e) => { if (available && !selected) e.currentTarget.style.borderColor = 'rgba(183,110,121,0.2)' }}
                    >
                      <div style={{
                        width: '1.1rem', height: '1.1rem', borderRadius: '50%', flexShrink: 0,
                        border: selected ? 'none' : '1.5px solid rgba(183,110,121,0.4)',
                        background: selected ? 'linear-gradient(135deg, #b76e79, #9b4f5e)' : 'transparent',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        transition: 'all 0.18s ease',
                      }}>
                        {selected && <Check size={8} color="white" strokeWidth={3} />}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.855rem', fontWeight: 500, color: '#3d2c35' }}>
                          {svc.name}
                        </p>
                        {unavailable && (
                          <p style={{ fontSize: '0.7rem', color: '#c4a8b0', marginTop: '0.05rem' }}>Not available today</p>
                        )}
                      </div>

                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1rem', fontWeight: 600, color: '#9b4f5e' }}>
                          ${parseFloat(svc.price).toFixed(0)}
                        </p>
                        <p style={{ fontSize: '0.68rem', color: '#b76e79', display: 'flex', alignItems: 'center', gap: '0.15rem', justifyContent: 'flex-end' }}>
                          <Clock size={8} /> {svc.duration_minutes}m
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            </>
          )}
        </div>

        {/* ── Column 3: Stylist ── */}
        <div
          className={`glass-card rounded-2xl lg:col-span-2 ${showStaffTime ? '' : 'hidden lg:block'}`}
          style={{ padding: '1.1rem' }}
        >
          <p style={PANEL_LABEL}>Stylist</p>

          {!selectedDate || !showStaffTime ? (
            <Placeholder icon={<User size={22} />} text={!selectedDate ? 'Pick a date first' : 'Select services first'} compact />
          ) : availableStaff.length === 0 ? (
            <p style={{ fontSize: '0.78rem', color: '#c4a8b0', fontFamily: "'DM Sans', sans-serif", fontStyle: 'italic', lineHeight: 1.4 }}>
              No stylist available for this combination — try a different date or fewer services.
            </p>
          ) : (
            <div className="scrollbar-hide" style={{ overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.3rem', maxHeight: 'min(340px, 44vh)' }}>
              <StaffRow
                label="Any stylist"
                subtitle={`${availableStaff.length} free`}
                selected={noPreference}
                onClick={setNoPreference}
                icon={<User size={13} color={noPreference ? 'white' : '#b76e79'} />}
                avatarGradient={noPreference}
              />
              {availableStaff.map((st) => {
                const sel = !noPreference && selectedStaff?.id === st.id
                return (
                  <StaffRow
                    key={st.id}
                    label={st.name}
                    subtitle={st.role}
                    selected={sel}
                    onClick={() => setSelectedStaff(st)}
                    avatarUrl={st.avatar_url}
                    initials={st.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                    avatarGradient={sel}
                  />
                )
              })}
            </div>
          )}
        </div>

        {/* ── Column 4: Time ── */}
        <div
          className={`glass-card rounded-2xl lg:col-span-2 ${(selectedStaff || noPreference) && showStaffTime ? '' : 'hidden lg:block'}`}
          style={{ padding: '1.1rem' }}
        >
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '0.4rem', marginBottom: '0.65rem' }}>
            <p style={{ ...PANEL_LABEL, marginBottom: 0 }}>Time</p>
            {duration > 0 && showStaffTime && (
              <span style={{ fontSize: '0.68rem', color: '#c4a8b0', fontFamily: "'DM Sans', sans-serif" }}>· {duration} min</span>
            )}
          </div>

          {!(selectedStaff || noPreference) || !showStaffTime || availableStaff.length === 0 ? (
            <Placeholder icon={<AlarmClock size={22} />} text="Pick a stylist to see times" compact />
          ) : (
            <div className="grid grid-cols-2 scrollbar-hide" style={{ gap: '0.3rem', overflowY: 'auto', maxHeight: 'min(340px, 44vh)' }}>
              {timeSlots.map(({ value, label }) => {
                // "Any stylist": blocked only if every available stylist is busy at this time.
                // Named stylist: blocked if that specific stylist is busy.
                const blocked = noPreference
                  ? availableStaff.every((st) => isSlotBlocked(value, duration, bookedSlotsMap[st.id] || []))
                  : isSlotBlocked(value, duration, staffBookedSlots)
                const sel = selectedTime === value
                return (
                  <button
                    key={value}
                    disabled={blocked}
                    onClick={() => {
                      if (blocked) return
                      if (noPreference) {
                        // Assign the first stylist who is actually free at this time.
                        const freeStaff = availableStaff.find(
                          (st) => !isSlotBlocked(value, duration, bookedSlotsMap[st.id] || [])
                        )
                        if (freeStaff) assignStaff(freeStaff)
                      }
                      setSelectedTime(value)
                    }}
                    className={`time-slot rounded-lg text-center ${sel ? 'selected' : ''}`}
                    style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.75rem', paddingTop: '0.4rem', paddingBottom: '0.4rem' }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* ── Summary + CTA ── */}
      <div
        className="glass-card rounded-2xl"
        style={{
          marginTop: '1rem',
          padding: '0.85rem 1.1rem',
          display: 'flex',
          flexWrap: 'wrap',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '0.65rem',
          opacity: selectedServices.length > 0 ? 1 : 0,
          pointerEvents: selectedServices.length > 0 ? 'auto' : 'none',
          transition: 'opacity 0.3s ease',
        }}
      >
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem 1rem', fontSize: '0.82rem', color: '#7d5a62', alignItems: 'center' }}>
          <span><strong style={{ color: '#3d2c35' }}>{selectedServices.length}</strong> service{selectedServices.length !== 1 ? 's' : ''}</span>
          {duration > 0 && <><span style={{ color: '#d4bfc4' }}>·</span><span>{duration} min</span></>}
          <span style={{ color: '#d4bfc4' }}>·</span>
          <span>from <strong style={{ color: '#9b4f5e' }}>${totalPrice.toFixed(0)}</strong></span>
          {selectedDate && <><span style={{ color: '#d4bfc4' }}>·</span><span>{format(selectedDate, 'MMM d')}</span></>}
          {selectedTime && <><span style={{ color: '#d4bfc4' }}>·</span><span>{formatTime(selectedTime)}</span></>}
        </div>
        <button className="btn-primary" onClick={goToNextStep} disabled={!canContinue} style={{ padding: '0.65rem 1.6rem' }}>
          <Sparkles size={14} />
          {canContinue ? 'Continue' : 'Complete selection above'}
        </button>
      </div>
    </div>
  )
}

function NavBtn({ onClick, children }) {
  return (
    <button
      onClick={onClick}
      style={{ padding: '0.35rem', color: '#9b7a84', background: 'transparent', border: 'none', cursor: 'pointer', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
      onMouseOver={(e) => { e.currentTarget.style.background = 'rgba(183,110,121,0.1)' }}
      onMouseOut={(e) => { e.currentTarget.style.background = 'transparent' }}
    >
      {children}
    </button>
  )
}

function Placeholder({ icon, text, compact }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '0.5rem', color: '#d4bfc4', minHeight: compact ? '4rem' : '8rem' }}>
      {icon}
      <p style={{ fontSize: '0.78rem', fontFamily: "'DM Sans', sans-serif", textAlign: 'center', lineHeight: 1.4 }}>{text}</p>
    </div>
  )
}

function StaffRow({ label, subtitle, selected, onClick, icon, avatarUrl, initials, avatarGradient }) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.55rem',
        padding: '0.5rem 0.6rem', borderRadius: '10px', cursor: 'pointer',
        border: `1.5px solid ${selected ? '#b76e79' : 'rgba(183,110,121,0.2)'}`,
        background: selected ? 'rgba(183,110,121,0.06)' : 'transparent',
        transition: 'all 0.18s ease',
        flexShrink: 0,
      }}
      onMouseOver={(e) => { if (!selected) e.currentTarget.style.borderColor = 'rgba(183,110,121,0.45)' }}
      onMouseOut={(e) => { if (!selected) e.currentTarget.style.borderColor = 'rgba(183,110,121,0.2)' }}
    >
      <div style={{
        width: '1.75rem', height: '1.75rem', borderRadius: '50%', flexShrink: 0,
        background: avatarGradient ? 'linear-gradient(135deg, #b76e79, #9b4f5e)' : 'rgba(183,110,121,0.12)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        overflow: 'hidden',
        border: selected ? '1.5px solid #b76e79' : '1.5px solid rgba(255,255,255,0.8)',
      }}>
        {avatarUrl ? (
          <img src={avatarUrl} alt={label} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
        ) : icon ? icon : (
          <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '0.65rem', fontWeight: 600, color: avatarGradient ? 'white' : '#b76e79' }}>
            {initials}
          </span>
        )}
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '0.8rem', fontWeight: 500, color: '#3d2c35', lineHeight: 1.2 }}>{label}</p>
        {subtitle && <p style={{ fontSize: '0.68rem', color: '#9b7a84', marginTop: '0.05rem' }}>{subtitle}</p>}
      </div>

      <div style={{
        width: '0.85rem', height: '0.85rem', borderRadius: '50%', flexShrink: 0,
        border: `1.5px solid ${selected ? '#b76e79' : 'rgba(183,110,121,0.3)'}`,
        background: selected ? '#b76e79' : 'transparent',
        transition: 'all 0.18s ease',
      }} />
    </div>
  )
}
