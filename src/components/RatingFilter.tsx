import React from 'react'
import { ChevronDown, Star } from 'lucide-react'

interface RatingFilterProps {
  selectedRating: string | null
  onSelectRating: (rating: string | null) => void
}

const ratingOptions = [
  { id: 'all', label: '全部評分' },
  { id: 'unrated', label: '沒去過' },
  { id: '5', label: '5 分' },
  { id: '4', label: '4 分以上' },
  { id: '3', label: '3 分以上' },
  { id: '2', label: '2 分以上' },
  { id: '1', label: '1 分以上' },
]

const RatingFilter: React.FC<RatingFilterProps> = ({ selectedRating, onSelectRating }) => {
  return (
    <div className="relative min-w-[150px]">
      <Star
        size={15}
        className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-500 pointer-events-none"
      />
      <ChevronDown
        size={15}
        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"
      />
      <select
        value={selectedRating ?? 'all'}
        onChange={(e) => onSelectRating(e.target.value === 'all' ? null : e.target.value)}
        className="w-full appearance-none rounded-full border border-slate-100 bg-white py-2 pl-9 pr-9 text-sm font-medium text-slate-600 shadow-sm focus:outline-none focus:ring-2 focus:ring-amber-100"
      >
        {ratingOptions.map(option => (
          <option key={option.id} value={option.id}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  )
}

export default RatingFilter
