'use client'

import { useEffect, useState } from 'react'

export default function AccessibilityPage() {
  const [fontSize, setFontSize] = useState('normal')
  const [highContrast, setHighContrast] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)
  const [saved, setSaved] = useState(false)

  useEffect(() => {
    const savedFontSize = localStorage.getItem('fontSize') || 'normal'
    const savedHighContrast = localStorage.getItem('highContrast') === 'true'
    const savedReducedMotion = localStorage.getItem('reducedMotion') === 'true'
    setFontSize(savedFontSize)
    setHighContrast(savedHighContrast)
    setReducedMotion(savedReducedMotion)
  }, [])

  function saveSettings() {
    localStorage.setItem('fontSize', fontSize)
    localStorage.setItem('highContrast', String(highContrast))
    localStorage.setItem('reducedMotion', String(reducedMotion))

    const root = document.documentElement

    if (fontSize === 'large') root.style.fontSize = '18px'
    else if (fontSize === 'extra-large') root.style.fontSize = '22px'
    else root.style.fontSize = '16px'

    if (highContrast) root.classList.add('high-contrast')
    else root.classList.remove('high-contrast')

    if (reducedMotion) root.classList.add('reduced-motion')
    else root.classList.remove('reduced-motion')

    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
  }

  function resetSettings() {
    localStorage.clear()
    setFontSize('normal')
    setHighContrast(false)
    setReducedMotion(false)
    document.documentElement.style.fontSize = '16px'
    document.documentElement.classList.remove('high-contrast')
    document.documentElement.classList.remove('reduced-motion')
  }

  return (
    <div className="container">
      <div style={{ marginBottom: 32 }}>
        <h2 style={{ fontSize: 28, fontWeight: 800, color: 'var(--primary-dark)' }}>
          ♿ Accessibility Settings
        </h2>
        <p style={{ color: 'var(--muted)', marginTop: 8 }}>
          Customise your experience. Changes apply across the whole site.
        </p>
      </div>

      {/* TEXT SIZE */}
      <section className="form-section">
        <h3>Text Size</h3>
        <p style={{ color: 'var(--muted)', marginBottom: 20, fontSize: 14 }}>
          Adjust text size to make content easier to read.
        </p>
        <div style={{ display: 'flex', gap: 12 }}>
          {[
            { value: 'normal', label: 'Normal', size: '15px' },
            { value: 'large', label: 'Large', size: '18px' },
            { value: 'extra-large', label: 'Extra Large', size: '22px' },
          ].map(option => (
            <button key={option.value} onClick={() => setFontSize(option.value)} style={{
              padding: '14px 24px',
              borderRadius: 10,
              border: fontSize === option.value ? '2px solid var(--accent)' : '2px solid var(--border)',
              background: fontSize === option.value ? 'var(--primary-light)' : 'white',
              color: fontSize === option.value ? 'var(--primary)' : 'var(--text)',
              fontWeight: fontSize === option.value ? 700 : 500,
              fontSize: option.size,
              cursor: 'pointer',
              fontFamily: 'Inter, sans-serif',
            }}>
              {option.label}
            </button>
          ))}
        </div>
      </section>

      {/* HIGH CONTRAST */}
      <section className="form-section">
        <h3>High Contrast Mode</h3>
        <p style={{ color: 'var(--muted)', marginBottom: 20, fontSize: 14 }}>
          Increases colour contrast for better visibility.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => setHighContrast(!highContrast)} style={{
            width: 56, height: 30, borderRadius: 999, border: 'none',
            background: highContrast ? 'var(--accent)' : '#d1d5db',
            cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
          }}>
            <span style={{
              position: 'absolute', top: 3,
              left: highContrast ? 29 : 3,
              width: 24, height: 24, borderRadius: '50%',
              background: 'white', transition: 'left 0.2s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            }} />
          </button>
          <span style={{ fontWeight: 600, color: highContrast ? 'var(--accent)' : 'var(--muted)' }}>
            {highContrast ? 'On' : 'Off'}
          </span>
        </div>
        <div style={{
          marginTop: 20, padding: 16, borderRadius: 10,
          background: highContrast ? '#000' : '#f8f9ff',
          border: highContrast ? '2px solid #fff' : '1px solid var(--border)',
          color: highContrast ? '#fff' : 'var(--text)',
        }}>
          <strong>Preview:</strong> This is how text will appear.
        </div>
      </section>

      {/* REDUCED MOTION */}
      <section className="form-section">
        <h3>Reduced Motion</h3>
        <p style={{ color: 'var(--muted)', marginBottom: 20, fontSize: 14 }}>
          Reduces animations for users sensitive to motion.
        </p>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <button onClick={() => setReducedMotion(!reducedMotion)} style={{
            width: 56, height: 30, borderRadius: 999, border: 'none',
            background: reducedMotion ? 'var(--accent)' : '#d1d5db',
            cursor: 'pointer', position: 'relative', transition: 'background 0.2s',
          }}>
            <span style={{
              position: 'absolute', top: 3,
              left: reducedMotion ? 29 : 3,
              width: 24, height: 24, borderRadius: '50%',
              background: 'white', transition: 'left 0.2s',
              boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
            }} />
          </button>
          <span style={{ fontWeight: 600, color: reducedMotion ? 'var(--accent)' : 'var(--muted)' }}>
            {reducedMotion ? 'On' : 'Off'}
          </span>
        </div>
      </section>

      {/* BUTTONS */}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <button className="btn-primary" onClick={saveSettings}>Save Settings</button>
        <button className="btn-secondary" onClick={resetSettings}>Reset to Default</button>
        {saved && (
          <span style={{ color: '#16a34a', fontWeight: 600, fontSize: 14 }}>
            ✅ Settings saved!
          </span>
        )}
      </div>
    </div>
  )
}