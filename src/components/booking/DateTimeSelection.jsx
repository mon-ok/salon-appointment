import { useState, useEffect } from 'react'
import { ChevronLeft, ChevronRight, Clock, Calendar } from 'lucide-react'
import {
  addMonths, subMonths, startOfMonth, endOfMonth, startOfWeek, endOfWeek,
  eachDayOfInterval, isSameMonth, isSameDay, isToday, isPast, format, addMinutes, parseISO, isBefore,
} from 'date-fns'
import useBookingStore from '../../store/bookingStore'
import { getBookedSlots, getStaff } from '../../lib/supabase'
import LoadingSpinner from '../ui/LoadingSpinner'

const BUSINESS_START = 9   // 9:00 AM
const BUSINESS_END = 19    // 7:00 PM
const SLOT_INTERVAL = 30   // minutes

function generateTimeSlots(duration) {
  const slots = []
  let current = BUSINESS_START * 60
  const end = BUSINESS_END * 60 - duration

  while (current <= end) {
    const h = Math.floor(current / 60)
    const m = current % 60
    const label = `${h > 12 ? h - 12 : h === 0 ? 12 : h}:${m.toString().padStart(2, '0')} ${h >= 12 ? 'PM' : 'AM'}`
    slots.push({ value: `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:00`, label })
    current += SLOT_INTERVAL
  }
  return slots
}

function isSlotBlocked(slotTime, duration, bookedSlots) {
  const [sh, sm] = slotTime.split(':').map(Number)
  const slotStart = sh * 60 + sm
  const slotEnd = slotStart + duration

  return bookedSlots.some(({ start_time, end_time }) => {
    const [bsh, bsm] = start_time.split(':').map(Number)
    const [beh, bem] = end_time.split(':').map(Number)
    const bookedStart = bsh * 60 + bsm
    const bookedEnd = beh * 60 + bem
    return slotStart < bookedEnd && slotEnd > bookedStart
  })
}

