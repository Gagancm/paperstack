import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Star, FolderInput, Trash2, Copy } from 'lucide-react'
import { useAppStore } from '../../store/appStore'

// Cover designs with geometric patterns
const COVER_DESIGNS = {
  'coral-geometric': {
    bg: 'linear-gradient(135deg, #E8A5A5 0%, #D4847A 100%)',
    shapes: [
      { type: 'triangle', color: '#F4C7AB', points: '0,100 60,100 30,50', opacity: 0.9 },
      { type: 'triangle', color: '#7EB8DA', points: '30,100 90,100 60,40', opacity: 0.85 },
      { type: 'triangle', color: '#F5E6D3', points: '60,100 100,100 100,60', opacity: 0.9 },
    ],
  },
  'blue-waves': {
    bg: 'linear-gradient(135deg, #5B9BD5 0%, #4A7FB8 100%)',
    shapes: [
      { type: 'curve', color: '#7BC5AE', d: 'M0,70 Q30,50 60,70 T100,70 L100,100 L0,100 Z', opacity: 0.85 },
      { type: 'curve', color: '#F4D03F', d: 'M0,80 Q40,60 70,80 T100,75 L100,100 L0,100 Z', opacity: 0.8 },
    ],
  },
  'purple-blocks': {
    bg: 'linear-gradient(135deg, #9B7ED9 0%, #7B5FC7 100%)',
    shapes: [
      { type: 'rect', color: '#F9A875', x: 10, y: 50, width: 35, height: 50, opacity: 0.9 },
      { type: 'rect', color: '#5DADE2', x: 40, y: 60, width: 30, height: 40, opacity: 0.85 },
      { type: 'rect', color: '#F7DC6F', x: 65, y: 55, width: 35, height: 45, opacity: 0.9 },
    ],
  },
  'green-layers': {
    bg: 'linear-gradient(135deg, #58D68D 0%, #45B97C 100%)',
    shapes: [
      { type: 'triangle', color: '#F8B500', points: '0,100 50,40 100,100', opacity: 0.85 },
      { type: 'triangle', color: '#E74C3C', points: '20,100 60,55 100,100', opacity: 0.8 },
    ],
  },
  'orange-sunset': {
    bg: 'linear-gradient(135deg, #F5A962 0%, #E8956A 100%)',
    shapes: [
      { type: 'circle', color: '#FADBD8', cx: 70, cy: 30, r: 20, opacity: 0.9 },
      { type: 'curve', color: '#85C1E9', d: 'M0,65 Q50,45 100,65 L100,100 L0,100 Z', opacity: 0.85 },
      { type: 'curve', color: '#2ECC71', d: 'M0,80 Q50,60 100,80 L100,100 L0,100 Z', opacity: 0.9 },
    ],
  },
  'pink-abstract': {
    bg: 'linear-gradient(135deg, #F1948A 0%, #E57498 100%)',
    shapes: [
      { type: 'triangle', color: '#AED6F1', points: '0,100 40,30 80,100', opacity: 0.85 },
      { type: 'circle', color: '#F9E79F', cx: 75, cy: 40, r: 18, opacity: 0.9 },
    ],
  },
  'teal-minimal': {
    bg: 'linear-gradient(135deg, #48C9B0 0%, #1ABC9C 100%)',
    shapes: [
      { type: 'rect', color: '#FFFFFF', x: 60, y: 20, width: 30, height: 30, opacity: 0.3 },
      { type: 'rect', color: '#FFFFFF', x: 70, y: 50, width: 25, height: 45, opacity: 0.2 },
    ],
  },
  'yellow-bright': {
    bg: 'linear-gradient(135deg, #F4D03F 0%, #F39C12 100%)',
    shapes: [
      { type: 'triangle', color: '#E74C3C', points: '10,100 50,40 90,100', opacity: 0.85 },
      { type: 'triangle', color: '#3498DB', points: '30,100 60,55 90,100', opacity: 0.8 },
    ],
  },
}

