'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { Plus, MapPin, Calendar, ArrowLeft, ChevronRight } from 'lucide-react'
import { Trip } from '@/types'

// Dummy Trips
const DUMMY_TRIPS: Trip[] = [
  {
    id: 't1',
    title: '台北新店美食一日遊',
    trip_date: '2024-04-15',
    notes: '主要是去吃必比登鱸魚湯',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  },
  {
    id: 't2',
    title: '台東放空計畫',
    trip_date: '2024-05-20',
    notes: '去看南田觀景台',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString()
  }
]

export default function TripsPage() {
  const [trips, setTrips] = useState<Trip[]>(DUMMY_TRIPS)

  return (
    <main className="min-h-screen bg-[#FDFCF8] text-slate-800 pb-20">
      {/* Header */}
      <header className="px-6 pt-8 pb-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <Link href="/" className="p-2 bg-white rounded-full shadow-sm border border-slate-100 text-slate-400">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="text-2xl font-bold tracking-tight text-slate-700">行程規劃</h1>
        </div>
      </header>

      {/* Trip List */}
      <div className="px-6 space-y-4">
        {trips.map((trip) => (
          <Link 
            key={trip.id} 
            href={`/trips/${trip.id}`}
            className="block bg-white rounded-3xl p-6 shadow-sm border border-slate-50 hover:shadow-md transition-all group"
          >
            <div className="flex justify-between items-start">
              <div className="space-y-2">
                <h2 className="text-xl font-bold text-slate-700 group-hover:text-orange-500 transition-colors">
                  {trip.title}
                </h2>
                <div className="flex items-center gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar size={14} />
                    {trip.trip_date || '未定日期'}
                  </div>
                </div>
                {trip.notes && (
                  <p className="text-sm text-slate-500 line-clamp-1 italic">
                    {trip.notes}
                  </p>
                )}
              </div>
              <div className="p-2 bg-slate-50 rounded-full text-slate-300 group-hover:bg-orange-50 group-hover:text-orange-400 transition-all">
                <ChevronRight size={20} />
              </div>
            </div>
          </Link>
        ))}

        {trips.length === 0 && (
          <div className="py-20 text-center space-y-4">
            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mx-auto text-slate-200">
              <Calendar size={40} />
            </div>
            <p className="text-slate-400 text-sm">還沒有任何行程，開始規劃吧！</p>
          </div>
        )}
      </div>

      {/* Add Trip Button */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-slate-800 text-white rounded-full shadow-lg flex items-center justify-center hover:scale-110 active:scale-95 transition-all">
        <Plus size={28} />
      </button>
    </main>
  )
}
