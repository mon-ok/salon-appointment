import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Scissors, Star, Clock, ArrowRight, Sparkles, Heart } from 'lucide-react'
import { getServices, getStaff } from '../lib/supabase'
import useBookingStore from '../store/bookingStore'

const SALON_ID = import.meta.env.VITE_SALON_ID || '00000000-0000-0000-0000-000000000001'


const TESTIMONIALS = [
  { name: 'Sophia L.', text: 'Absolutely stunning results every single time. The team here is truly talented!', rating: 5 },
  { name: 'Mia R.', text: 'Best salon experience I\'ve had. Clean, luxurious, and the staff makes you feel like royalty.', rating: 5 },
  { name: 'Emma K.', text: 'Booking online was a breeze. Love the vibe and my highlights turned out perfect.', rating: 5 },
]

export default function Home() {
  const [featuredServices, setFeaturedServices] = useState([])
  const [staff, setStaff] = useState([])
  const { setSalon } = useBookingStore()

  useEffect(() => {
    setSalon({ id: SALON_ID, name: 'Lumière Studio' })
    getServices(SALON_ID).then((data) => {
      const grouped = {}
      data.forEach((s) => { if (!grouped[s.category]) grouped[s.category] = s })
      setFeaturedServices(Object.values(grouped).slice(0, 6))
    })
    getStaff(SALON_ID).then((data) => setStaff(data.slice(0, 4)))
  }, [])

  return (
    <div style={{ width: '100%' }}>

      {/* ── HERO ── */}
      <section
        className="gradient-mesh relative overflow-hidden pt-16"
        style={{ width: '100%', minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
      >
        {/* Decorative blobs */}
        <div className="absolute top-24 right-16 w-80 h-80 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(244,194,194,0.4) 0%, transparent 70%)', filter: 'blur(50px)' }} />
        <div className="absolute bottom-32 left-12 w-64 h-64 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(247,231,206,0.55) 0%, transparent 70%)', filter: 'blur(40px)' }} />
        <div className="absolute top-1/2 right-1/4 w-48 h-48 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(199,143,160,0.2) 0%, transparent 70%)', filter: 'blur(30px)' }} />

        <div className="relative z-10 px-6 sm:px-10 lg:px-16 text-center py-20" style={{ maxWidth: '64rem', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
          {/* Badge */}
          <div
            className="inline-flex items-center gap-2 px-5 py-2 rounded-full text-xs font-medium mb-8 animate-fade-in-up"
            style={{ background: 'rgba(183,110,121,0.1)', color: '#9b4f5e', border: '1px solid rgba(183,110,121,0.2)', letterSpacing: '0.06em' }}
          >
            <Sparkles size={12} />
            PREMIUM BEAUTY STUDIO · CEBU
          </div>

          <h1
            className="hero-title animate-fade-in-up delay-100"
            style={{ color: '#3d2c35', fontFamily: "'Cormorant Garamond', serif" }}
          >
            Where Beauty<br />
            <span className="gradient-text italic">Meets Luxury</span>
          </h1>

          <p
            className="text-base sm:text-lg mt-6 mb-10 animate-fade-in-up delay-200"
            style={{ color: '#7d5a62', lineHeight: 1.8, maxWidth: '42rem', marginLeft: 'auto', marginRight: 'auto', marginTop: '1rem', marginBottom: '1rem' }}
          >
            Discover a sanctuary of elegance. From transformative hair artistry to radiant skin care,
            every visit is a curated experience designed for you.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 animate-fade-in-up delay-300">
            <Link to="/book" className="btn-primary animate-pulse-soft" style={{ padding: '1rem 2.8rem', fontSize: '1rem' }}>
              <Sparkles size={17} /> Book an Appointment
            </Link>
            <a href="#services" className="btn-secondary" style={{ padding: '1rem 2.8rem', fontSize: '1rem' }}>
              Explore Services <ArrowRight size={16} />
            </a>
          </div>

          {/* Stats */}
          <div className="flex items-center justify-center gap-12 animate-fade-in-up delay-400" style={{ marginTop: '2rem' }}>
            {[
              { num: '5K+', label: 'Happy Clients' },
              { num: '12', label: 'Expert Stylists' },
              { num: '4.9★', label: 'Rating' },
            ].map(({ num, label }) => (
              <div key={label} className="text-center">
                <div className="text-3xl font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#9b4f5e' }}>
                  {num}
                </div>
                <div className="text-xs mt-1" style={{ color: '#c4a8b0' }}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Scroll hint */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1 animate-float">
          <div className="w-5 h-8 rounded-full border-2 flex items-start justify-center pt-1.5" style={{ borderColor: 'rgba(183,110,121,0.4)' }}>
            <div className="w-1 h-1.5 rounded-full" style={{ background: '#b76e79' }} />
          </div>
        </div>
      </section>

      {/* ── SERVICES ── */}
      <section id="services" className="gradient-mesh" style={{ width: '100%', padding: '9rem 0' }}>
        <div className="px-6 sm:px-10 lg:px-16" style={{ maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
          <div className="text-center" style={{ marginBottom: '3.5rem' }}>
            <p className="text-xs font-semibold uppercase tracking-widest animate-fade-in-up"
              style={{ color: '#b76e79', marginBottom: '0.75rem' }}>
              What We Offer
            </p>
            <h2 className="section-title animate-fade-in-up delay-100" style={{ color: '#3d2c35', fontFamily: "'Cormorant Garamond', serif" }}>
              Our Signature Services
            </h2>
            <p className="text-sm animate-fade-in-up delay-200" style={{ color: '#9b7a84', lineHeight: 1.7, marginTop: '1rem', maxWidth: '32rem', marginLeft: 'auto', marginRight: 'auto' }}>
              Each service is thoughtfully crafted to enhance your natural beauty
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3" style={{ gap: '2rem' }}>
            {featuredServices.map((service, i) => (
              <div
                key={service.id}
                className="glass-card glass-card-hover rounded-2xl overflow-hidden animate-fade-in-up"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div style={{ height: '10rem', overflow: 'hidden' }}>
                  <img
                    src={`/${(service.category || 'other').toLowerCase()}.jpg`}
                    alt={service.category}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                  />
                </div>
                <div style={{ padding: '1.5rem 1.5rem 1.5rem' }}>
                  <div className="text-xs font-medium uppercase tracking-wider" style={{ color: '#b76e79', marginBottom: '0.375rem' }}>
                    {service.category}
                  </div>
                  <h3 className="font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.25rem', color: '#3d2c35', marginBottom: '0.5rem' }}>
                    {service.name}
                  </h3>
                  <p className="text-sm line-clamp-2" style={{ color: '#9b7a84', lineHeight: 1.6, marginBottom: '1.25rem' }}>
                    {service.description}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.375rem', fontSize: '0.875rem', color: '#9b7a84' }}>
                      <Clock size={13} />
                      <span>{service.duration_minutes} min</span>
                    </div>
                    <div className="font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.2rem', color: '#9b4f5e' }}>
                      From ${parseFloat(service.price).toFixed(0)}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center" style={{ marginTop: '3rem' }}>
            <Link to="/book" className="btn-primary" style={{ padding: '0.9rem 2.4rem', fontSize: '0.95rem' }}>
              <Scissors size={16} /> Book a Service
            </Link>
          </div>
        </div>
      </section>

      {/* ── TEAM ── */}
      {staff.length > 0 && (
        <section style={{ width: '100%', padding: '9rem 0', background: 'rgba(255,255,255,0.45)' }}>
          <div className="px-6 sm:px-10 lg:px-16" style={{ maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
            <div className="text-center" style={{ marginBottom: '3.5rem' }}>
              <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#b76e79', marginBottom: '0.75rem' }}>
                Meet The Team
              </p>
              <h2 className="section-title" style={{ color: '#3d2c35', fontFamily: "'Cormorant Garamond', serif" }}>
                Our Expert Stylists
              </h2>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4" style={{ gap: '2rem' }}>
              {staff.map((member, i) => (
                <div
                  key={member.id}
                  className="glass-card glass-card-hover rounded-2xl text-center animate-fade-in-up"
                  style={{ animationDelay: `${i * 0.1}s`, padding: '1.5rem' }}
                >
                  <div style={{ marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt={member.name}
                        className="rounded-full object-cover"
                        style={{ width: '6rem', height: '6rem', border: '3px solid rgba(255,255,255,0.9)', boxShadow: '0 4px 20px rgba(155,79,94,0.15)' }} />
                    ) : (
                      <div className="rounded-full font-semibold"
                        style={{
                          width: '6rem', height: '6rem',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '1.5rem',
                          background: 'linear-gradient(135deg, rgba(244,194,194,0.5), rgba(247,231,206,0.7))',
                          color: '#b76e79',
                          fontFamily: "'Cormorant Garamond', serif",
                          border: '3px solid rgba(255,255,255,0.9)',
                          boxShadow: '0 4px 20px rgba(155,79,94,0.15)',
                        }}>
                        {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                    )}
                  </div>
                  <h3 className="font-semibold" style={{ fontFamily: "'Cormorant Garamond', serif", color: '#3d2c35', fontSize: '1.1rem' }}>
                    {member.name}
                  </h3>
                  <p className="text-xs font-medium" style={{ color: '#b76e79', marginTop: '0.25rem' }}>{member.role}</p>
                  {member.bio && (
                    <p className="text-xs line-clamp-2" style={{ color: '#9b7a84', lineHeight: 1.6, marginTop: '0.5rem' }}>{member.bio}</p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TESTIMONIALS ── */}
      <section className="gradient-mesh" style={{ width: '100%', padding: '9rem 0' }}>
        <div className="px-6 sm:px-10 lg:px-16" style={{ maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
          <div className="text-center" style={{ marginBottom: '3.5rem' }}>
            <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#b76e79', marginBottom: '0.75rem' }}>
              Client Love
            </p>
            <h2 className="section-title" style={{ color: '#3d2c35', fontFamily: "'Cormorant Garamond', serif" }}>
              What Our Clients Say
            </h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: '2rem' }}>
            {TESTIMONIALS.map((t, i) => (
              <div key={t.name} className="glass-card rounded-2xl animate-fade-in-up" style={{ animationDelay: `${i * 0.1}s`, padding: '2rem' }}>
                <div style={{ display: 'flex', gap: '0.25rem', marginBottom: '1rem' }}>
                  {Array.from({ length: t.rating }).map((_, j) => (
                    <Star key={j} size={14} fill="#f7c948" color="#f7c948" />
                  ))}
                </div>
                <p className="text-sm italic" style={{ color: '#5a3e47', lineHeight: 1.8, marginBottom: '1.5rem' }}>"{t.text}"</p>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                  <div className="rounded-full font-semibold"
                    style={{ width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.875rem', background: 'linear-gradient(135deg, #b76e79, #9b4f5e)', color: 'white', fontFamily: "'Cormorant Garamond', serif", flexShrink: 0 }}>
                    {t.name[0]}
                  </div>
                  <span className="text-sm font-medium" style={{ color: '#3d2c35' }}>{t.name}</span>
                  <Heart size={13} fill="#f4c2c2" color="#f4c2c2" style={{ marginLeft: 'auto' }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BANNER ── */}
      <section
        className="text-center"
        style={{
          width: '100%',
          padding: '9rem 0',
          background: 'linear-gradient(135deg, #3d2c35 0%, #5a3e47 50%, #3d2c35 100%)',
        }}
      >
        <div className="px-6 sm:px-10 lg:px-16" style={{ maxWidth: '48rem', marginLeft: 'auto', marginRight: 'auto', width: '100%' }}>
          <p className="text-xs font-semibold uppercase tracking-widest" style={{ color: '#f4c2c2', letterSpacing: '0.1em', marginBottom: '1.25rem' }}>
            Ready to Glow?
          </p>
          <h2 className="section-title" style={{ color: 'white', fontFamily: "'Cormorant Garamond', serif", marginBottom: '1.25rem' }}>
            Book Your Appointment Today
          </h2>
          <p className="text-sm" style={{ color: '#e8d5da', lineHeight: 1.8, maxWidth: '480px', marginLeft: 'auto', marginRight: 'auto', marginBottom: '2.5rem' }}>
            Your beauty journey starts with a single step. Reserve your spot and let us take care of the rest.
          </p>
          <Link
            to="/book"
            className="btn-primary animate-pulse-soft"
            style={{ background: 'linear-gradient(135deg, #e8a0aa, #e8735a)', padding: '1.1rem 3rem', fontSize: '1rem' }}
          >
            <Sparkles size={17} /> Book Now
          </Link>
        </div>
      </section>

    </div>
  )
}
