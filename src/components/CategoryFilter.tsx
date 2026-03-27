import React from 'react'
import { 
  Palmtree, 
  Utensils, 
  Hotel, 
  Lightbulb, 
  Mountain, 
  IceCream, 
  Camera, 
  Ghost, 
  ShoppingBag, 
  Coffee 
} from 'lucide-react'

interface CategoryFilterProps {
  selectedCategory: string | null
  onSelectCategory: (category: string | null) => void
}

const categories = [
  { id: 'all', label: '全部', icon: null },
  { id: 'spot', label: '景點', icon: <Palmtree size={14} /> },
  { id: 'food', label: '美食', icon: <Utensils size={14} /> },
  { id: 'hotel', label: '住宿', icon: <Hotel size={14} /> },
  { id: 'idea', label: '靈感', icon: <Lightbulb size={14} /> },
  { id: 'hiking', label: '登山', icon: <Mountain size={14} /> },
  { id: 'dessert', label: '甜點', icon: <IceCream size={14} /> },
  { id: 'photography', label: '攝影', icon: <Camera size={14} /> },
  { id: 'hidden_gem', label: '秘境', icon: <Ghost size={14} /> },
  { id: 'shop_visit', label: '探店', icon: <ShoppingBag size={14} /> },
  { id: 'coffee', label: '咖啡', icon: <Coffee size={14} /> },
]

const CategoryFilter: React.FC<CategoryFilterProps> = ({ selectedCategory, onSelectCategory }) => {
  return (
    <div className="flex overflow-x-auto pb-4 gap-2 scrollbar-hide no-scrollbar">
      {categories.map((cat) => (
        <button
          key={cat.id}
          onClick={() => onSelectCategory(cat.id === 'all' ? null : cat.id)}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border shadow-sm ${
            (selectedCategory === cat.id || (selectedCategory === null && cat.id === 'all'))
              ? 'bg-slate-600 text-white border-slate-600'
              : 'bg-white text-slate-500 border-slate-100 hover:border-slate-300'
          }`}
        >
          {cat.icon}
          {cat.label}
        </button>
      ))}
    </div>
  )
}

export default CategoryFilter
