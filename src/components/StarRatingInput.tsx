'use client'

import React, { useState } from 'react'
import { Star } from 'lucide-react'

export default function StarRatingInput() {
  const [rating, setRating] = useState(5)
  const [hover, setHover] = useState(0)

  return (
    <div>
      <input type="hidden" name="rating" value={rating} />
      <div style={{ display: 'flex', gap: '0.25rem' }}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            onClick={() => setRating(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.25rem',
              cursor: 'pointer',
              color: star <= (hover || rating) ? '#eab308' : '#e5e7eb',
              transition: 'color 0.2s',
            }}
          >
            <Star 
              size={24} 
              fill={star <= (hover || rating) ? 'currentColor' : 'none'} 
              strokeWidth={star <= (hover || rating) ? 0 : 2} 
            />
          </button>
        ))}
      </div>
    </div>
  )
}
