import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Delete, Star, Edit } from 'react-iconly'
import { useAppStore } from '../../store/appStore'

// Folder color options using our existing color scheme
const FOLDER_COLORS = {
  blue: { main: '#0A84FF', light: '#3BA1FF', dark: '#0070E0' },
  purple: { main: '#BF5AF2', light: '#D17FF7', dark: '#A347D1' },
  pink: { main: '#FF375F', light: '#FF6B8A', dark: '#E0274D' },
  red: { main: '#FF453A', light: '#FF7A72', dark: '#E03830' },
  orange: { main: '#FF9500', light: '#FFB340', dark: '#E08500' },
  yellow: { main: '#FFD60A', light: '#FFE347', dark: '#E0BD00' },
  green: { main: '#30D158', light: '#5EDE7E', dark: '#28B84C' },
  teal: { main: '#48C9B0', light: '#6DD5C3', dark: '#3AB39B' },
  gray: { main: '#8E8E93', light: '#AEAEB2', dark: '#7A7A7E' },
}

export default function FolderCard({ folder, noteCount = 0, onClick, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState(null)
  const menuButtonRef = useRef(null)
  
  const { updateFolder, addToast } = useAppStore()

  // Get color from folder or default to blue
  const colorKey = folder.colorKey || 'blue'
  const colors = FOLDER_COLORS[colorKey] || FOLDER_COLORS.blue

  const openMenu = (e) => {
    e.stopPropagation()
    if (menuButtonRef.current) {
      const r = menuButtonRef.current.getBoundingClientRect()
      setMenuPosition({ top: r.bottom + 4, left: Math.max(8, r.left - 100) })
    }
    setMenuOpen(true)
  }

  const handleCardClick = () => {
    if (menuOpen) return
    onClick?.()
  }

  const handleCloseMenu = (e) => {
    e.stopPropagation()
    setMenuOpen(false)
  }

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

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const today = new Date()
    const isToday = d.toDateString() === today.toDateString()
    if (isToday) {
      return `Today at ${d.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
    }
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  return (
    <div 
      className="flex flex-col items-center cursor-pointer group"
      onClick={handleCardClick}
      style={{ width: '120px' }}
    >
      {/* Folder graphic - square macOS style */}
      <div className="relative w-[100px] h-[85px] mb-2">
        {/* Shadow */}
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] h-[6px] rounded-[50%] bg-black/30 blur-[3px]"
        />
        
        {/* Back of folder */}
        <div 
          className="absolute bottom-[4px] left-1/2 -translate-x-1/2 w-[95%] h-[65px] rounded-md"
          style={{ backgroundColor: colors.dark }}
        />
        
        {/* Folder tab */}
        <div 
          className="absolute top-0 left-[6px] w-[38%] h-[14px] rounded-t-md"
          style={{ backgroundColor: colors.main }}
        />
        
        {/* Front of folder */}
        <div 
          className="absolute bottom-[4px] left-1/2 -translate-x-1/2 w-[95%] h-[58px] rounded-md transition-transform group-hover:scale-[1.02]"
          style={{ 
            background: `linear-gradient(180deg, ${colors.light} 0%, ${colors.main} 100%)`,
          }}
        >
          {/* Folder top edge highlight */}
          <div 
            className="absolute top-0 left-0 right-0 h-[2px] rounded-t-md"
            style={{ backgroundColor: colors.light, opacity: 0.8 }}
          />
          
          {/* Favorite star */}
          {folder.pinned && (
            <div className="absolute top-1.5 right-1.5 text-white/90">
              <Star set="bold" size={14} filled />
            </div>
          )}
        </div>
      </div>

      {/* Folder info */}
      <div className="w-full text-center px-1">
        <div className="flex items-center justify-center gap-0.5">
          <p className="text-white font-medium text-sm truncate max-w-[85px]">{folder.name}</p>
          <button
            ref={menuButtonRef}
            onClick={openMenu}
            className="p-0.5 rounded hover:bg-white/10 transition-colors shrink-0 text-[#0A84FF]"
          >
            <ChevronDown set="broken" size={12} stroke="regular" />
          </button>
        </div>
        <p className="text-[#8E8E93] text-[11px]">
          {formatDate(folder.updatedAt)}
        </p>
      </div>

      {/* Menu dropdown */}
      {menuOpen && menuPosition && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={handleCloseMenu} />
          <div
            className="fixed bg-[#2C2C2E] rounded-lg shadow-xl z-[9999] min-w-[180px] py-1 border border-[#3A3A3C]"
            style={{ top: menuPosition.top, left: menuPosition.left }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* Favorite */}
            <button
              onClick={handleToggleFavorite}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-white hover:bg-[#3A3A3C]"
            >
              <div className={folder.pinned ? 'text-yellow-500' : 'text-[#8E8E93]'}>
                <Star set={folder.pinned ? 'bold' : 'broken'} size={16} stroke="regular" />
              </div>
              <span className="text-sm">{folder.pinned ? 'Remove from Favorites' : 'Add to Favorites'}</span>
            </button>

            <div className="h-px bg-[#3A3A3C] mx-2" />

            {/* Rename */}
            <button
              onClick={(e) => { e.stopPropagation(); setMenuOpen(false) }}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-white hover:bg-[#3A3A3C]"
            >
              <div className="text-[#8E8E93]">
                <Edit set="broken" size={16} stroke="regular" />
              </div>
              <span className="text-sm">Rename</span>
            </button>

            <div className="h-px bg-[#3A3A3C] mx-2" />

            {/* Delete */}
            <button
              onClick={handleDelete}
              className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-[#FF453A] hover:bg-[#3A3A3C]"
            >
              <Delete set="broken" size={16} stroke="regular" />
              <span className="text-sm">Delete</span>
            </button>
          </div>
        </>,
        document.body
      )}
    </div>
  )
}

export { FOLDER_COLORS }
