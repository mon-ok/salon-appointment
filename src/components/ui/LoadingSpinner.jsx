export default function LoadingSpinner({ size = 'md', color = '#b76e79' }) {
  const sizes = { sm: 20, md: 32, lg: 48 }
  const px = sizes[size] || sizes.md

  return (
    <div className="flex items-center justify-center" style={{ padding: '1rem' }}>
      <svg
        width={px}
        height={px}
        viewBox="0 0 40 40"
        fill="none"
        style={{ animation: 'spin 1s linear infinite' }}
      >
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        <circle cx="20" cy="20" r="17" stroke={color} strokeOpacity="0.2" strokeWidth="3" />
        <path
          d="M37 20a17 17 0 0 0-17-17"
          stroke={color}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    </div>
  )
}
