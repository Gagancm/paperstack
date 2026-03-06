import { useState, useRef } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Star, Folder, Delete } from 'react-iconly'
import { Copy } from 'lucide-react' // Copy not available in Iconly
import { useAppStore } from '../../store/appStore'

// Notebook color options using our existing color scheme
const NOTEBOOK_COLORS = {
  blue: { main: '#0A84FF', spine: '#0866CC', cover: '#3BA1FF', accent: '#60B8FF' },
  purple: { main: '#BF5AF2', spine: '#9645C2', cover: '#D17FF7', accent: '#E0A0FA' },
  pink: { main: '#FF375F', spine: '#CC2C4C', cover: '#FF6B8A', accent: '#FF9AAF' },
  red: { main: '#FF453A', spine: '#CC372E', cover: '#FF7A72', accent: '#FFA099' },
  orange: { main: '#FF9500', spine: '#CC7700', cover: '#FFB340', accent: '#FFCC73' },
  yellow: { main: '#FFD60A', spine: '#CCAB08', cover: '#FFE347', accent: '#FFED80' },
  green: { main: '#30D158', spine: '#26A746', cover: '#5EDE7E', accent: '#8BE9A2' },
  teal: { main: '#48C9B0', spine: '#3AA18D', cover: '#6DD5C3', accent: '#95E2D5' },
  gray: { main: '#8E8E93', spine: '#727276', cover: '#AEAEB2', accent: '#C7C7CB' },
}

export default function NoteCard({ note, onClick, isSelected }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState(null)
  const menuButtonRef = useRef(null)
  
  const { togglePinNote, deleteNote, duplicateNote, folders, updateNote, addToast } = useAppStore()
  
  // Get color from note or default to blue
  const colorKey = note.colorKey || 'blue'
  const colors = NOTEBOOK_COLORS[colorKey] || NOTEBOOK_COLORS.blue

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
    onClick?.(note.id)
  }

  const handleToggleFavorite = (e) => {
    e.stopPropagation()
    togglePinNote(note.id)
    setMenuOpen(false)
  }

  const handleDelete = (e) => {
    e.stopPropagation()
    deleteNote(note.id)
    setMenuOpen(false)
  }

  const handleDuplicate = (e) => {
    e.stopPropagation()
    duplicateNote(note.id)
    setMenuOpen(false)
  }

  const handleMoveToFolder = (e, folderId) => {
    e.stopPropagation()
    updateNote(note.id, { folderId: folderId || null })
    const folderName = folderId ? folders.find(f => f.id === folderId)?.name : 'No Folder'
    addToast({ message: `Moved to ${folderName}` })
    setMenuOpen(false)
  }

  const handleCloseMenu = (e) => {
    e.stopPropagation()
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
      {/* Notebook graphic - taller portrait style like Goodnotes */}
      <div className={`relative w-[90px] h-[115px] mb-2 ${isSelected ? 'ring-2 ring-[#0A84FF] ring-offset-2 ring-offset-[#1C1C1E] rounded-lg' : ''}`}>
        {/* Shadow */}
        <div 
          className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[6px] rounded-[50%] bg-black/30 blur-[3px]"
        />
        
        {/* Notebook body */}
        <div 
          className="absolute bottom-[4px] left-0 right-0 h-[105px] rounded-lg transition-transform group-hover:scale-[1.02] overflow-hidden flex"
          style={{ backgroundColor: colors.main }}
        >
          {/* Spine (left edge) - darker, like book binding */}
          <div 
            className="w-[10px] h-full flex-shrink-0 relative"
            style={{ backgroundColor: colors.spine }}
          >
            {/* Spine ridge lines */}
            <div className="absolute top-[15%] left-0 right-0 h-[1px]" style={{ backgroundColor: colors.main, opacity: 0.3 }} />
            <div className="absolute top-[85%] left-0 right-0 h-[1px]" style={{ backgroundColor: colors.main, opacity: 0.3 }} />
          </div>
          
          {/* Inner cover accent stripe */}
          <div 
            className="w-[8px] h-full flex-shrink-0"
            style={{ backgroundColor: colors.accent }}
          />
          
          {/* Main cover */}
          <div 
            className="flex-1 h-full relative"
            style={{ 
              background: `linear-gradient(145deg, ${colors.cover} 0%, ${colors.main} 60%, ${colors.spine} 100%)`,
            }}
          >
            {/* Cover shine effect */}
            <div 
              className="absolute inset-0"
              style={{
                background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 40%, rgba(0,0,0,0.1) 100%)',
              }}
            />
            
            {/* Subtle texture lines */}
            <div 
              className="absolute top-3 right-2 bottom-3 w-[1px]"
              style={{ backgroundColor: 'rgba(255,255,255,0.1)' }}
            />
            
            {/* Favorite star */}
            {note.pinned && (
              <div className="absolute top-2 right-2 text-white/90">
                <Star set="bold" size={14} filled />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Note info */}
      <div className="w-full text-center px-1">
        <div className="flex items-center justify-center gap-0.5">
          <p className="text-white font-medium text-sm truncate max-w-[90px]">
            {note.title || 'Untitled'}
          </p>
          <button
            ref={menuButtonRef}
            onClick={openMenu}
            className="p-0.5 rounded hover:bg-white/10 transition-colors shrink-0 text-[#0A84FF]"
          >
            <ChevronDown set="broken" size={12} stroke="regular" />
          </button>
        </div>
        <p className="text-[#8E8E93] text-[11px]">
          {formatDate(note.updatedAt)}
        </p>
      </div>

      {/* Menu */}
      {menuOpen && menuPosition && createPortal(
        <NoteMenu
          menuPosition={menuPosition}
          note={note}
          folders={folders}
          onToggleFavorite={handleToggleFavorite}
          onDuplicate={handleDuplicate}
          onMoveToFolder={handleMoveToFolder}
          onDelete={handleDelete}
          onClose={handleCloseMenu}
        />,
        document.body
      )}
    </div>
  )
}

