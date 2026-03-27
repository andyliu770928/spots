'use client'

import React, { useEffect, useState } from 'react'
import { X, Link as LinkIcon, Loader2 } from 'lucide-react'
import { Place, PlaceCategory } from '@/types'
import { detectSourcePlatform } from '@/lib/places'

interface AddPlaceModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (place: Partial<Place>) => void
  initialPlace?: Place | null
}

const PLATFORM_LABELS: Record<string, string> = {
  instagram: 'Instagram',
  facebook: 'Facebook',
  youtube: 'YouTube',
  tiktok: 'TikTok',
  xiaohongshu: '小紅書',
  google_maps: 'Google Maps',
  web: 'Web'
}

const defaultFormData = {
  title: '',
  source_url: '',
  category: 'spot' as PlaceCategory,
  city: '',
  district: '',
  address: '',
  summary: '',
  why_go: '',
  notes: '',
  opening_hours: '',
  tags: [] as string[],
  status: 'inbox' as const,
  rating: null as number | null,
  cover_image_url: '',
  source_platform: '',
}

const AddPlaceModal: React.FC<AddPlaceModalProps> = ({ isOpen, onClose, onSave, initialPlace }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState(defaultFormData)

  useEffect(() => {
    if (!isOpen) return

    if (initialPlace) {
      setFormData({
        title: initialPlace.title || '',
        source_url: initialPlace.source_url || '',
        category: initialPlace.category || 'spot',
        city: initialPlace.city || '',
        district: initialPlace.district || '',
        address: initialPlace.address || '',
        summary: initialPlace.summary || '',
        why_go: initialPlace.why_go || '',
        notes: initialPlace.notes || '',
        opening_hours: initialPlace.opening_hours || '',
        tags: initialPlace.tags || [],
        status: initialPlace.status || 'inbox',
        rating: initialPlace.rating ?? null,
        cover_image_url: initialPlace.cover_image_url || '',
        source_platform: initialPlace.source_platform || detectSourcePlatform(initialPlace.source_url),
      })
      return
    }

    setFormData(defaultFormData)
  }, [initialPlace, isOpen])

  const tagsInputValue = formData.tags.join(', ')

  const updateFormData = (updates: Partial<typeof formData>) => {
    setFormData(prev => ({ ...prev, ...updates }))
  }

  const handleLinkPreview = async () => {
    if (!formData.source_url) return
    
    setLoading(true)
    try {
      const res = await fetch('/api/link-preview', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: formData.source_url })
      })
      const data = await res.json()
      
      if (data.title || data.image) {
        setFormData(prev => ({
          ...prev,
          title: data.title || prev.title,
          cover_image_url: data.image || prev.cover_image_url,
          summary: data.description || prev.summary
        }))
      }
    } catch (err) {
      console.error('Preview error:', err)
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl">
        <div className="sticky top-0 bg-white px-6 py-4 border-b border-slate-50 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-slate-700">{initialPlace ? '編輯收藏' : '新增收藏'}</h2>
          <button onClick={onClose} className="p-2 hover:bg-slate-100 rounded-full transition-colors">
            <X size={20} className="text-slate-400" />
          </button>
        </div>

        <form className="p-6 space-y-4" onSubmit={(e) => { e.preventDefault(); onSave(formData); }}>
          {/* Source URL */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">原始連結</label>
            <div className="flex gap-2">
              <div className="relative flex-grow">
                <LinkIcon className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                <input 
                  type="url" 
                  data-testid="place-source-url"
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm"
                  placeholder="貼上連結 (IG, FB, 網頁...)"
                  value={formData.source_url}
                  onChange={(e) => {
                    const source_url = e.target.value
                    updateFormData({
                      source_url,
                      source_platform: detectSourcePlatform(source_url)
                    })
                  }}
                />
              </div>
              <button 
                type="button"
                data-testid="place-fetch-preview"
                onClick={handleLinkPreview}
                disabled={loading || !formData.source_url}
                className="px-4 py-2 bg-slate-800 text-white text-sm font-medium rounded-xl hover:bg-slate-700 disabled:opacity-50 transition-all flex items-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : '抓取'}
              </button>
            </div>
          </div>

          {/* Title */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">標題 *</label>
            <input 
              required
              type="text" 
              data-testid="place-title"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm"
              placeholder="地點名稱"
              value={formData.title}
              onChange={(e) => updateFormData({ title: e.target.value })}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">分類</label>
              <select 
                data-testid="place-category"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm appearance-none"
                value={formData.category}
                onChange={(e) => updateFormData({ category: e.target.value as PlaceCategory })}
              >
                <option value="spot">景點</option>
                <option value="food">美食</option>
                <option value="hotel">住宿</option>
                <option value="idea">靈感</option>
                <option value="hiking">登山</option>
                <option value="dessert">甜點</option>
                <option value="coffee">咖啡</option>
                <option value="photography">攝影</option>
                <option value="hidden_gem">私房點</option>
                <option value="shop_visit">店訪</option>
              </select>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">評分</label>
              <select
                data-testid="place-rating"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm appearance-none"
                value={formData.rating ?? ''}
                onChange={(e) => {
                  const ratingValue = e.target.value ? Number(e.target.value) : null
                  updateFormData({
                    rating: ratingValue,
                    status: ratingValue ? 'visited' : 'inbox',
                  })
                }}
              >
                <option value="">沒去過</option>
                <option value="1">1 / 5</option>
                <option value="2">2 / 5</option>
                <option value="3">3 / 5</option>
                <option value="4">4 / 5</option>
                <option value="5">5 / 5</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">城市</label>
              <input
                type="text"
                data-testid="place-city"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm"
                placeholder="例如：台北"
                value={formData.city}
                onChange={(e) => updateFormData({ city: e.target.value })}
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">行政區</label>
              <input
                type="text"
                data-testid="place-district"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm"
                placeholder="例如：中西區"
                value={formData.district}
                onChange={(e) => updateFormData({ district: e.target.value })}
              />
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">地址</label>
            <input 
              type="text" 
              data-testid="place-address"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm"
              placeholder="完整地址"
              value={formData.address}
              onChange={(e) => updateFormData({ address: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">營業時間</label>
            <input
              type="text"
              data-testid="place-opening-hours"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm"
              placeholder="例如：11:00-19:00，週二公休"
              value={formData.opening_hours}
              onChange={(e) => updateFormData({ opening_hours: e.target.value })}
            />
          </div>

          {/* Summary */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">簡介</label>
            <textarea 
              rows={3}
              data-testid="place-summary"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm resize-none"
              placeholder="這地方有什麼特色？"
              value={formData.summary}
              onChange={(e) => updateFormData({ summary: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">為什麼想去</label>
            <textarea
              rows={2}
              data-testid="place-why-go"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm resize-none"
              placeholder="收藏這個點的原因"
              value={formData.why_go}
              onChange={(e) => updateFormData({ why_go: e.target.value })}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">標籤</label>
            <input
              type="text"
              data-testid="place-tags"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm"
              placeholder="用逗號分隔，例如：夜景, 約會, 台南"
              value={tagsInputValue}
              onChange={(e) =>
                updateFormData({
                  tags: e.target.value
                    .split(',')
                    .map(tag => tag.trim())
                    .filter(Boolean)
                })
              }
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">來源平台</label>
              <input
                type="text"
                data-testid="place-source-platform"
                className="w-full px-4 py-2.5 bg-slate-100 border border-slate-100 rounded-xl text-sm text-slate-500"
                value={PLATFORM_LABELS[formData.source_platform] || ''}
                placeholder="會依連結自動判斷"
                readOnly
              />
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">封面圖片</label>
              <input
                type="url"
                data-testid="place-cover-image-url"
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm"
                placeholder="自動抓取或手動貼上"
                value={formData.cover_image_url}
                onChange={(e) => updateFormData({ cover_image_url: e.target.value })}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">備註</label>
            <textarea
              rows={3}
              data-testid="place-notes"
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm resize-none"
              placeholder="補充資訊、待查資料、交通提醒"
              value={formData.notes}
              onChange={(e) => updateFormData({ notes: e.target.value })}
            />
          </div>

          {/* Save Button */}
          <button 
            type="submit"
            data-testid="place-save"
            className="w-full py-3.5 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-700 active:scale-[0.98] transition-all shadow-lg"
          >
            {initialPlace ? '儲存變更' : '存入收藏匣'}
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddPlaceModal
