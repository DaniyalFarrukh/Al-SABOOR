'use client'

import { useState, useRef, useEffect } from 'react'
import { createCategoryInline } from '@/lib/actions/categories'

type Category = {
  id: string
  name: string
  parent_id: string | null
}

export default function CategoryCombobox({ 
  categories: initialCategories, 
  defaultValue 
}: { 
  categories: Category[], 
  defaultValue?: string 
}) {
  const [categories, setCategories] = useState<Category[]>(initialCategories)
  
  // Determine initial state based on defaultValue
  const defaultCat = categories.find(c => c.id === defaultValue)
  const defaultIsSub = defaultCat && defaultCat.parent_id !== null
  
  const initialSelectedCategory = defaultIsSub ? categories.find(c => c.id === defaultCat.parent_id) : defaultCat
  const initialSelectedSubcategory = defaultIsSub ? defaultCat : undefined

  const [selectedCategory, setSelectedCategory] = useState<Category | undefined>(initialSelectedCategory)
  const [selectedSubcategory, setSelectedSubcategory] = useState<Category | undefined>(initialSelectedSubcategory)

  // Top level categories
  const topLevelCategories = categories.filter(c => !c.parent_id)
  
  // Subcategories for the selected parent
  const subcategories = selectedCategory 
    ? categories.filter(c => c.parent_id === selectedCategory.id)
    : []

  const handleCreateCategory = async (name: string, parent_id?: string) => {
    const res = await createCategoryInline(name, parent_id)
    if (res.error) {
      alert(res.error)
      return null
    }
    if (res.data) {
      setCategories(prev => [...prev, res.data])
      return res.data
    }
    return null
  }

  return (
    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
      {/* Hidden input to submit the actual value. We submit subcategory if selected, else category */}
      <input 
        type="hidden" 
        name="category_id" 
        value={selectedSubcategory?.id || selectedCategory?.id || ''} 
      />

      <div className="form-group">
        <label className="form-label">Category</label>
        <Combobox 
          items={topLevelCategories} 
          selectedItem={selectedCategory}
          onChange={(cat) => {
            setSelectedCategory(cat)
            setSelectedSubcategory(undefined) // reset subcat on parent change
          }}
          onCreate={async (name) => {
            const newCat = await handleCreateCategory(name)
            if (newCat) {
              setSelectedCategory(newCat)
              setSelectedSubcategory(undefined)
            }
          }}
          placeholder="Search or Create Category..."
        />
      </div>

      <div className="form-group">
        <label className="form-label">Subcategory</label>
        <Combobox 
          items={subcategories} 
          selectedItem={selectedSubcategory}
          onChange={setSelectedSubcategory}
          disabled={!selectedCategory}
          onCreate={async (name) => {
            if (!selectedCategory) return
            const newSubCat = await handleCreateCategory(name, selectedCategory.id)
            if (newSubCat) setSelectedSubcategory(newSubCat)
          }}
          placeholder={selectedCategory ? "Search or Create Subcategory..." : "Select a Category first"}
        />
      </div>
    </div>
  )
}

function Combobox({ 
  items, 
  selectedItem, 
  onChange, 
  onCreate,
  placeholder,
  disabled 
}: { 
  items: Category[], 
  selectedItem?: Category, 
  onChange: (item: Category | undefined) => void,
  onCreate: (name: string) => Promise<void>,
  placeholder: string,
  disabled?: boolean
}) {
  const [isOpen, setIsOpen] = useState(false)
  const [query, setQuery] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  const wrapperRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    if (!isOpen) {
      setQuery('')
    }
  }, [isOpen])

  const filteredItems = items.filter(item => 
    item.name.toLowerCase().includes(query.toLowerCase())
  )

  const exactMatch = items.find(item => item.name.toLowerCase() === query.trim().toLowerCase())

  return (
    <div ref={wrapperRef} style={{ position: 'relative' }}>
      <div 
        className="form-input" 
        style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center', 
          cursor: disabled ? 'not-allowed' : 'pointer',
          backgroundColor: disabled ? 'var(--muted)' : 'transparent',
          minHeight: '42px'
        }}
        onClick={() => !disabled && setIsOpen(!isOpen)}
      >
        <span>{selectedItem ? selectedItem.name : <span style={{color: 'var(--muted-foreground)'}}>{placeholder}</span>}</span>
        {selectedItem && !disabled && (
          <span 
            style={{ color: 'var(--muted-foreground)', padding: '0 0.25rem' }} 
            onClick={(e) => {
              e.stopPropagation()
              onChange(undefined)
            }}
          >
            ×
          </span>
        )}
      </div>

      {isOpen && (
        <div style={{
          position: 'absolute',
          top: '100%',
          left: 0,
          right: 0,
          zIndex: 50,
          backgroundColor: 'var(--card)',
          border: '1px solid var(--border)',
          borderRadius: '6px',
          marginTop: '4px',
          boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          maxHeight: '250px',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <div style={{ padding: '0.5rem', borderBottom: '1px solid var(--border)' }}>
            <input
              autoFocus
              type="text"
              className="form-input"
              style={{ width: '100%', border: 'none', backgroundColor: 'var(--background)' }}
              placeholder="Search..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
          </div>
          <div style={{ overflowY: 'auto', padding: '0.25rem' }}>
            {filteredItems.map(item => (
              <div 
                key={item.id}
                onClick={() => {
                  onChange(item)
                  setIsOpen(false)
                }}
                style={{
                  padding: '0.5rem 0.75rem',
                  cursor: 'pointer',
                  borderRadius: '4px',
                  backgroundColor: selectedItem?.id === item.id ? 'var(--muted)' : 'transparent'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = selectedItem?.id === item.id ? 'var(--muted)' : 'transparent'}
              >
                {item.name}
              </div>
            ))}
            
            {query.trim().length > 0 && !exactMatch && (
              <div 
                onClick={async () => {
                  setIsCreating(true)
                  await onCreate(query.trim())
                  setIsCreating(false)
                  setIsOpen(false)
                }}
                style={{
                  padding: '0.5rem 0.75rem',
                  cursor: isCreating ? 'wait' : 'pointer',
                  borderRadius: '4px',
                  color: 'var(--primary)',
                  fontWeight: 500,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem'
                }}
                onMouseEnter={(e) => e.currentTarget.style.backgroundColor = 'var(--muted)'}
                onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
              >
                {isCreating ? 'Creating...' : `+ Create "${query.trim()}"`}
              </div>
            )}

            {filteredItems.length === 0 && query.trim().length === 0 && (
              <div style={{ padding: '0.5rem 0.75rem', color: 'var(--muted-foreground)', textAlign: 'center' }}>
                No options found
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
