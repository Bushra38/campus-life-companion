'use client'

import { useEffect } from 'react'

export default function AccessibilityLoader() {
  useEffect(() => {
    const fontSize = localStorage.getItem('fontSize') || 'normal'
    const highContrast = localStorage.getItem('highContrast') === 'true'
    const reducedMotion = localStorage.getItem('reducedMotion') === 'true'
    const root = document.documentElement

    if (fontSize === 'large') root.style.fontSize = '18px'
    else if (fontSize === 'extra-large') root.style.fontSize = '22px'
    else root.style.fontSize = '16px'

    if (highContrast) root.classList.add('high-contrast')
    else root.classList.remove('high-contrast')

    if (reducedMotion) root.classList.add('reduced-motion')
    else root.classList.remove('reduced-motion')
  }, [])

  return null
}