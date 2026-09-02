'use client'

import React, { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { usePathname, useSearchParams } from 'next/navigation'
import { Menu, X, ChevronDown, ChevronRight, Sparkles, ArrowRight } from 'lucide-react'

export interface CategoryItem {
  id: string
  name: string
  slug: string
  parent_id?: string | null
  is_active?: boolean
  image_url?: string | null
  [key: string]: any
}

interface CategoryNavProps {
  categories: CategoryItem[]
}

export default function CategoryNav({ categories = [] }: CategoryNavProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [expandedParents, setExpandedParents] = useState<Record<string, boolean>>({})
  const navWrapperRef = useRef<HTMLDivElement>(null)
  const closeTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  const pathname = usePathname()
  const searchParams = useSearchParams()
  const currentCategory = searchParams.get('category')

  // Close dropdown on navigation
  useEffect(() => {
    setIsOpen(false)
  }, [pathname, searchParams])

  // Close dropdown on click outside
  useEffect(() => {
    function handlePointerDown(e: MouseEvent | TouchEvent) {
      if (navWrapperRef.current && !navWrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handlePointerDown)
      document.addEventListener('touchstart', handlePointerDown)
    }

    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [isOpen])

  // Close on Escape key
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        setIsOpen(false)
      }
    }
    if (isOpen) {
      window.addEventListener('keydown', handleKeyDown)
    }
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  // Desktop hover handlers
  const handleMouseEnter = () => {
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      if (closeTimeoutRef.current) {
        clearTimeout(closeTimeoutRef.current)
        closeTimeoutRef.current = null
      }
      setIsOpen(true)
    }
  }

  const handleMouseLeave = () => {
    if (typeof window !== 'undefined' && window.innerWidth > 768) {
      closeTimeoutRef.current = setTimeout(() => {
        setIsOpen(false)
      }, 200)
    }
  }

  // Toggle parent category expansion (for subcategories)
  const toggleParent = (parentId: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setExpandedParents(prev => ({
      ...prev,
      [parentId]: !prev[parentId]
    }))
  }

  // Categorize parent & child categories
  const activeCategories = categories.filter(c => c.is_active !== false)
  const parentCategories = activeCategories.filter(c => !c.parent_id)
  
  const getChildren = (parentId: string) => {
    return activeCategories.filter(c => c.parent_id === parentId)
  }

  const quickLinks = [
    { label: 'New Arrivals', href: '/products?sort=newest' },
    { label: 'Helmets', href: '/products?category=helmets' },
    { label: 'Engine Oils', href: '/products?category=engine-oils' },
    { label: 'Exhausts', href: '/products?category=exhaust' },
    { label: 'Lights', href: '/products?category=lights' },
    { label: 'Tires', href: '/products?category=tires' },
    { label: 'Accessories', href: '/products?category=accessories' },
  ]

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          onClick={() => setIsOpen(false)}
          className="cat-backdrop"
          aria-hidden="true"
        />
      )}

      <div 
        ref={navWrapperRef}
        className="cat-nav-wrapper"
        onMouseLeave={handleMouseLeave}
      >
        <style>{`
          .cat-nav-wrapper {
            position: relative;
            background-color: #111;
            border-bottom: 1px solid rgba(255,255,255,0.1);
            width: 100%;
            max-width: 100%;
            z-index: 110;
          }
          
          .cat-backdrop {
            display: none;
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            backdrop-filter: blur(2px);
            z-index: 105;
          }

          .cat-scroll-container {
            display: flex;
            align-items: stretch;
            height: 52px;
            width: 100%;
            max-width: 1400px;
            margin: 0 auto;
            box-sizing: border-box;
          }

          .cat-toggle-btn {
            display: inline-flex;
            align-items: center;
            gap: 10px;
            background-color: var(--accent);
            color: var(--accent-fg);
            padding: 0 1.5rem;
            font-weight: 800;
            font-size: 14px;
            cursor: pointer;
            flex-shrink: 0;
            white-space: nowrap;
            letter-spacing: 0.5px;
            text-transform: uppercase;
            border: none;
            outline: none;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
            transition: background-color 0.2s, filter 0.2s;
            height: 100%;
          }

          .cat-toggle-btn:hover {
            filter: brightness(1.05);
          }

          .cat-toggle-btn:active {
            filter: brightness(0.95);
          }

          .cat-chevron {
            transition: transform 0.25s ease;
          }
          .cat-chevron.open {
            transform: rotate(180deg);
          }

          .cat-nav-link {
            display: flex;
            align-items: center;
            padding: 0 1.25rem;
            height: 100%;
            font-size: 14px;
            font-weight: 600;
            color: rgba(255,255,255,0.7);
            white-space: nowrap;
            text-decoration: none;
            flex-shrink: 0;
            transition: color 0.2s, background-color 0.2s;
          }

          .cat-nav-link:hover {
            color: var(--accent) !important;
            background-color: rgba(255,255,255,0.03);
          }

          /* Dropdown Menu - rendered outside the scroll container to prevent clipping */
          .cat-dropdown-panel {
            position: absolute;
            top: 100%;
            left: 0;
            width: 320px;
            max-height: 480px;
            overflow-y: auto;
            background-color: #ffffff;
            border: 1px solid var(--border);
            border-top: none;
            border-radius: 0 0 10px 10px;
            box-shadow: 0 16px 36px rgba(0,0,0,0.2);
            z-index: 120;
            display: flex;
            flex-direction: column;
            animation: catFadeDown 0.2s ease-out;
          }

          @keyframes catFadeDown {
            from {
              opacity: 0;
              transform: translateY(-6px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          .cat-dropdown-header {
            display: none;
            align-items: center;
            justify-content: space-between;
            padding: 14px 18px;
            background-color: #1a1a1a;
            color: #ffffff;
            font-size: 14px;
            font-weight: 700;
            border-bottom: 1px solid rgba(255,255,255,0.1);
          }

          .cat-close-btn {
            background: none;
            border: none;
            color: #ffffff;
            cursor: pointer;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 4px;
            border-radius: 4px;
          }

          .cat-view-all-link {
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 12px 18px;
            background-color: #fafafa;
            color: var(--accent);
            text-decoration: none;
            font-size: 13px;
            font-weight: 700;
            border-bottom: 1px solid #ebebeb;
            transition: background-color 0.2s;
          }

          .cat-view-all-link:hover {
            background-color: #f2f2f2;
          }

          .cat-item-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            border-bottom: 1px solid #f0f0f0;
            transition: background-color 0.2s;
          }

          .cat-item-row:last-child {
            border-bottom: none;
          }

          .cat-item-row:hover {
            background-color: #f9f9f9;
          }

          .cat-item-link {
            flex: 1;
            padding: 12px 18px;
            color: #111;
            text-decoration: none;
            font-size: 14px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
          }

          .cat-item-link.active {
            color: var(--accent);
            font-weight: 700;
          }

          .cat-sub-toggle-btn {
            background: none;
            border: none;
            padding: 12px 16px;
            cursor: pointer;
            color: #666;
            display: flex;
            align-items: center;
            justify-content: center;
          }

          .cat-sub-list {
            list-style: none;
            padding: 0;
            margin: 0;
            background-color: #f8fafc;
            border-bottom: 1px solid #f0f0f0;
          }

          .cat-sub-link {
            display: flex;
            align-items: center;
            padding: 9px 18px 9px 36px;
            color: #4b5563;
            text-decoration: none;
            font-size: 13px;
            font-weight: 500;
            border-top: 1px solid #f1f5f9;
            transition: background-color 0.15s, color 0.15s;
          }

          .cat-sub-link:hover {
            background-color: #f1f5f9;
            color: var(--accent);
          }

          .cat-sub-link.active {
            color: var(--accent);
            font-weight: 700;
          }

          /* Mobile responsive behavior */
          @media (max-width: 768px) {
            .cat-backdrop {
              display: block;
            }

            .cat-scroll-container {
              overflow-x: auto;
              white-space: nowrap;
              -webkit-overflow-scrolling: touch;
              scrollbar-width: none;
              -ms-overflow-style: none;
            }

            .cat-scroll-container::-webkit-scrollbar {
              display: none;
            }

            .cat-toggle-btn {
              padding: 0 1.25rem;
              font-size: 13px;
            }

            .cat-dropdown-panel {
              position: absolute;
              top: 100%;
              left: 0;
              right: 0;
              width: 100%;
              max-width: 100%;
              max-height: calc(82vh - 60px);
              border-radius: 0;
              border-left: none;
              border-right: none;
              box-shadow: 0 20px 40px rgba(0,0,0,0.3);
            }

            .cat-dropdown-header {
              display: flex;
            }

            .cat-item-link {
              padding: 14px 18px;
              font-size: 15px;
            }

            .cat-sub-link {
              padding: 12px 18px 12px 38px;
              font-size: 14px;
            }
          }
        `}</style>

        {/* Scrollable category bar */}
        <div className="cat-scroll-container">
          {/* Main All Categories Toggle Button */}
          <button
            type="button"
            className="cat-toggle-btn"
            onClick={() => setIsOpen(prev => !prev)}
            onMouseEnter={handleMouseEnter}
            aria-expanded={isOpen}
            aria-haspopup="true"
            aria-label="Toggle Category Navigation"
          >
            {isOpen ? <X size={18} /> : <Menu size={18} />}
            <span>ALL CATEGORIES</span>
            <ChevronDown size={14} className={`cat-chevron ${isOpen ? 'open' : ''}`} />
          </button>

          {/* Quick Category Links */}
          {quickLinks.map(link => (
            <Link
              key={link.href}
              href={link.href}
              className="cat-nav-link"
            >
              {link.label}
            </Link>
          ))}

          <Link href="/products?sale=true" className="cat-nav-link" style={{ fontWeight: 700, color: '#f87171' }}>
            🏷️ SALE
          </Link>
        </div>

        {/* Dropdown Menu Container (Escaped from .cat-scroll-container to prevent clipping) */}
        {isOpen && (
          <div 
            className="cat-dropdown-panel"
            onMouseEnter={handleMouseEnter}
          >
            {/* Mobile Header Bar */}
            <div className="cat-dropdown-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles size={16} style={{ color: 'var(--accent)' }} />
                <span>Shop by Category</span>
              </div>
              <button 
                type="button" 
                className="cat-close-btn" 
                onClick={() => setIsOpen(false)}
                aria-label="Close category menu"
              >
                <X size={20} />
              </button>
            </div>

            {/* View All Products Link */}
            <Link 
              href="/products" 
              className="cat-view-all-link"
              onClick={() => setIsOpen(false)}
            >
              <span>Explore All Products ({categories.length} categories)</span>
              <ArrowRight size={14} />
            </Link>

            {/* Parent Categories List */}
            {parentCategories.map(parent => {
              const children = getChildren(parent.id)
              const hasChildren = children.length > 0
              const isExpanded = !!expandedParents[parent.id]
              const isParentActive = currentCategory === parent.slug

              return (
                <div key={parent.id} style={{ display: 'flex', flexDirection: 'column' }}>
                  <div className="cat-item-row">
                    <Link
                      href={`/products?category=${parent.slug}`}
                      className={`cat-item-link ${isParentActive ? 'active' : ''}`}
                      onClick={() => setIsOpen(false)}
                    >
                      <span>{parent.name}</span>
                    </Link>

                    {hasChildren && (
                      <button
                        type="button"
                        className="cat-sub-toggle-btn"
                        onClick={(e) => toggleParent(parent.id, e)}
                        aria-label={`Toggle ${parent.name} subcategories`}
                      >
                        <ChevronDown 
                          size={16} 
                          style={{
                            transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                            transition: 'transform 0.2s ease'
                          }} 
                        />
                      </button>
                    )}
                  </div>

                  {/* Subcategories (if any) */}
                  {hasChildren && isExpanded && (
                    <ul className="cat-sub-list">
                      {children.map(child => (
                        <li key={child.id}>
                          <Link
                            href={`/products?category=${child.slug}`}
                            className={`cat-sub-link ${currentCategory === child.slug ? 'active' : ''}`}
                            onClick={() => setIsOpen(false)}
                          >
                            <ChevronRight size={12} style={{ marginRight: '6px', opacity: 0.5 }} />
                            <span>{child.name}</span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )
            })}

            {parentCategories.length === 0 && (
              <div style={{ padding: '24px', textAlign: 'center', color: '#666', fontSize: '13px' }}>
                No categories available
              </div>
            )}
          </div>
        )}
      </div>
    </>
  )
}
