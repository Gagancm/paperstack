import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Trash2, Star } from 'lucide-react'
import { useAppStore } from '../../store/appStore'

export default function FolderCard({ folder, noteCount = 0, onClick, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState(null)
  const menuButtonRef = useRef(null)
  
  const { updateFolder, addToast } = useAppStore()

  const folderColor = folder.color || '#d4c4e0'
  const folderGradient = folder.gradient || `linear-gradient(135deg, ${folderColor} 0%, ${adjustColor(folderColor, -15)} 100%)`

  const openMenu = (e) => {
    e.stopPropagation()
    if (menuButtonRef.current) {
      const r = menuButtonRef.current.getBoundingClientRect()
      setMenuPosition({ top: r.bottom + 4, left: Math.max(8, r.left - 100) })
    }
    setMenuOpen(true)
  }

  useEffect(() => {
    if (!menuOpen) return
    const handleClickOutside = () => setMenuOpen(false)
    setTimeout(() => document.addEventListener('click', handleClickOutside), 0)
    return () => document.removeEventListener('click', handleClickOutside)
  }, [menuOpen])

  const handleToggleFavorite = (e) => {
    e.stopPropagation()
    updateFolder(folder.id, { pinned: !folder.pinned })
    addToast({ message: folder.pinned ? 'Removed from favorites' : 'Added to favorites' })
    setMenuOpen(false)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    onDelete?.(folder)
    setMenuOpen(false)
  }

  return (
    <div 
      className="w-full flex flex-col items-center cursor-pointer group"
      onClick={onClick}
    >
      {/* Folder graphic - aspect ratio matches notes */}
      <div className="relative w-full aspect-[3/4] mb-2">
        {/* Back layer (shadow/depth) */}
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] h-[75%] rounded-xl opacity-40"
          style={{ background: folderGradient }}
        />
        
        {/* Middle layer */}
        <div 
          className="absolute bottom-1 left-1/2 -translate-x-1/2 w-[92%] h-[78%] rounded-xl opacity-60"
          style={{ background: folderGradient }}
        />
        
        {/* Main folder body */}
        <div 
          className="absolute bottom-2 left-1/2 -translate-x-1/2 w-full h-[80%] rounded-xl transition-transform group-hover:scale-[1.02] shadow-lg"
          style={{ background: folderGradient }}
        >
          {/* Folder tab */}
          <div 
            className="absolute -top-2.5 left-3 w-[40%] h-4 rounded-t-lg"
            style={{ background: folderGradient, filter: 'brightness(1.1)' }}
          />
          
          {/* Icon if present */}
          {folder.icon && (
            <div className="absolute inset-0 flex items-center justify-center text-2xl mt-1">
              {folder.icon}
            </div>
          )}
          
          {/* Favorite star */}
          {folder.pinned && (
            <div className="absolute top-2 right-2">
              <Star size={14} className="text-yellow-500" fill="currentColor" />
            </div>
          )}
          
          {/* Note count badge */}
          {noteCount > 0 && (
            <div className="absolute bottom-2 right-2 bg-black/30 px-2 py-0.5 rounded-full">
              <span className="text-white text-xs">{noteCount}</span>
            </div>
          )}
        </div>
      </div>

      {/* Folder info */}
      <div className="w-full flex items-center justify-center gap-1 px-1">
        <div className="text-center min-w-0 flex-1">
          <p className="text-white font-medium text-sm truncate">{folder.name}</p>
          <p className="text-[#8E8E93] text-xs">
            {noteCount} {noteCount === 1 ? 'note' : 'notes'}
          </p>
        </div>
        
        {/* Dropdown trigger */}
        <button
          ref={menuButtonRef}
          onClick={openMenu}
          className="p-1.5 rounded-lg hover:bg-[#3A3A3C] transition-colors shrink-0"
        >
          <ChevronDown size={14} className="text-[#8E8E93]" />
        </button>
      </div>

      {/* Menu dropdown */}
      {menuOpen && menuPosition && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setMenuOpen(false)} />
          <div
            className="fixed bg-[#2C2C2E] rounded-lg shadow-xl z-[9999] min-w-[180px] py-1 border border-[#3A3A3C]"
            style={{ top: menuPosition.top, left: menuPosition.left }}
          >
            {/* Favorite */}
            <button
              onClick={handleToggleFavorite}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-white hover:bg-[#3A3A3C]"
            >
              <Star size={16} className={folder.pinned ? 'text-yellow-500' : 'text-[#8E8E93]'} fill={folder.pinned ? 'currentColor' : 'none'} />
              <span className="text-sm">{folder.pinned ? 'Remove from Favorites' : 'Add to Favorites'}</span>
            </button>

            <div className="h-px bg-[#3A3A3C] mx-2" />

            {/* Delete */}
            <button
              onClick={handleDelete}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-[#FF453A] hover:bg-[#3A3A3C]"
            >
              <Trash2 size={16} />
              <span className="text-sm">Delete</span>
            </button>
          </div>
        </>,
        document.body
      )}
    </div>
  )
}

// Helper to darken/lighten a hex color
function adjustColor(hex, amount) {
  if (!hex) return '#d4c4e0'
  const cleanHex = hex.replace('#', '')
  const num = parseInt(cleanHex, 16)
  const r = Math.min(255, Math.max(0, (num >> 16) + amount))
  const g = Math.min(255, Math.max(0, ((num >> 8) & 0x00FF) + amount))
  const b = Math.min(255, Math.max(0, (num & 0x0000FF) + amount))
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`
}
