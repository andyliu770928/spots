'use client'

import React, { useState } from 'react'
import { X, Link as LinkIcon, Loader2 } from 'lucide-react'
import { PlaceCategory, PlaceStatus } from '@/types'

interface AddPlaceModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (place: any) => void
}

const AddPlaceModal: React.FC<AddPlaceModalProps> = ({ isOpen, onClose, onSave }) => {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: '',
    source_url: '',
    category: 'spot' as PlaceCategory,
    city: '',
    district: '',
    address: '',
    summary: '',
    why_go: '',
    tags: [] as string[],
    status: 'inbox' as PlaceStatus,
    cover_image_url: ''
  })

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
          <h2 className="text-xl font-bold text-slate-700">新增收藏</h2>
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
                  className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm"
                  placeholder="貼上連結 (IG, FB, 網頁...)"
                  value={formData.source_url}
                  onChange={(e) => setFormData({...formData, source_url: e.target.value})}
                />
              </div>
              <button 
                type="button"
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
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm"
              placeholder="地點名稱"
              value={formData.title}
              onChange={(e) => setFormData({...formData, title: e.target.value})}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Category */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">分類</label>
              <select 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm appearance-none"
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value as PlaceCategory})}
              >
                <option value="spot">景點</option>
                <option value="food">美食</option>
                <option value="hotel">住宿</option>
                <option value="hiking">登山</option>
                <option value="dessert">甜點</option>
                <option value="coffee">咖啡</option>
              </select>
            </div>
            {/* Status */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">狀態</label>
              <select 
                className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm appearance-none"
                value={formData.status}
                onChange={(e) => setFormData({...formData, status: e.target.value as PlaceStatus})}
              >
                <option value="inbox">Inbox</option>
                <option value="shortlisted">有興趣</option>
                <option value="visited">已去過</option>
                <option value="archived">封存</option>
              </select>
            </div>
          </div>

          {/* Address */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">地址</label>
            <input 
              type="text" 
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm"
              placeholder="完整地址"
              value={formData.address}
              onChange={(e) => setFormData({...formData, address: e.target.value})}
            />
          </div>

          {/* Summary */}
          <div className="space-y-1.5">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">簡介</label>
            <textarea 
              rows={3}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-100 rounded-xl focus:outline-none focus:ring-2 focus:ring-slate-100 text-sm resize-none"
              placeholder="這地方有什麼特色？"
              value={formData.summary}
              onChange={(e) => setFormData({...formData, summary: e.target.value})}
            />
          </div>

          {/* Save Button */}
          <button 
            type="submit"
            className="w-full py-3.5 bg-slate-800 text-white font-bold rounded-2xl hover:bg-slate-700 active:scale-[0.98] transition-all shadow-lg"
          >
            存入收藏匣
          </button>
        </form>
      </div>
    </div>
  )
}

export default AddPlaceModal
