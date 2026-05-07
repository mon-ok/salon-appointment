import { useEffect } from 'react'
import useBookingStore, { STEPS } from '../store/bookingStore'
import ProgressBar from '../components/ui/ProgressBar'
import ServiceSelection from '../components/booking/ServiceSelection'
import StaffSelection from '../components/booking/StaffSelection'
import DateTimeSelection from '../components/booking/DateTimeSelection'
import ClientDetails from '../components/booking/ClientDetails'
import ConfirmationSummary from '../components/booking/ConfirmationSummary'

const SALON_ID = import.meta.env.VITE_SALON_ID || '00000000-0000-0000-0000-000000000001'

const STEP_COMPONENTS = {
  [STEPS.SERVICES]: ServiceSelection,
  [STEPS.STAFF]: StaffSelection,
  [STEPS.DATETIME]: DateTimeSelection,
  [STEPS.DETAILS]: ClientDetails,
  [STEPS.SUMMARY]: ConfirmationSummary,
}

export default function Booking() {
  const { currentStep, salonId, setSalon } = useBookingStore()

  useEffect(() => {
    if (!salonId) {
      setSalon({ id: SALON_ID, name: 'Lumière Studio' })
    }
  }, [salonId, setSalon])

  const StepComponent = STEP_COMPONENTS[currentStep] || ServiceSelection

  return (
    <div className="gradient-mesh min-h-screen" style={{ width: '100%', paddingTop: '96px' }}>
      <div className="px-6 sm:px-10 lg:px-16" style={{ maxWidth: '56rem', marginLeft: 'auto', marginRight: 'auto', width: '100%', paddingBottom: '3rem' }}>
        {/* Header */}
        <div className="text-center" style={{ marginBottom: '2rem' }}>
          <p
            className="text-xs font-semibold uppercase tracking-widest"
            style={{ color: '#b76e79', fontFamily: "'DM Sans', sans-serif", marginBottom: '0.5rem' }}
          >
            Lumière Studio
          </p>
          <h1
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: 'clamp(1.8rem, 4vw, 2.6rem)',
              color: '#3d2c35',
              fontWeight: 600,
              lineHeight: 1.1,
            }}
          >
            Book an Appointment
          </h1>
        </div>

        {/* Progress */}
        <div
          className="glass-card rounded-2xl"
          style={{ maxWidth: '680px', margin: '0 auto 2.5rem', padding: '1.5rem 2rem' }}
        >
          <ProgressBar currentStep={currentStep} />
        </div>

        {/* Step Content */}
        <div
          className="glass-card rounded-3xl"
          style={{ maxWidth: '960px', margin: '0 auto', padding: '2.5rem' }}
        >
          <StepComponent />
        </div>
      </div>
    </div>
  )
}
