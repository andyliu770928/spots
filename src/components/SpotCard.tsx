import React from 'react'
import { Place } from '@/types'
import { 
  MapPin, 
  ExternalLink, 
  Edit2, 
  Trash2, 
  Sparkles, 
  Clock,
  Star
} from 'lucide-react'
import { getCategoryLabel, getRatingLabel } from '@/lib/places'

interface SpotCardProps {
  place: Place
  onEdit?: (place: Place) => void
  onDelete?: (id: string) => void
  onClick?: (id: string) => void
}

const SpotCard: React.FC<SpotCardProps> = ({ place, onEdit, onDelete, onClick }) => {
  return (
    <div 
      onClick={() => onClick?.(place.id)}
      className="relative bg-white rounded-2xl shadow-sm border border-orange-50 overflow-hidden flex flex-col h-full hover:shadow-md transition-shadow duration-300 cursor-pointer group"
    >
      {place.cover_image_url && (
        <>
          <div
            className="absolute inset-0 bg-center bg-cover opacity-[0.28] transition-opacity duration-300 group-hover:opacity-[0.36]"
            style={{ backgroundImage: `url(${place.cover_image_url})` }}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-white/76 via-white/74 to-[#FDFCF8]/82" />
        </>
      )}

      <div className="relative p-5 flex-grow flex flex-col space-y-4">
        <div>
          <div className="flex items-start justify-between gap-3 mb-2">
            <h3 className="text-xl font-bold text-slate-800 leading-tight group-hover:text-orange-500 transition-colors">
              {place.title}
            </h3>
            <span className={`shrink-0 px-3 py-1 text-xs font-semibold rounded-full ${
              place.rating ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700'
            }`}>
              {place.rating ? `${place.rating} 分` : '沒去過'}
            </span>
          </div>

          <div className="flex flex-wrap gap-2">
            <span className="px-3 py-1 bg-orange-100 text-orange-700 text-xs font-semibold rounded-full">
              {getCategoryLabel(place.category)}
            </span>
            {place.source_platform && (
              <span className="px-3 py-1 bg-slate-100 text-slate-500 text-xs font-semibold rounded-full uppercase">
                {place.source_platform}
              </span>
            )}
          </div>
        </div>

        {/* Tags */}
        {place.tags && place.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {place.tags.map(tag => (
              <span key={tag} className="px-2 py-0.5 bg-slate-50 text-slate-500 text-[10px] rounded-md border border-slate-100">
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Details */}
        <div className="space-y-2 text-sm text-slate-600 flex-grow">
          {place.summary && (
            <div className="flex gap-2">
              <Sparkles size={16} className="text-orange-400 mt-1 flex-shrink-0" />
              <p className="line-clamp-3">{place.summary}</p>
            </div>
          )}
          
          {place.address && (
            <div className="flex gap-2">
              <MapPin size={16} className="text-red-400 mt-1 flex-shrink-0" />
              <p className="line-clamp-1">{place.address}</p>
            </div>
          )}

          {place.opening_hours && (
            <div className="flex gap-2">
              <Clock size={16} className="text-amber-400 mt-1 flex-shrink-0" />
              <p className="line-clamp-1">{place.opening_hours}</p>
            </div>
          )}

          {place.rating && (
            <div className="flex gap-2">
              <Star size={16} className="text-amber-400 mt-1 flex-shrink-0" />
              <p>{getRatingLabel(place.rating)}</p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="pt-4 border-t border-slate-50 flex items-center justify-between">
          {place.source_url ? (
            <a 
              href={place.source_url} 
              target="_blank" 
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center gap-1.5 text-xs text-blue-500 hover:underline"
            >
              <ExternalLink size={14} />
              查看來源
            </a>
          ) : <div />}
          
          <div className="flex gap-2">
            <button 
              onClick={(e) => { e.stopPropagation(); onEdit?.(place); }}
              className="p-2 text-slate-400 hover:text-orange-500 transition-colors"
              aria-label="Edit"
            >
              <Edit2 size={16} />
            </button>
            <button 
              onClick={(e) => { e.stopPropagation(); onDelete?.(place.id); }}
              className="p-2 text-slate-400 hover:text-red-500 transition-colors"
              aria-label="Delete"
            >
              <Trash2 size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SpotCard