function getDesignFromColor(coverColor) {
  const colorMap = {
    '#E8A5A5': 'coral-geometric',
    '#5B9BD5': 'blue-waves',
    '#9B7ED9': 'purple-blocks',
    '#58D68D': 'green-layers',
    '#F5A962': 'orange-sunset',
    '#F1948A': 'pink-abstract',
    '#48C9B0': 'teal-minimal',
    '#F4D03F': 'yellow-bright',
  }
  return colorMap[coverColor] || 'coral-geometric'
}

export default function NoteCard({ note, onClick, isSelected }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState(null)
  const menuButtonRef = useRef(null)
  
  const { togglePinNote, deleteNote, duplicateNote, folders, updateNote, addToast } = useAppStore()
  
  const dateStr = formatNoteDate(note.updatedAt)
  const designId = note.coverDesignId || getDesignFromColor(note.coverColor)
  const design = COVER_DESIGNS[designId] || COVER_DESIGNS['coral-geometric']

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

  return (
    <div className="w-full cursor-pointer group" onClick={() => onClick?.(note.id)}>
      {/* Card container - same aspect ratio as folders */}
      <div className={`relative aspect-[3/4] rounded-xl overflow-hidden shadow-lg transition-transform group-hover:scale-[1.02] ${
        isSelected ? 'ring-2 ring-[#0A84FF]' : ''
      }`}>
        {/* Cover design */}
        <div 
          className="absolute inset-0"
          style={{ background: design?.bg }}
        >
          {/* SVG shapes */}
          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
            {design?.shapes?.map((shape, i) => {
              switch (shape.type) {
                case 'triangle':
                  return <polygon key={i} points={shape.points} fill={shape.color} opacity={shape.opacity} />
                case 'rect':
                  return <rect key={i} x={shape.x} y={shape.y} width={shape.width} height={shape.height} fill={shape.color} opacity={shape.opacity} />
                case 'circle':
                  return <circle key={i} cx={shape.cx} cy={shape.cy} r={shape.r} fill={shape.color} opacity={shape.opacity} />
                case 'curve':
                  return <path key={i} d={shape.d} fill={shape.color} opacity={shape.opacity} />
                default:
                  return null
              }
            })}
          </svg>
        </div>

        {/* Bottom info bar */}
        <div className="absolute bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm px-3 py-2">
          <p className="text-[10px] text-gray-500 leading-tight">{dateStr}</p>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <p className="text-[13px] font-semibold text-gray-900 truncate leading-tight">
                {note.title || 'Untitled'}
              </p>
              {note.pinned && <Star size={11} className="text-yellow-500 shrink-0" fill="currentColor" />}
            </div>
            <button
              ref={menuButtonRef}
              onClick={openMenu}
              className="p-0.5 -mr-1 rounded hover:bg-black/5 transition-colors"
            >
              <ChevronDown size={14} className="text-gray-400" />
            </button>
          </div>
        </div>
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
          onClose={() => setMenuOpen(false)}
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
      >
        <button
          onClick={onToggleFavorite}
          className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-white hover:bg-[#3A3A3C]"
        >
          <Star size={16} className={note.pinned ? 'text-yellow-500' : 'text-[#8E8E93]'} fill={note.pinned ? 'currentColor' : 'none'} />
          <span className="text-sm">{note.pinned ? 'Remove from Favorites' : 'Add to Favorites'}</span>
        </button>

        <div className="h-px bg-[#3A3A3C] mx-2" />

        <div className="relative">
          <button
            onClick={() => setShowFolders(!showFolders)}
            className="w-full flex items-center gap-3 px-4 py-2.5 text-left text-white hover:bg-[#3A3A3C]"
          >
            <FolderInput size={16} className="text-[#8E8E93]" />
            <span className="text-sm flex-1">Move to Folder</span>
            <ChevronDown size={14} className={`text-[#8E8E93] transition-transform ${showFolders ? 'rotate-180' : ''}`} />
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
          <Trash2 size={16} />
          <span className="text-sm">Delete</span>
        </button>
      </div>
    </>
  )
}

function formatNoteDate(isoString) {
  const d = new Date(isoString)
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}
