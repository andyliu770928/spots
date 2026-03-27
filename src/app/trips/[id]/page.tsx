'use client'

import React, { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  ArrowLeft, 
  Plus, 
  MapPin, 
  Clock, 
  GripVertical, 
  Trash2, 
  Calendar, 
  MessageSquare,
  ChevronRight
} from 'lucide-react'
import { Place, TripItem } from '@/types'

// Dummy Data
const DUMMY_PLACES: Place[] = [
  {
    id: '1',
    title: '新店 - 超人鱸魚湯 (米其林必比登)',
    category: 'food',
    address: '新北市新店區北新路一段349號',
    status: 'shortlisted',
    cover_image_url: 'https://images.unsplash.com/photo-1547592166-23ac45744acd?q=80&w=1471&auto=format&fit=crop',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

const DUMMY_ITEMS: TripItem[] = [
  {
    id: 'i1',
    trip_id: 't1',
    place_id: '1',
    sort_order: 0,
    note: '提早 15 分鐘去排隊',
    place: DUMMY_PLACES[0],
    created_at: new Date().toISOString()
  }
]

export default function TripEditPage() {
  const params = useParams()
  const router = useRouter()
  const [items, setItems] = useState<TripItem[]>(DUMMY_ITEMS)
  const [title, setTitle] = useState('台北新店美食一日遊')
  const [tripDate, setTripDate] = useState('2024-04-15')

  return (
    <main className="min-h-screen bg-[#FDFCF8] text-slate-800 pb-20">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex items-center justify-between sticky top-0 bg-[#FDFCF8]/80 backdrop-blur-md z-40">
        <div className="flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 bg-white rounded-full shadow-sm border border-slate-100 text-slate-400">
            <ArrowLeft size={20} />
          </button>
          <h1 className="text-xl font-bold tracking-tight text-slate-700">編輯行程</h1>
        </div>
        <button className="text-sm font-bold text-orange-500">儲存</button>
      </header>

      {/* Trip Info Card */}
      <div className="px-6 mb-6">
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-slate-50 space-y-4">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">行程名稱</label>
            <input 
              type="text" 
              className="w-full text-2xl font-bold text-slate-700 bg-transparent border-none focus:ring-0 p-0 placeholder-slate-200"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="給這趟旅行取個名字..."
            />
          </div>
          <div className="flex gap-4">
            <div className="flex-grow space-y-1">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest px-1">日期</label>
              <div className="flex items-center gap-2 bg-slate-50 rounded-xl px-4 py-2 border border-slate-100">
                <Calendar size={16} className="text-slate-400" />
                <input 
                  type="date" 
                  className="bg-transparent border-none focus:ring-0 p-0 text-sm text-slate-600 w-full"
                  value={tripDate}
                  onChange={(e) => setTripDate(e.target.value)}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Items List */}
      <div className="px-6 space-y-4">
        <div className="flex items-center justify-between px-2">
          <h2 className="text-sm font-bold text-slate-400 uppercase tracking-widest">景點清單</h2>
          <span className="text-xs text-slate-300 italic">按住左側可拖曳排序 (預留功能)</span>
        </div>

        {items.map((item, index) => (
          <div 
            key={item.id} 
            className="bg-white rounded-3xl p-4 shadow-sm border border-slate-50 flex gap-4 items-center group"
          >
            <div className="text-slate-200 cursor-grab hover:text-slate-400 transition-colors">
              <GripVertical size={20} />
            </div>
            
            <div className="flex-grow space-y-1">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-700 leading-tight">
                  {index + 1}. {item.place?.title}
                </h3>
                <button className="text-slate-200 hover:text-red-400 transition-colors">
                  <Trash2 size={16} />
                </button>
              </div>
              
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <MapPin size={12} />
                <span className="line-clamp-1">{item.place?.address}</span>
              </div>

              <div className="flex items-center gap-2 bg-orange-50/50 rounded-lg px-3 py-1.5 mt-2">
                <MessageSquare size={14} className="text-orange-300" />
                <input 
                  type="text" 
                  className="bg-transparent border-none focus:ring-0 p-0 text-xs text-orange-600 w-full placeholder-orange-200"
                  value={item.note || ''}
                  onChange={(e) => {
                    const newItems = [...items]
                    newItems[index].note = e.target.value
                    setItems(newItems)
                  }}
                  placeholder="加個小提醒..."
                />
              </div>
            </div>
          </div>
        ))}

        {/* Add Item Trigger */}
        <button className="w-full py-4 border-2 border-dashed border-slate-100 rounded-3xl text-slate-300 hover:border-orange-200 hover:text-orange-300 transition-all flex flex-col items-center justify-center gap-2">
          <div className="w-10 h-10 rounded-full bg-slate-50 flex items-center justify-center">
            <Plus size={20} />
          </div>
          <span className="text-xs font-bold uppercase tracking-widest">從收藏中加入地點</span>
        </button>
      </div>

      {/* Footer Navigation (Optional) */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-gradient-to-t from-[#FDFCF8] via-[#FDFCF8] to-transparent pointer-events-none">
        <button className="w-full py-4 bg-slate-800 text-white font-bold rounded-2xl shadow-xl active:scale-[0.98] transition-all pointer-events-auto">
          完成規劃
        </button>
      </div>
    </main>
  )
}
