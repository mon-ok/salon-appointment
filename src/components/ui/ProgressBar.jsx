import { STEP_LABELS } from '../../store/bookingStore'
import { Check } from 'lucide-react'

export default function ProgressBar({ currentStep }) {
  const totalSteps = STEP_LABELS.length

  return (
    <div className="w-full">
      {/* Step dots + connectors */}
      <div className="flex items-center justify-between relative mb-3">
        {/* Background line */}
        <div
          className="absolute top-1/2 left-0 right-0 h-0.5 -translate-y-1/2 z-0"
          style={{ background: 'rgba(183, 110, 121, 0.15)' }}
        />
        {/* Progress fill */}
        <div
          className="absolute top-1/2 left-0 h-0.5 -translate-y-1/2 z-0 progress-bar-fill"
          style={{ width: `${((currentStep - 1) / (totalSteps - 1)) * 100}%` }}
        />

        {STEP_LABELS.map(({ step, label }) => {
          const done = step < currentStep
          const active = step === currentStep

          return (
            <div key={step} className="flex flex-col items-center z-10 gap-2">
              <div
                className="w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium transition-all duration-300"
                style={{
                  background: done
                    ? 'linear-gradient(135deg, #b76e79, #9b4f5e)'
                    : active
                    ? 'white'
                    : 'white',
                  border: active
                    ? '2px solid #b76e79'
                    : done
                    ? 'none'
                    : '2px solid rgba(183,110,121,0.25)',
                  color: done ? 'white' : active ? '#9b4f5e' : '#c4a8b0',
                  boxShadow: active ? '0 0 0 4px rgba(183,110,121,0.15)' : 'none',
                }}
              >
                {done ? <Check size={14} strokeWidth={2.5} /> : step}
              </div>
              <span
                className="text-xs font-medium hidden sm:block"
                style={{
                  color: done || active ? '#9b4f5e' : '#c4a8b0',
                  fontFamily: "'DM Sans', sans-serif",
                }}
              >
                {label}
              </span>
            </div>
          )
        })}
      </div>

      {/* Mobile: current step label */}
      <div className="sm:hidden text-center mt-1">
        <span
          className="text-xs font-medium"
          style={{ color: '#9b4f5e', fontFamily: "'DM Sans', sans-serif" }}
        >
          Step {currentStep} of {totalSteps} — {STEP_LABELS[currentStep - 1]?.label}
        </span>
      </div>
    </div>
  )
}
