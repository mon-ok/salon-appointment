import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { ChevronRight, User, Mail, Phone, FileText } from 'lucide-react'
import useBookingStore from '../../store/bookingStore'

const schema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters'),
  email: z.string().email('Please enter a valid email'),
  phone: z.string().min(7, 'Please enter a valid phone number'),
  notes: z.string().optional(),
})

function FormField({ label, icon: Icon, error, children }) {
  return (
    <div>
      <label className="label" style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', marginBottom: '0.375rem' }}>
        {Icon && <Icon size={13} color="#b76e79" />}
        {label}
      </label>
      {children}
      {error && (
        <p className="text-xs" style={{ color: '#e8735a', marginTop: '0.25rem' }}>
          {error.message}
        </p>
      )}
    </div>
  )
}

export default function ClientDetails() {
  const { clientDetails, setClientDetails, goToNextStep, goToPrevStep } = useBookingStore()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(schema),
    defaultValues: clientDetails,
  })

  const onSubmit = (data) => {
    setClientDetails(data)
    goToNextStep()
  }

  return (
    <div className="animate-fade-in-up" style={{ maxWidth: '32rem', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 className="step-title" style={{ color: '#3d2c35' }}>Your Details</h2>
        <p className="text-sm" style={{ color: '#9b7a84', marginTop: '0.25rem' }}>
          Tell us how to reach you for your booking confirmation
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="glass-card rounded-2xl" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
        <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '1.25rem' }}>
          <FormField label="Full Name" icon={User} error={errors.full_name}>
            <input {...register('full_name')} className={`input-field ${errors.full_name ? 'error' : ''}`} placeholder="Jane Smith" />
          </FormField>
          <FormField label="Phone Number" icon={Phone} error={errors.phone}>
            <input {...register('phone')} className={`input-field ${errors.phone ? 'error' : ''}`} placeholder="+1 (555) 000-0000" type="tel" />
          </FormField>
        </div>

        <FormField label="Email Address" icon={Mail} error={errors.email}>
          <input {...register('email')} className={`input-field ${errors.email ? 'error' : ''}`} placeholder="jane@example.com" type="email" />
        </FormField>

        <FormField label="Special Requests / Notes" icon={FileText} error={errors.notes}>
          <textarea {...register('notes')} className="input-field resize-none" placeholder="Allergies, preferences, or anything we should know…" rows={3} />
        </FormField>

        <p className="text-xs" style={{ color: '#c4a8b0' }}>
          Your information is kept private and only used for your booking.
        </p>

        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem', paddingTop: '0.5rem' }}>
          <button type="button" className="btn-secondary" onClick={goToPrevStep}>← Back</button>
          <button type="submit" className="btn-primary">Review Booking <ChevronRight size={16} /></button>
        </div>
      </form>
    </div>
  )
}
