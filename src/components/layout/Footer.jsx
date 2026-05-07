import { Scissors, Camera, Share2, Phone, Mail, MapPin } from 'lucide-react'

export default function Footer() {
  return (
    <footer
      className="mt-auto"
      style={{
        background: 'rgba(61, 44, 53, 0.97)',
        color: '#e8d5da',
      }}
    >
      <div className="px-6 sm:px-10 lg:px-16" style={{ maxWidth: '80rem', marginLeft: 'auto', marginRight: 'auto', width: '100%', paddingTop: '4rem', paddingBottom: '4rem' }}>
        <div className="grid grid-cols-1 sm:grid-cols-3" style={{ gap: '2rem', marginBottom: '2rem' }}>
          {/* Brand */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
              <div
                className="rounded-full"
                style={{ width: '2rem', height: '2rem', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(183,110,121,0.3)', flexShrink: 0 }}
              >
                <Scissors size={14} color="#f4c2c2" />
              </div>
              <span
                style={{
                  fontFamily: "'Cormorant Garamond', serif",
                  fontSize: '1.4rem',
                  fontWeight: 600,
                  color: '#f4c2c2',
                }}
              >
                Lumière Studio
              </span>
            </div>
            <p className="text-sm" style={{ color: '#c4a8b0', lineHeight: 1.7 }}>
              Where beauty meets luxury. Your destination for premium hair, nail, and skin services.
            </p>
            <div style={{ display: 'flex', gap: '0.75rem', marginTop: '1rem' }}>
              <a href="#" className="rounded-full transition-colors" style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.07)', color: '#f4c2c2' }}>
                <Camera size={16} />
              </a>
              <a href="#" className="rounded-full transition-colors" style={{ padding: '0.5rem', background: 'rgba(255,255,255,0.07)', color: '#f4c2c2' }}>
                <Share2 size={16} />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: '#f4c2c2', fontFamily: "'DM Sans', sans-serif", marginBottom: '1rem' }}
            >
              Quick Links
            </h4>
            <ul className="text-sm" style={{ color: '#c4a8b0', display: 'flex', flexDirection: 'column', gap: '0.5rem', listStyle: 'none', padding: 0, margin: 0 }}>
              {['Services', 'Our Team', 'Book Appointment', 'Admin Dashboard'].map((item) => (
                <li key={item}>
                  <a href="#" style={{ textDecoration: 'none', color: 'inherit' }}>
                    {item}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4
              className="text-sm font-semibold uppercase tracking-widest"
              style={{ color: '#f4c2c2', fontFamily: "'DM Sans', sans-serif", marginBottom: '1rem' }}
            >
              Contact
            </h4>
            <ul className="text-sm" style={{ color: '#c4a8b0', display: 'flex', flexDirection: 'column', gap: '0.75rem', listStyle: 'none', padding: 0, margin: 0 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <MapPin size={14} color="#b76e79" />
                <span>123 Beauty Lane, Los Angeles CA</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Phone size={14} color="#b76e79" />
                <span>+1 (310) 555-0192</span>
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Mail size={14} color="#b76e79" />
                <span>hello@lumierestudio.com</span>
              </li>
            </ul>
          </div>
        </div>

        <div
          className="text-center text-xs"
          style={{
            borderTop: '1px solid rgba(255,255,255,0.08)',
            paddingTop: '1.5rem',
            color: '#8a6a74',
          }}
        >
          © 2024 Lumière Studio. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