function NoteMenu({ menuPosition, note, folders, onToggleFavorite, onDuplicate, onMoveToFolder, onDelete, onClose }) {
  const [showFolders, setShowFolders] = useState(false)

  return (
    <>
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <div
        className="fixed bg-[#2C2C2E] rounded-lg shadow-xl z-[9999] min-w-[180px] py-1 border border-[#3A3A3C]"
        style={{ top: menuPosition.top, left: menuPosition.left }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onToggleFavorite}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-white hover:bg-[#3A3A3C]"
        >
          <div className={note.pinned ? 'text-yellow-500' : 'text-[#8E8E93]'}>
            <Star set={note.pinned ? 'bold' : 'broken'} size={16} stroke="regular" />
          </div>
          <span className="text-sm">{note.pinned ? 'Remove from Favorites' : 'Add to Favorites'}</span>
        </button>

        <div className="h-px bg-[#3A3A3C] mx-2" />

        <div className="relative">
          <button
            onClick={() => setShowFolders(!showFolders)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-white hover:bg-[#3A3A3C]"
          >
            <div className="text-[#8E8E93]">
              <Folder set="broken" size={16} stroke="regular" />
            </div>
            <span className="text-sm flex-1">Move to Folder</span>
            <div className={`text-[#8E8E93] transition-transform ${showFolders ? 'rotate-180' : ''}`}>
              <ChevronDown set="broken" size={14} stroke="regular" />
            </div>
          </button>
          
          {showFolders && (
            <div className="bg-[#1C1C1E] py-1">
              <button
                onClick={(e) => onMoveToFolder(e, null)}
                className={`w-full px-6 py-2 text-left text-sm hover:bg-[#3A3A3C] ${!note.folderId ? 'text-[#0A84FF]' : 'text-white'}`}
              >
                No Folder
              </button>
              {folders.map((folder) => (
                <button
                  key={folder.id}
                  onClick={(e) => onMoveToFolder(e, folder.id)}
                  className={`w-full px-6 py-2 text-left text-sm hover:bg-[#3A3A3C] ${note.folderId === folder.id ? 'text-[#0A84FF]' : 'text-white'}`}
                >
                  {folder.name}
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="h-px bg-[#3A3A3C] mx-2" />

        <button
          onClick={onDuplicate}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-white hover:bg-[#3A3A3C]"
        >
          <Copy size={16} className="text-[#8E8E93]" />
          <span className="text-sm">Duplicate</span>
        </button>

        <div className="h-px bg-[#3A3A3C] mx-2" />

        <button
          onClick={onDelete}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-[#FF453A] hover:bg-[#3A3A3C]"
        >
          <Delete set="broken" size={16} stroke="regular" />
          <span className="text-sm">Delete</span>
        </button>
      </div>
    </>
  )
}

export { NOTEBOOK_COLORS }
