import { useState, useEffect } from 'react'
import { ChevronRight, User } from 'lucide-react'
import useBookingStore from '../../store/bookingStore'
import { getStaffForServices, getStaff } from '../../lib/supabase'
import LoadingSpinner from '../ui/LoadingSpinner'

export default function StaffSelection() {
  const {
    salonId, selectedServices, selectedStaff, noPreference,
    setSelectedStaff, setNoPreference, goToNextStep, goToPrevStep,
  } = useBookingStore()

  const [staffList, setStaffList] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const serviceIds = selectedServices.map((s) => s.id)
    const loader = serviceIds.length > 0
      ? getStaffForServices(serviceIds)
      : getStaff(salonId)

    loader
      .then(setStaffList)
      .finally(() => setLoading(false))
  }, [salonId, selectedServices])

  if (loading) return <LoadingSpinner />

  const handleContinue = () => {
    if (selectedStaff || noPreference) goToNextStep()
  }

  return (
    <div className="animate-fade-in-up">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 className="step-title" style={{ color: '#3d2c35' }}>Choose Your Stylist</h2>
        <p className="text-sm" style={{ color: '#9b7a84', marginTop: '0.25rem' }}>
          Showing stylists who offer your selected services
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
        {/* No Preference Card */}
        <div
          className={`staff-card glass-card rounded-2xl ${noPreference ? 'selected' : ''}`}
          style={{ padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
          onClick={setNoPreference}
        >
          <div className="rounded-full" style={{ width: '4rem', height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, background: noPreference ? 'linear-gradient(135deg, #b76e79, #9b4f5e)' : 'linear-gradient(135deg, rgba(244,194,194,0.3), rgba(247,231,206,0.5))' }}>
            <User size={24} color={noPreference ? 'white' : '#b76e79'} />
          </div>
          <div>
            <h3 className="font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#3d2c35' }}>
              No Preference
            </h3>
            <p className="text-xs" style={{ color: '#9b7a84', marginTop: '0.125rem' }}>
              Assign me to any available stylist
            </p>
          </div>
          {noPreference && (
            <div className="rounded-full" style={{ marginLeft: 'auto', width: '1.5rem', height: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #b76e79, #9b4f5e)' }}>
              <svg width="10" height="8" viewBox="0 0 10 8" fill="none">
                <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
          )}
        </div>

        {/* Staff cards */}
        {staffList.map((staff, i) => {
          const isSelected = selectedStaff?.id === staff.id
          return (
            <div
              key={staff.id}
              className={`staff-card glass-card rounded-2xl animate-fade-in-up ${isSelected ? 'selected' : ''}`}
              style={{ animationDelay: `${i * 0.06}s`, padding: '1.25rem', display: 'flex', alignItems: 'center', gap: '1rem' }}
              onClick={() => setSelectedStaff(staff)}
            >
              <div className="relative" style={{ flexShrink: 0 }}>
                {staff.avatar_url ? (
                  <img src={staff.avatar_url} alt={staff.name} className="rounded-full object-cover" style={{ width: '4rem', height: '4rem', border: isSelected ? '2.5px solid #b76e79' : '2.5px solid rgba(255,255,255,0.8)', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }} />
                ) : (
                  <div className="rounded-full font-semibold" style={{ width: '4rem', height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', background: isSelected ? 'linear-gradient(135deg, #b76e79, #9b4f5e)' : 'linear-gradient(135deg, rgba(244,194,194,0.5), rgba(247,231,206,0.7))', color: isSelected ? 'white' : '#b76e79', fontFamily: "'Cormorant Garamond', serif", border: isSelected ? '2.5px solid #b76e79' : '2.5px solid rgba(255,255,255,0.8)' }}>
                    {staff.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                  </div>
                )}
                {isSelected && (
                  <div className="absolute rounded-full" style={{ bottom: '-2px', right: '-2px', width: '1.25rem', height: '1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg, #b76e79, #9b4f5e)', border: '2px solid white' }}>
                    <svg width="9" height="7" viewBox="0 0 9 7" fill="none">
                      <path d="M1 3.5L3 5.5L8 1" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </div>
                )}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <h3 className="font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#3d2c35' }}>
                  {staff.name}
                </h3>
                <p className="text-xs font-medium" style={{ color: '#b76e79', marginBottom: '0.25rem' }}>
                  {staff.role}
                </p>
                {staff.bio && (
                  <p className="text-xs line-clamp-2" style={{ color: '#9b7a84' }}>
                    {staff.bio}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
        <button className="btn-secondary" onClick={goToPrevStep}>← Back</button>
        <button className="btn-primary" onClick={handleContinue} disabled={!selectedStaff && !noPreference}>
          Choose Date & Time <ChevronRight size={16} />
        </button>
      </div>
    </div>
  )
}
