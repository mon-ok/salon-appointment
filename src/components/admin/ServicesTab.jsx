import { useState } from 'react'
import { Plus, Edit2, X, Check, Loader, Clock, DollarSign } from 'lucide-react'
import { createService, updateService } from '../../lib/supabase'

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

function ServiceModal({ service, categories, onSave, onClose }) {
  const [form, setForm] = useState({
    name: service?.name || '',
    category: service?.category || '',
    description: service?.description || '',
    price: service?.price != null ? String(service.price) : '',
    duration_minutes: service?.duration_minutes != null ? String(service.duration_minutes) : '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState(null)

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!form.name.trim() || !form.category.trim() || !form.price || !form.duration_minutes) return
    setSaving(true)
    setError(null)
    try {
      if (service?.id) {
        await updateService(service.id, {
          name: form.name.trim(),
          category: form.category.trim(),
          description: form.description.trim() || null,
          price: parseFloat(form.price),
          duration_minutes: parseInt(form.duration_minutes, 10),
        })
      } else {
        await createService({
          salonId: SALON_ID,
          name: form.name.trim(),
          category: form.category.trim(),
          description: form.description.trim(),
          price: parseFloat(form.price),
          durationMinutes: parseInt(form.duration_minutes, 10),
        })
      }
      onSave()
    } catch (err) {
      setError(err.message || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(61,44,53,0.55)', backdropFilter: 'blur(6px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '1rem' }}>
      <div className="glass-card rounded-3xl" style={{ width: '100%', maxWidth: '28rem', padding: '2rem', maxHeight: '90vh', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.4rem', color: '#3d2c35', fontWeight: 600 }}>
            {service ? 'Edit Service' : 'Add Service'}
          </h3>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9b7a84', padding: '0.25rem', display: 'flex' }}>
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={labelStyle}>Name *</label>
            <input type="text" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required style={inputStyle} placeholder="e.g. Full Highlights" />
          </div>

          <div>
            <label style={labelStyle}>Category *</label>
            <input
              type="text"
              list="categories-list"
              value={form.category}
              onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}
              required
              style={inputStyle}
              placeholder="e.g. Hair, Nails, Skin"
            />
            <datalist id="categories-list">
              {categories.map((c) => <option key={c} value={c} />)}
            </datalist>
          </div>

          <div>
            <label style={labelStyle}>Description</label>
            <textarea value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} rows={3} style={{ ...inputStyle, resize: 'vertical' }} placeholder="Brief description of the service…" />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={labelStyle}>Price ($) *</label>
              <input type="number" min="0" step="0.01" value={form.price} onChange={(e) => setForm((f) => ({ ...f, price: e.target.value }))} required style={inputStyle} placeholder="0.00" />
            </div>
            <div>
              <label style={labelStyle}>Duration (min) *</label>
              <input type="number" min="1" step="1" value={form.duration_minutes} onChange={(e) => setForm((f) => ({ ...f, duration_minutes: e.target.value }))} required style={inputStyle} placeholder="60" />
            </div>
          </div>

          {error && (
            <div style={{ padding: '0.625rem', borderRadius: '0.5rem', background: 'rgba(232,115,90,0.1)', color: '#c4553d', fontSize: '0.8rem', fontFamily: "'DM Sans', sans-serif" }}>
              {error}
            </div>
          )}

          <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
            <button type="button" onClick={onClose} className="btn-secondary" style={{ padding: '0.625rem 1.25rem', fontSize: '0.875rem' }}>Cancel</button>
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

export default function ServicesTab({ services, onRefresh }) {
  const [editing, setEditing] = useState(null)

  const categories = [...new Set(services.map((s) => s.category))].sort()
  const grouped = services.reduce((acc, svc) => {
    if (!acc[svc.category]) acc[svc.category] = []
    acc[svc.category].push(svc)
    return acc
  }, {})

  return (
    <div>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.25rem' }}>
        <h3 style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.3rem', color: '#3d2c35', fontWeight: 600 }}>
          Services ({services.length})
        </h3>
        <button onClick={() => setEditing('new')} className="btn-primary" style={{ padding: '0.5rem 1.25rem', fontSize: '0.875rem' }}>
          <Plus size={15} /> Add Service
        </button>
      </div>

      {services.length === 0 ? (
        <div className="glass-card rounded-2xl text-center" style={{ padding: '3rem' }}>
          <p style={{ color: '#c4a8b0', fontFamily: "'DM Sans', sans-serif" }}>No services yet. Add the first one.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {Object.entries(grouped).map(([category, svcs]) => (
            <div key={category}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <span style={{ fontSize: '0.7rem', fontWeight: 600, color: '#b76e79', textTransform: 'uppercase', letterSpacing: '0.07em', fontFamily: "'DM Sans', sans-serif" }}>
                  {category}
                </span>
                <div style={{ flex: 1, height: '1px', background: 'rgba(183,110,121,0.15)' }} />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '0.75rem' }}>
                {svcs.map((svc) => (
                  <div key={svc.id} className="glass-card rounded-2xl" style={{ padding: '1rem 1.25rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
                      <div style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.05rem', fontWeight: 600, color: '#3d2c35', lineHeight: 1.2 }}>
                        {svc.name}
                      </div>
                      <button
                        onClick={() => setEditing(svc)}
                        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9b7a84', padding: '0.125rem', display: 'flex', flexShrink: 0 }}
                        title="Edit"
                      >
                        <Edit2 size={14} />
                      </button>
                    </div>
                    {svc.description && (
                      <p className="line-clamp-2" style={{ fontSize: '0.75rem', color: '#9b7a84', lineHeight: 1.5, fontFamily: "'DM Sans', sans-serif" }}>
                        {svc.description}
                      </p>
                    )}
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 'auto' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.75rem', color: '#9b7a84', fontFamily: "'DM Sans', sans-serif" }}>
                        <Clock size={12} /> {svc.duration_minutes} min
                      </span>
                      <span style={{ fontFamily: "'Cormorant Garamond', serif", fontSize: '1.1rem', fontWeight: 600, color: '#9b4f5e', display: 'flex', alignItems: 'center', gap: '0.125rem' }}>
                        <DollarSign size={13} />{parseFloat(svc.price).toFixed(0)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {editing !== null && (
        <ServiceModal
          service={editing === 'new' ? null : editing}
          categories={categories}
          onSave={() => { setEditing(null); onRefresh() }}
          onClose={() => setEditing(null)}
        />
      )}
    </div>
  )
}
