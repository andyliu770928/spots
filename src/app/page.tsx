'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { Search, Plus, Calendar, Loader2, MapPinOff } from 'lucide-react'
import { useRouter } from 'next/navigation'
import SpotCard from '@/components/SpotCard'
import CategoryFilter from '@/components/CategoryFilter'
import AddPlaceModal from '@/components/AddPlaceModal'
import { Place } from '@/types'
import { api } from '@/lib/api'

export default function Home() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [places, setPlaces] = useState<Place[]>([])
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  // Fetch data on load
  useEffect(() => {
    fetchPlaces()
  }, [])

  const fetchPlaces = async () => {
    setLoading(true)
    try {
      const data = await api.getPlaces()
      setPlaces(data)
    } catch (err) {
      console.error('Failed to fetch places:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddPlace = async (newPlaceData: Partial<Place>) => {
    try {
      const savedPlace = await api.addPlace(newPlaceData)
      setPlaces([savedPlace, ...places])
      setIsModalOpen(false)
    } catch (err) {
      console.error('Failed to add place:', err)
      alert('新增失敗，請檢查 Supabase 連線或環境變數設定。')
    }
  }

  const handleDeletePlace = async (id: string) => {
    if (!confirm('確定要刪除這個收藏嗎？')) return
    try {
      await api.deletePlace(id)
      setPlaces(places.filter(p => p.id !== id))
    } catch (err) {
      console.error('Delete failed:', err)
    }
  }

  const filteredPlaces = places.filter(place => {
    const matchesSearch = 
      place.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      place.tags?.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase())) ||
      place.summary?.toLowerCase().includes(searchQuery.toLowerCase())
    
    const matchesCategory = selectedCategory ? place.category === selectedCategory : true
    
    return matchesSearch && matchesCategory
  })

  return (
    <main className="min-h-screen bg-[#FDFCF8] text-slate-800 pb-20 font-sans">
      {/* Header */}
      <header className="px-6 pt-12 pb-8 text-center space-y-2 relative">
        <Link 
          href="/trips" 
          className="absolute left-6 top-12 p-2.5 bg-white rounded-full shadow-sm border border-slate-100 text-slate-400 hover:text-orange-500 transition-colors"
        >
          <Calendar size={22} />
        </Link>
        <h1 className="text-4xl font-black tracking-tighter text-slate-800">旅圖書籤匣</h1>
        <p className="text-[11px] text-slate-400 uppercase tracking-[0.3em] font-medium">TRIPMARK DECK</p>
      </header>

      {/* Search & Stats Section */}
      <div className="px-6 mb-8 flex gap-3 items-stretch">
        <div className="relative flex-grow group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-slate-600 transition-colors" size={18} />
          <input 
            type="text" 
            placeholder="搜尋景點、美食..." 
            className="w-full pl-12 pr-4 py-4 bg-white border border-slate-100 rounded-2xl shadow-sm focus:outline-none focus:ring-2 focus:ring-slate-100 focus:border-slate-200 transition-all text-sm"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        
        <div className="px-5 py-2 bg-white border border-slate-100 rounded-2xl shadow-sm text-center flex flex-col justify-center min-w-[90px]">
          <span className="block text-2xl font-black text-slate-800 leading-none">
            {loading ? '-' : filteredPlaces.length}
          </span>
          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider mt-1.5">總收藏</span>
        </div>
      </div>

      {/* Categories */}
      <div className="px-6 mb-8">
        <CategoryFilter 
          selectedCategory={selectedCategory}
          onSelectCategory={setSelectedCategory}
        />
      </div>

      {/* Grid */}
      <div className="px-6">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-400">
            <Loader2 size={40} className="animate-spin" />
            <p className="text-sm font-medium">讀取收藏中...</p>
          </div>
        ) : filteredPlaces.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPlaces.map(place => (
              <SpotCard 
                key={place.id} 
                place={place} 
                onClick={(id) => router.push(`/places/${id}`)}
                onEdit={(p) => console.log('Edit', p)}
                onDelete={handleDeletePlace}
              />
            ))}
          </div>
        ) : (
          <div className="py-20 flex flex-col items-center justify-center gap-4 text-slate-300">
            <MapPinOff size={60} strokeWidth={1} />
            <p className="text-sm font-medium">找不到符合的收藏，來新增一筆吧！</p>
          </div>
        )}
      </div>

      {/* Add Button (Floating) */}
      <button 
        onClick={() => setIsModalOpen(true)}
        data-testid="open-add-place-modal"
        className="fixed bottom-8 right-8 w-14 h-14 bg-slate-800 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40"
      >
        <Plus size={28} />
      </button>

      {/* Modal */}
      <AddPlaceModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onSave={handleAddPlace}
      />
    </main>
  )
}
