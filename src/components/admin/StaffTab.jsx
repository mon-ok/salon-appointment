import { useState } from 'react'
import { Plus, Edit2, X, Check, Loader } from 'lucide-react'
import { createStaff, updateStaff, setStaffServices } from '../../lib/supabase'

const SALON_ID = import.meta.env.VITE_SALON_ID || '00000000-0000-0000-0000-000000000001'

const inputStyle = {
  width: '100%',
  padding: '0.625rem 0.875rem',
  borderRadius: '0.75rem',
  border: '1px solid rgba(183,110,121,0.25)',
  background: 'rgba(255,255,255,0.7)',
  color: '#3d2c35',
  fontFamily: "'DM Sans', sans-serif",
  fontSize: '0.9rem',
  outline: 'none',
  boxSizing: 'border-box',
}

const labelStyle = {
  display: 'block',
  fontSize: '0.72rem',
  fontWeight: 600,
  color: '#9b7a84',
  marginBottom: '0.375rem',
  fontFamily: "'DM Sans', sans-serif",
  textTransform: 'uppercase',
  letterSpacing: '0.05em',
}

function StaffModal({ member, services, onSave, onClose }) {
  const [form, setForm] = useState({
    name: member?.name || '',
    role: member?.role || '',
    bio: member?.bio || '',
    is_available: member?.is_available ?? true,
    serviceIds: member?.staff_services?.map((ss) => ss.service_id) || [],
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const toggleService = (sid) =>
    setForm((f) => ({
      ...f,
      serviceIds: f.serviceIds.includes(sid)
        ? f.serviceIds.filter((id) => id !== sid)
        : [...f.serviceIds, sid],
    }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim()) return
    setSaving(true)
    setError(null)
    try {
      let saved
      if (member?.id) {
        saved = await updateStaff(member.id, {
          name: form.name.trim(),
          role: form.role.trim() || null,
          bio: form.bio.trim() || null,
          is_available: form.is_available,
        })
      } else {
        saved = await createStaff({ salonId: SALON_ID, name: form.name.trim(), role: form.role.trim(), bio: form.bio.trim() })
      }
      await setStaffServices(saved.id, form.serviceIds)
      onSave()
    } catch (err) {
      setError(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  const grouped = services.reduce((acc, svc) => {
    if (!acc[svc.category]) acc[svc.category] = []
    acc[svc.category].push(svc)
    return acc
  }, {})

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(61,44,53,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div className="glass-card rounded-3xl" style={{ width: '100%', maxWidth: '32rem', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', color: '#3d2c35', fontWeight: 600 }}>
            {member ? 'Edit Stylist' : 'Add Stylist'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9b7a84', padding: '0.25rem', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required style={inputStyle} placeholder="e.g. Sofia Reyes" />
          </div>

          <div>
            <label style={labelStyle}>Role</label>
            <input type="text" value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))} style={inputStyle} placeholder="e.g. Senior Colorist" />
          </div>

          <div>
            <label style={labelStyle}>Bio</label>
            <textarea value={form.bio} onChange={(e) => setForm((f) => ({ ...f, bio: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Short description…" />
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.is_available}
              onChange={(e) => setForm((f) => ({ ...f, is_available: e.target.checked }))}
              style={{ width: '1rem', height: '1rem', accentColor: '#b76e79', cursor: 'pointer' }}
            />
            <span style={{ fontSize: '0.875rem', color: '#3d2c35', fontFamily: "'DM Sans', sans-serif" }}>Active (visible to clients)</span>
          </label>

          <div>
            <label style={labelStyle}>Services this stylist can perform</label>
            {Object.keys(grouped).length === 0 ? (
              <p style={{ fontSize: '0.8rem', color: '#c4a8b0', fontFamily: "'DM Sans', sans-serif" }}>No services yet — add services first.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                {Object.entries(grouped).map(([category, svcs]) => (
                  <div key={category}>
                    <div style={{ fontSize: '0.68rem', fontWeight: 600, color: '#b76e79', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: '0.375rem', fontFamily: "'DM Sans', sans-serif" }}>
                      {category}
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.375rem' }}>
                      {svcs.map((svc) => (
                        <label key={svc.id} style={{ display: 'flex', alignItems: 'center', gap: '0.625rem', cursor: 'pointer' }}>
                          <input
                            type="checkbox"
                            checked={form.serviceIds.includes(svc.id)}
                            onChange={() => toggleService(svc.id)}
                            style={{ width: '1rem', height: '1rem', accentColor: '#b76e79', cursor: 'pointer', flexShrink: 0 }}
                          />
                          <span style={{ fontSize: '0.875rem', color: '#3d2c35', fontFamily: "'DM Sans', sans-serif" }}>
                            {svc.name}
                            <span style={{ color: '#9b7a84', marginLeft: '0.375rem' }}>· {svc.duration_minutes}min · ${parseFloat(svc.price).toFixed(0)}</span>
                          </span>
                        </label>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div style={{ padding: '0.625rem', borderRadius: '0.5rem', background: 'rgba(232,115,90,0.1)', color: '#c4553d', fontSize: '0.8rem', fontFamily: "'DM Sans', sans-serif" }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}>
              Cancel
            </button>
            <button type="submit" className="btn-primary" disabled={saving} style={{ padding: '0.625rem 1.5rem', fontSize: '0.875rem', justifyContent: 'center', minWidth: '100px' }}>
              {saving ? <><Loader size={14} style={{ animation: 'spin 1s linear infinite' }} /> Saving…</> : <><Check size={14} /> Save</>}
            </button>
          </div>
        </form>
      </div>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </div>
  )
}

export default function StaffTab({ staff, services, onRefresh }) {
  const [editing, setEditing] = useState(null) // null=closed, 'new'=adding, object=editing

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', color: '#3d2c35', fontWeight: 600 }}>
          Stylists ({staff.length})
        </h3>
        <button onClick={() => setEditing('new')} className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
          <Plus size={15} /> Add Stylist
        </button>
      </div>

      {staff.length === 0 ? (
        <div className="glass-card rounded-2xl text-center" style={{ padding: '3rem' }}>
          <p style={{ color: '#c4a8b0', fontFamily: "'DM Sans', sans-serif" }}>No stylists yet. Add the first one.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
          {staff.map((member) => {
            const memberServices = (member.staff_services || [])
              .map((ss) => services.find((svc) => svc.id === ss.service_id))
              .filter(Boolean)

            return (
              <div key={member.id} className="glass-card rounded-2xl" style={{ padding: '1.25rem' }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.75rem', marginBottom: '0.75rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    {member.avatar_url ? (
                      <img src={member.avatar_url} alt={member.name} style={{ width: '3rem', height: '3rem', borderRadius: '50%', objectFit: 'cover', border: '2px solid rgba(255,255,255,0.9)', flexShrink: 0 }} />
                    ) : (
                      <div style={{
                        width: '3rem', height: '3rem', borderRadius: '50%', flexShrink: 0,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '1.1rem', fontWeight: 600,
                        background: 'linear-gradient(135deg, rgba(244,194,194,0.5), rgba(247,231,206,0.7))',
                        color: '#b76e79', fontFamily: "'Cormorant Garamond', serif",
                        border: '2px solid rgba(255,255,255,0.9)',
                      }}>
                        {member.name.split(' ').map((n) => n[0]).join('').slice(0, 2)}
                      </div>
                    )}
                    <div>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.05rem', fontWeight: 600, color: '#3d2c35' }}>
                        {member.name}
                      </div>
                      <div style={{ fontSize: '0.75rem', color: '#b76e79', fontFamily: "'DM Sans', sans-serif" }}>
                        {member.role || '—'}
                      </div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.375rem', flexShrink: 0 }}>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 600, padding: '0.2rem 0.6rem', borderRadius: '9999px',
                      fontFamily: "'DM Sans', sans-serif",
                      background: member.is_available ? 'rgba(94,184,125,0.12)' : 'rgba(155,122,132,0.12)',
                      color: member.is_available ? '#5eb87d' : '#9b7a84',
                    }}>
                      {member.is_available ? 'Active' : 'Inactive'}
                    </span>
                    <button
                      onClick={() => setEditing(member)}
                      style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9b7a84', padding: '0.25rem', display: 'flex' }}
                      title="Edit"
                    >
                      <Edit2 size={15} />
                    </button>
                  </div>
                </div>

                {member.bio && (
                  <p className="line-clamp-2" style={{ fontSize: '0.75rem', color: '#9b7a84', lineHeight: 1.5, marginBottom: '0.625rem', fontFamily: "'DM Sans', sans-serif" }}>
                    {member.bio}
                  </p>
                )}

                {memberServices.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.25rem' }}>
                    {memberServices.map((svc) => (
                      <span key={svc.id} style={{ fontSize: '0.65rem', padding: '0.2rem 0.5rem', borderRadius: '9999px', background: 'rgba(183,110,121,0.08)', color: '#9b7a84', fontFamily: "'DM Sans', sans-serif" }}>
                        {svc.name}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {editing !== null && (
        <StaffModal
          member={editing === 'new' ? null : editing}
          services={services}
          onSave={() => { setEditing(null); onRefresh() }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
