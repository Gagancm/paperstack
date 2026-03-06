import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Star, Folder, Delete } from 'react-iconly'
import { Copy, X, Check, Upload, Tag } from 'lucide-react'
import { useAppStore, LABEL_COLORS } from '../../store/appStore'

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

const COLOR_OPTIONS = [
  { id: 'blue', color: '#0A84FF' },
  { id: 'orange', color: '#FF9500' },
  { id: 'yellow', color: '#FFD60A' },
  { id: 'green', color: '#30D158' },
  { id: 'teal', color: '#48C9B0' },
  { id: 'red', color: '#FF453A' },
  { id: 'pink', color: '#FF375F' },
  { id: 'purple', color: '#BF5AF2' },
  { id: 'gray', color: '#8E8E93' },
]

export default function NoteCard({ note, onClick, isSelected }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState(null)
  const menuButtonRef = useRef(null)
  
  const { togglePinNote, deleteNote, duplicateNote, folders, updateNote, addToast, labels, addLabelToNote, removeLabelFromNote } = useAppStore()
  
  // Get color from note or default to blue
  const colorKey = note.colorKey || 'blue'
  const colors = NOTEBOOK_COLORS[colorKey] || NOTEBOOK_COLORS.blue

  const openMenu = (e) => {
    e.stopPropagation()
    if (menuButtonRef.current) {
      const r = menuButtonRef.current.getBoundingClientRect()
      // Position menu to the right of the card
      setMenuPosition({ 
        top: Math.max(100, r.top - 100), 
        left: Math.min(window.innerWidth - 280, r.right + 10)
      })
    }
    setMenuOpen(true)
  }

  const handleCardClick = () => {
    if (menuOpen) return
    onClick?.(note.id)
  }

  const handleCloseMenu = (e) => {
    if (e) e.stopPropagation()
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
        <NoteEditMenu
          menuPosition={menuPosition}
          note={note}
          folders={folders}
          labels={labels}
          onClose={handleCloseMenu}
          updateNote={updateNote}
          togglePinNote={togglePinNote}
          deleteNote={deleteNote}
          duplicateNote={duplicateNote}
          addToast={addToast}
          addLabelToNote={addLabelToNote}
          removeLabelFromNote={removeLabelFromNote}
        />,
        document.body
      )}
    </div>
  )
}

