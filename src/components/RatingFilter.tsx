import React from 'react'
import { Star } from 'lucide-react'

interface RatingFilterProps {
  selectedRating: string | null
  onSelectRating: (rating: string | null) => void
}

const ratingOptions = [
  { id: 'all', label: '全部' },
  { id: 'unrated', label: '沒去過' },
  { id: '5', label: '5 分' },
  { id: '4', label: '4 分以上' },
  { id: '3', label: '3 分以上' },
  { id: '2', label: '2 分以上' },
  { id: '1', label: '1 分以上' },
]

const RatingFilter: React.FC<RatingFilterProps> = ({ selectedRating, onSelectRating }) => {
  return (
    <div className="flex overflow-x-auto pb-2 gap-2 scrollbar-hide no-scrollbar">
      {ratingOptions.map(option => (
        <button
          key={option.id}
          onClick={() => onSelectRating(option.id === 'all' ? null : option.id)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border shadow-sm ${
            (selectedRating === option.id || (selectedRating === null && option.id === 'all'))
              ? 'bg-amber-500 text-white border-amber-500'
              : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
          }`}
        >
          <Star size={14} />
          {option.label}
        </button>
      ))}
    </div>
  )
}

export default RatingFilter
