'use client'

import React, { useState, useEffect } from 'react'
import { Filter } from 'lucide-react'

export default function MobileFilterWrapper({ children }: { children: React.ReactNode }) {
  const [isMobile, setIsMobile] = useState(false)
  const [isOpen, setIsOpen] = useState(false)

  // Use useEffect to prevent hydration mismatch
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (!isMobile) {
    return <>{children}</>
  }

  return (
    <div style={{ width: '100%', marginBottom: '1rem' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        style={{ 
          width: '100%', 
          padding: '0.85rem', 
          backgroundColor: '#1f1f1f', 
          color: '#fff', 
          border: '1px solid var(--accent)',
          borderRadius: '4px', 
          fontWeight: 700, 
          fontSize: '14px',
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'center', 
          gap: '0.5rem',
          cursor: 'pointer',
          textTransform: 'uppercase',
          letterSpacing: '0.5px'
        }}
      >
        <Filter size={16} color="var(--accent)" /> {isOpen ? 'Hide Filters' : 'Show Filters & Sorting'}
      </button>
      {isOpen && (
        <div style={{ marginTop: '1rem' }}>
          {children}
        </div>
      )}
    </div>
  )
}