function NoteEditMenu({ 
  menuPosition, 
  note, 
  folders, 
  labels,
  onClose, 
  updateNote, 
  togglePinNote, 
  deleteNote, 
  duplicateNote, 
  addToast,
  addLabelToNote,
  removeLabelFromNote
}) {
  const [activeTab, setActiveTab] = useState('color') // 'color' or 'tag'
  const [title, setTitle] = useState(note.title || '')
  const [selectedColor, setSelectedColor] = useState(note.colorKey || 'blue')
  const inputRef = useRef(null)

  useEffect(() => {
    // Focus input when menu opens
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  const handleTitleChange = (e) => {
    setTitle(e.target.value)
    updateNote(note.id, { title: e.target.value })
  }

  const handleColorSelect = (colorId) => {
    setSelectedColor(colorId)
    updateNote(note.id, { colorKey: colorId })
  }

  const handleToggleLabel = (labelId) => {
    if (note.labels?.includes(labelId)) {
      removeLabelFromNote(note.id, labelId)
    } else {
      addLabelToNote(note.id, labelId)
    }
  }

  const handleMove = () => {
    addToast({ message: 'Move feature coming soon' })
    onClose()
  }

  const handleExport = () => {
    addToast({ message: 'Export feature coming soon' })
    onClose()
  }

  const handleDelete = () => {
    deleteNote(note.id)
    onClose()
  }

  return (
    <>
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <div
        className="fixed bg-[#2C2C2E] rounded-2xl shadow-xl z-[9999] w-[260px] overflow-hidden border border-[#3A3A3C]"
        style={{ top: menuPosition.top, left: menuPosition.left }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Name Input Section */}
        <div className="p-3 pb-2">
          <div className="bg-[#1C1C1E] rounded-xl flex items-center px-3 py-2.5">
            <input
              ref={inputRef}
              type="text"
              value={title}
              onChange={handleTitleChange}
              placeholder="Name"
              className="flex-1 bg-transparent text-white text-[17px] outline-none placeholder-[#8E8E93]"
            />
            <button 
              onClick={onClose}
              className="p-1 rounded-full bg-[#3A3A3C] hover:bg-[#4A4A4C] transition-colors ml-2"
            >
              <X size={14} className="text-[#8E8E93]" />
            </button>
          </div>
        </div>

        {/* Color/Tag Tabs */}
        <div className="px-3 pb-2">
          <div className="bg-[#1C1C1E] rounded-xl p-1 flex">
            <button
              onClick={() => setActiveTab('color')}
              className={`flex-1 py-2 rounded-lg text-[15px] font-medium transition-colors ${
                activeTab === 'color' 
                  ? 'bg-[#3A3A3C] text-white' 
                  : 'text-[#8E8E93]'
              }`}
            >
              Color
            </button>
            <button
              onClick={() => setActiveTab('tag')}
              className={`flex-1 py-2 rounded-lg text-[15px] font-medium transition-colors ${
                activeTab === 'tag' 
                  ? 'bg-[#3A3A3C] text-white' 
                  : 'text-[#8E8E93]'
              }`}
            >
              Tag
            </button>
          </div>

          {/* Color Options */}
          {activeTab === 'color' && (
            <div className="flex items-center justify-center gap-2 mt-3 pb-1">
              {COLOR_OPTIONS.map((opt) => (
                <button
                  key={opt.id}
                  onClick={() => handleColorSelect(opt.id)}
                  className="relative w-7 h-7 rounded-full transition-transform hover:scale-110"
                  style={{ backgroundColor: opt.color }}
                >
                  {selectedColor === opt.id && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check size={16} className="text-white" strokeWidth={3} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          )}

          {/* Tag Options */}
          {activeTab === 'tag' && (
            <div className="flex items-center justify-center gap-2 mt-3 pb-1 flex-wrap">
              {labels.length > 0 ? (
                labels.map((label) => (
                  <button
                    key={label.id}
                    onClick={() => handleToggleLabel(label.id)}
                    className={`relative w-7 h-7 rounded-full transition-transform hover:scale-110 ${
                      note.labels?.includes(label.id) ? 'ring-2 ring-white ring-offset-2 ring-offset-[#1C1C1E]' : ''
                    }`}
                    style={{ backgroundColor: LABEL_COLORS[label.color] }}
                    title={label.name}
                  >
                    {note.labels?.includes(label.id) && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check size={14} className="text-white" strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))
              ) : (
                <p className="text-[#8E8E93] text-sm py-2">No tags created</p>
              )}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="px-3 pb-2">
          <div className="bg-[#1C1C1E] rounded-xl overflow-hidden">
            {/* Move */}
            <button
              onClick={handleMove}
              className="w-full px-4 py-3.5 flex items-center gap-4 hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]"
            >
              <Folder set="broken" size={22} stroke="regular" primaryColor="#fff" />
              <span className="text-white text-[17px]">Move</span>
            </button>

            {/* Export */}
            <button
              onClick={handleExport}
              className="w-full px-4 py-3.5 flex items-center gap-4 hover:bg-[#2A2A2C] transition-colors"
            >
              <Upload size={22} className="text-white" />
              <span className="text-white text-[17px]">Export</span>
            </button>
          </div>
        </div>

        {/* Delete Button */}
        <div className="px-3 pb-3">
          <button
            onClick={handleDelete}
            className="w-full bg-[#1C1C1E] rounded-xl px-4 py-3.5 flex items-center gap-4 hover:bg-[#2A2A2C] transition-colors"
          >
            <Delete set="broken" size={22} stroke="regular" primaryColor="#FF453A" />
            <span className="text-[#FF453A] text-[17px]">Move to Trash</span>
          </button>
        </div>
      </div>
    </>
  )
}

export { NOTEBOOK_COLORS }
