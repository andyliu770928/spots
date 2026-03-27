'use client'

import React, { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { 
  ArrowLeft, 
  MapPin, 
  ExternalLink, 
  Calendar, 
  MessageSquare, 
  Sparkles,
  Share2,
  Loader2,
  MapPinOff,
  Star,
  Clock
} from 'lucide-react'
import { Place } from '@/types'
import { api } from '@/lib/api'
import { getCategoryLabel, getRatingLabel } from '@/lib/places'

export default function PlaceDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [place, setPlace] = useState<Place | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (params.id) {
      fetchPlaceDetail(params.id as string)
    }
  }, [params.id])

  const fetchPlaceDetail = async (id: string) => {
    setLoading(true)
    try {
      const data = await api.getPlace(id)
      setPlace(data)
    } catch (err) {
      console.error('Failed to fetch place detail:', err)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-slate-400 bg-[#FDFCF8]">
        <Loader2 size={40} className="animate-spin" />
        <p className="text-sm font-medium">載入細節中...</p>
      </div>
    )
  }

  if (!place) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4 text-slate-400 bg-[#FDFCF8] px-6 text-center">
        <MapPinOff size={60} strokeWidth={1} />
        <p className="text-sm font-medium">找不到該景點資料，可能已被移除。</p>
        <button onClick={() => router.back()} className="mt-4 px-6 py-2 bg-slate-800 text-white rounded-xl">返回首頁</button>
      </div>
    )
  }

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(place.address || place.title)}`
  const ratingButtons = [1, 2, 3, 4, 5]

  return (
    <main className="min-h-screen bg-[#FDFCF8] text-slate-800 pb-12">
      {/* Header Image */}
      <div className="relative h-72 md:h-96 w-full overflow-hidden">
        {place.cover_image_url ? (
          <img 
            src={place.cover_image_url} 
            alt={place.title}
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full bg-slate-200 flex items-center justify-center text-slate-400">
            無封面圖
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
        
        {/* Top Actions */}
        <div className="absolute top-6 left-6 right-6 flex justify-between items-center">
          <button 
            onClick={() => router.back()}
            className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all"
          >
            <ArrowLeft size={24} />
          </button>
          <button className="p-2 bg-white/20 backdrop-blur-md rounded-full text-white hover:bg-white/40 transition-all">
            <Share2 size={24} />
          </button>
        </div>

        {/* Title Overlay */}
        <div className="absolute bottom-6 left-6 right-6">
          <div className="flex gap-2 mb-2">
            <span className="px-3 py-1 bg-orange-500 text-white text-[10px] font-bold rounded-full uppercase tracking-wider">
              {getCategoryLabel(place.category)}
            </span>
            <div className="flex items-center gap-1 rounded-full bg-white/18 px-2 py-1 backdrop-blur-md">
              {ratingButtons.map(value => (
                <button
                  key={value}
                  type="button"
                  className={`h-6 min-w-6 rounded-full px-1.5 text-[10px] font-bold transition-all ${
                    (place.rating || 0) >= value
                      ? 'bg-amber-400 text-slate-900'
                      : 'bg-white/18 text-white/90'
                  }`}
                >
                  {value}
                </button>
              ))}
            </div>
          </div>
          <h1 className="text-3xl font-bold text-white drop-shadow-md">{place.title}</h1>
        </div>
      </div>

      <div className="px-6 -mt-4 relative z-10 space-y-6">
        {/* Quick Actions */}
        <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 flex justify-around">
          <a 
            href={googleMapsUrl} 
            target="_blank" 
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-1 group"
          >
            <div className="w-12 h-12 rounded-full bg-red-50 text-red-500 flex items-center justify-center group-hover:bg-red-500 group-hover:text-white transition-all">
              <MapPin size={20} />
            </div>
            <span className="text-[10px] font-bold text-slate-500">地圖導航</span>
          </a>
          {place.source_url && (
            <a 
              href={place.source_url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex flex-col items-center gap-1 group"
            >
              <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center group-hover:bg-blue-500 group-hover:text-white transition-all">
                <ExternalLink size={20} />
              </div>
              <span className="text-[10px] font-bold text-slate-500">查看來源</span>
            </a>
          )}
          <div className="flex flex-col items-center gap-1">
            <div className="flex items-center gap-1 rounded-full bg-amber-50 px-3 py-3 text-amber-500">
              <Star size={18} />
              <span className="text-xs font-bold">{place.rating || '-'}</span>
            </div>
            <span className="text-[10px] font-bold text-slate-500">評分</span>
          </div>
        </div>

        {/* Details Section */}
        <div className="space-y-6">
          {/* Summary & Tags */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-50 space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Sparkles size={18} />
              <h2 className="text-sm font-bold uppercase tracking-widest">景點簡介</h2>
            </div>
            <p className="text-slate-600 leading-relaxed">{place.summary || '暫無簡介。'}</p>
            {place.tags && place.tags.length > 0 && (
              <div className="flex flex-wrap gap-2 pt-2">
                {place.tags.map(tag => (
                  <span key={tag} className="px-3 py-1 bg-slate-50 text-slate-400 text-xs rounded-lg border border-slate-100">
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </section>

          {/* Why Go */}
          {place.why_go && (
            <section className="bg-orange-50/30 rounded-3xl p-6 border border-orange-100/50 space-y-4">
              <div className="flex items-center gap-2 text-orange-500">
                <Sparkles size={18} />
                <h2 className="text-sm font-bold uppercase tracking-widest">推薦原因</h2>
              </div>
              <p className="text-slate-700 font-medium leading-relaxed italic">
                「{place.why_go}」
              </p>
            </section>
          )}

          {/* Info */}
          <section className="bg-white rounded-3xl p-6 shadow-sm border border-slate-50 space-y-4">
            <div className="flex items-center gap-2 text-slate-400">
              <Calendar size={18} />
              <h2 className="text-sm font-bold uppercase tracking-widest">基本資訊</h2>
            </div>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                  <MapPin size={16} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">地址</p>
                  <p className="text-sm text-slate-600">{place.address || '未填寫地址'}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                  <Star size={16} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">評分</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <button
                      type="button"
                      className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                        !place.rating ? 'bg-slate-700 text-white' : 'bg-slate-100 text-slate-500'
                      }`}
                    >
                      沒去過
                    </button>
                    {ratingButtons.map(value => (
                      <button
                        key={value}
                        type="button"
                        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-all ${
                          place.rating === value
                            ? 'bg-amber-500 text-white'
                            : 'bg-amber-50 text-amber-700'
                        }`}
                      >
                        {value} 分
                      </button>
                    ))}
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{getRatingLabel(place.rating)}</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                  <Clock size={16} className="text-slate-400" />
                </div>
                <div>
                  <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">營業時間</p>
                  <p className="text-sm text-slate-600 whitespace-pre-wrap">{place.opening_hours || '未填寫營業時間'}</p>
                </div>
              </div>
              {(place.notes || place.source_platform) && (
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center flex-shrink-0">
                    <MessageSquare size={16} className="text-slate-400" />
                  </div>
                  <div>
                    <p className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">備註 / 平台</p>
                    <p className="text-sm text-slate-600 whitespace-pre-wrap">
                      {place.notes || ''}
                      {place.source_platform && `\n來源平台：${place.source_platform}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
      </div>
    </main>
  )
}