export default function DateTimeSelection() {
  const {
    salonId, selectedServices, selectedStaff, noPreference,
    selectedDate, selectedTime, setSelectedDate, setSelectedTime,
    goToNextStep, goToPrevStep, getTotalDuration,
  } = useBookingStore()

  const [viewMonth, setViewMonth] = useState(new Date())
  const [bookedSlots, setBookedSlots] = useState([])
  const [loadingSlots, setLoadingSlots] = useState(false)
  const [anyStaffId, setAnyStaffId] = useState(null)

  const duration = getTotalDuration()
  const timeSlots = generateTimeSlots(duration)

  // If "no preference", pick first available staff
  useEffect(() => {
    if (!noPreference) return
    getStaff(salonId).then((staff) => {
      if (staff.length > 0) setAnyStaffId(staff[0].id)
    })
  }, [noPreference, salonId])

  const effectiveStaffId = selectedStaff?.id || anyStaffId

  useEffect(() => {
    if (!selectedDate || !effectiveStaffId) return
    setLoadingSlots(true)
    getBookedSlots(effectiveStaffId, format(selectedDate, 'yyyy-MM-dd'))
      .then(setBookedSlots)
      .finally(() => setLoadingSlots(false))
  }, [selectedDate, effectiveStaffId])

  // Calendar grid
  const monthStart = startOfMonth(viewMonth)
  const monthEnd = endOfMonth(viewMonth)
  const calStart = startOfWeek(monthStart, { weekStartsOn: 0 })
  const calEnd = endOfWeek(monthEnd, { weekStartsOn: 0 })
  const days = eachDayOfInterval({ start: calStart, end: calEnd })
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const isDisabledDay = (day) => {
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    return day < today || !isSameMonth(day, viewMonth)
  }

  return (
    <div className="animate-fade-in-up">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 className="step-title" style={{ color: '#3d2c35' }}>Pick a Date & Time</h2>
        <p className="text-sm" style={{ color: '#9b7a84', marginTop: '0.25rem' }}>
          Estimated session: <strong style={{ color: '#9b4f5e' }}>{duration} min</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-5" style={{ gap: '1.5rem' }}>
        {/* Calendar */}
        <div className="lg:col-span-3 glass-card rounded-2xl" style={{ padding: '1.25rem' }}>
          {/* Month nav */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
            <button onClick={() => setViewMonth(subMonths(viewMonth, 1))} className="rounded-full transition-colors" style={{ padding: '0.5rem', color: '#9b7a84' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(183,110,121,0.1)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
              <ChevronLeft size={18} />
            </button>
            <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', fontWeight: 600, color: '#3d2c35' }}>
              {format(viewMonth, 'MMMM yyyy')}
            </span>
            <button onClick={() => setViewMonth(addMonths(viewMonth, 1))} className="rounded-full transition-colors" style={{ padding: '0.5rem', color: '#9b7a84' }}
              onMouseOver={(e) => e.currentTarget.style.background = 'rgba(183,110,121,0.1)'}
              onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
              <ChevronRight size={18} />
            </button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-7" style={{ marginBottom: '0.5rem' }}>
            {weekDays.map((d) => (
              <div key={d} className="text-center text-xs font-medium" style={{ color: '#c4a8b0', fontFamily: "'DM Sans', sans-serif", paddingTop: '0.25rem', paddingBottom: '0.25rem' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Days */}
          <div className="grid grid-cols-7" style={{ gap: '0.25rem' }}>
            {days.map((day) => {
              const disabled = isDisabledDay(day)
              const selected = selectedDate && isSameDay(day, selectedDate)
              const todayDay = isToday(day)
              const outsideMonth = !isSameMonth(day, viewMonth)
              return (
                <button
                  key={day.toString()}
                  onClick={() => !disabled && setSelectedDate(day)}
                  disabled={disabled}
                  className={`calendar-day text-sm font-medium w-full ${selected ? 'selected' : ''} ${todayDay && !selected ? 'today' : ''} ${disabled ? 'disabled' : ''}`}
                  style={{ opacity: outsideMonth ? 0 : 1, pointerEvents: outsideMonth ? 'none' : 'auto', fontFamily: "'DM Sans', sans-serif", color: disabled && !outsideMonth ? '#d4bfc4' : '#3d2c35', paddingTop: '0.375rem', paddingBottom: '0.375rem' }}
                >
                  {format(day, 'd')}
                </button>
              )
            })}
          </div>
        </div>

        {/* Time Slots */}
        <div className="lg:col-span-2 glass-card rounded-2xl" style={{ padding: '1.25rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <Clock size={16} color="#b76e79" />
            <span className="font-medium text-sm" style={{ fontFamily: "'DM Sans', sans-serif", color: '#3d2c35' }}>
              {selectedDate ? format(selectedDate, 'EEE, MMM d') : 'Select a date first'}
            </span>
          </div>

          {!selectedDate && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '12rem', gap: '0.5rem', color: '#d4bfc4' }}>
              <Calendar size={32} />
              <p className="text-sm text-center">Choose a date to see available times</p>
            </div>
          )}

          {selectedDate && loadingSlots && (
            <div style={{ height: '12rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <LoadingSpinner size="sm" />
            </div>
          )}

          {selectedDate && !loadingSlots && (
            <div className="grid grid-cols-2 overflow-y-auto scrollbar-hide" style={{ gap: '0.5rem', maxHeight: '18rem' }}>
              {timeSlots.map(({ value, label }) => {
                const blocked = isSlotBlocked(value, duration, bookedSlots)
                const selected = selectedTime === value
                return (
                  <button
                    key={value}
                    disabled={blocked}
                    onClick={() => !blocked && setSelectedTime(value)}
                    className={`time-slot rounded-xl text-sm text-center ${selected ? 'selected' : ''}`}
                    style={{ fontFamily: "'DM Sans', sans-serif", paddingTop: '0.5rem', paddingBottom: '0.5rem' }}
                  >
                    {label}
                  </button>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', marginTop: '1.5rem' }}>
        <button className="btn-secondary" onClick={goToPrevStep}>← Back</button>
        <button className="btn-primary" onClick={goToNextStep} disabled={!selectedDate || !selectedTime}>
          Your Details <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
