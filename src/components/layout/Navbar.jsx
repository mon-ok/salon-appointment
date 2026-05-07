import { Link, useLocation } from 'react-router-dom'
import { Scissors, LayoutDashboard } from 'lucide-react'

export default function Navbar() {
  const location = useLocation()

  return (
    <nav
      className="fixed top-0 left-0 right-0 z-50 px-6 sm:px-10 lg:px-16"
      style={{
        background: 'rgba(253, 246, 240, 0.85)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(183, 110, 121, 0.12)',
      }}
    >
      <div style={{ width: '100%', height: '4rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingLeft: '3rem', paddingRight: '3rem' }}>
        <Link to="/" className="flex items-center gap-2 group">
          <div
            className="w-8 h-8 rounded-full flex items-center justify-center"
            style={{ background: 'linear-gradient(135deg, #b76e79, #9b4f5e)' }}
          >
            <Scissors size={14} color="white" />
          </div>
          <span
            style={{
              fontFamily: "'Cormorant Garamond', serif",
              fontSize: '1.4rem',
              fontWeight: 600,
              color: '#3d2c35',
              letterSpacing: '-0.01em',
            }}
          >
            Lumière
          </span>
        </Link>

        <div className="flex items-center gap-2">
          <Link
            to="/"
            className="px-4 py-1.5 rounded-full text-sm font-medium transition-all duration-200"
            style={{
              color: location.pathname === '/' ? '#9b4f5e' : '#7d5a62',
              background: location.pathname === '/' ? 'rgba(183,110,121,0.1)' : 'transparent',
              fontFamily: "'DM Sans', sans-serif",
            }}
          >
            Home
          </Link>
          <Link
            to="/book"
            className="btn-primary text-sm"
            style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}
          >
            Book Now
          </Link>
          <Link
            to="/admin"
            className="ml-1 p-2 rounded-full transition-all duration-200"
            style={{
              color: location.pathname.startsWith('/admin') ? '#9b4f5e' : '#c4a8b0',
              background: location.pathname.startsWith('/admin')
                ? 'rgba(183,110,121,0.1)'
                : 'transparent',
            }}
            title="Admin Dashboard"
          >
            <LayoutDashboard size={18} />
          </Link>
        </div>
      </div>
    </nav>
  )
}
