import { useState, useEffect } from 'react'
import { Clock, DollarSign, Check, Sparkles } from 'lucide-react'
import useBookingStore from '../../store/bookingStore'
import { getServices } from '../../lib/supabase'
import LoadingSpinner from '../ui/LoadingSpinner'


export default function ServiceSelection() {
  const { salonId, selectedServices, toggleService, goToNextStep } = useBookingStore()
  const [services, setServices] = useState([])
  const [loading, setLoading] = useState(true)
  const [activeCategory, setActiveCategory] = useState('All')
  const [categories, setCategories] = useState(['All'])

  useEffect(() => {
    if (!salonId) return
    getServices(salonId)
      .then((data) => {
        setServices(data)
        const cats = ['All', ...new Set(data.map((s) => s.category))]
        setCategories(cats)
      })
      .finally(() => setLoading(false))
  }, [salonId])

  const filtered = activeCategory === 'All'
    ? services
    : services.filter((s) => s.category === activeCategory)

  const totalDuration = selectedServices.reduce((sum, s) => sum + s.duration_minutes, 0)
  const totalPrice = selectedServices.reduce((sum, s) => sum + parseFloat(s.price), 0)

  if (loading) return <LoadingSpinner />

  return (
    <div className="animate-fade-in-up">
      <div style={{ marginBottom: '1.5rem' }}>
        <h2 className="step-title" style={{ color: '#3d2c35' }}>Choose Your Services</h2>
        <p className="text-sm" style={{ color: '#9b7a84', marginTop: '0.25rem' }}>
          Select one or more services to get started
        </p>
      </div>

      {/* Category Tabs */}
      <div className="overflow-x-auto scrollbar-hide" style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', paddingBottom: '0.25rem' }}>
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`category-tab rounded-full text-sm font-medium ${activeCategory === cat ? 'active' : ''}`}
            style={{
              padding: '0.375rem 1rem',
              border: activeCategory === cat ? 'none' : '1px solid rgba(183,110,121,0.3)',
              color: activeCategory === cat ? 'white' : '#9b7a84',
              fontFamily: "'DM Sans', sans-serif",
              whiteSpace: 'nowrap',
            }}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Service Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: '1rem', marginBottom: '1.5rem' }}>
        {filtered.map((service, i) => {
          const isSelected = selectedServices.some((s) => s.id === service.id)
          return (
            <div
              key={service.id}
              className={`service-card glass-card rounded-2xl overflow-hidden ${isSelected ? 'selected' : ''} animate-fade-in-up`}
              style={{ animationDelay: `${i * 0.07}s` }}
              onClick={() => toggleService(service)}
            >
              {/* Image */}
              <div className="relative overflow-hidden" style={{ height: '9rem' }}>
                {service.image_url ? (
                  <img src={service.image_url} alt={service.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                ) : (
                  <img
                    src={`/${(service.category || 'other').toLowerCase()}.jpg`}
                    alt={service.category}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                )}
                {isSelected && (
                  <div className="absolute inset-0" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(155,79,94,0.45)' }}>
                    <div className="rounded-full" style={{ width: '2.5rem', height: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'white' }}>
                      <Check size={20} color="#9b4f5e" strokeWidth={2.5} />
                    </div>
                  </div>
                )}
                <div className="absolute rounded-full text-xs font-medium" style={{ top: '0.5rem', left: '0.5rem', padding: '0.125rem 0.5rem', background: 'rgba(253,246,240,0.92)', color: '#9b4f5e', backdropFilter: 'blur(8px)', fontFamily: "'DM Sans', sans-serif" }}>
                  {service.category}
                </div>
              </div>

              {/* Content */}
              <div style={{ padding: '1rem' }}>
                <h3 className="font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.15rem', color: '#3d2c35', marginBottom: '0.25rem' }}>
                  {service.name}
                </h3>
                {service.description && (
                  <p className="text-xs line-clamp-2" style={{ color: '#9b7a84', marginBottom: '0.75rem' }}>
                    {service.description}
                  </p>
                )}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#b76e79' }}>
                    <Clock size={12} />
                    <span>{service.duration_minutes} min</span>
                  </div>
                  <div className="font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', color: '#9b4f5e' }}>
                    ${parseFloat(service.price).toFixed(0)}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Summary bar */}
      {selectedServices.length > 0 && (
        <div className="glass-card rounded-2xl animate-fade-in" style={{ padding: '1rem', marginBottom: '1rem', display: 'flex', flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between', gap: '0.75rem' }}>
          <div className="text-sm" style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
            <div style={{ color: '#7d5a62' }}>
              <span className="font-medium" style={{ color: '#3d2c35' }}>{selectedServices.length}</span>{' '}
              service{selectedServices.length !== 1 ? 's' : ''} selected
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#7d5a62' }}>
              <Clock size={13} />
              <span>Total: {totalDuration} min</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#7d5a62' }}>
              <DollarSign size={13} />
              <span>From ${totalPrice.toFixed(0)}</span>
            </div>
          </div>
          <button className="btn-primary" onClick={goToNextStep}>
            <Sparkles size={15} />
            Choose Stylist
          </button>
        </div>
      )}

      {selectedServices.length === 0 && (
        <div className="text-center" style={{ paddingTop: '1rem', paddingBottom: '1rem' }}>
          <p className="text-sm" style={{ color: '#c4a8b0' }}>Select at least one service to continue</p>
        </div>
      )}
    </div>
  )
}
