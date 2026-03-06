import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Star, Folder, Delete } from 'react-iconly'
import { Copy, X, Check, Upload, Plus, Tag } from 'lucide-react'
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

const LABEL_COLOR_OPTIONS = Object.entries(LABEL_COLORS).map(([id, color]) => ({ id, color }))

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
        left: Math.min(window.innerWidth - 340, r.right + 10)
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
  const [activeTab, setActiveTab] = useState('color') // 'color' or 'label'
  const [title, setTitle] = useState(note.title || '')
  const [selectedColor, setSelectedColor] = useState(note.colorKey || 'blue')
  const [showNewLabelInput, setShowNewLabelInput] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState('blue')
  const inputRef = useRef(null)
  const newLabelInputRef = useRef(null)
  
  const { createLabel } = useAppStore()
  
  const noteLabelIds = note.labels || []

  useEffect(() => {
    // Focus input when menu opens
    setTimeout(() => inputRef.current?.focus(), 100)
  }, [])

  useEffect(() => {
    // Focus new label input when it appears
    if (showNewLabelInput) {
      setTimeout(() => newLabelInputRef.current?.focus(), 100)
    }
  }, [showNewLabelInput])

  const handleTitleChange = (e) => {
    setTitle(e.target.value)
    updateNote(note.id, { title: e.target.value })
  }

  const handleColorSelect = (colorId) => {
    setSelectedColor(colorId)
    updateNote(note.id, { colorKey: colorId })
  }

  const handleLabelToggle = (labelId) => {
    if (noteLabelIds.includes(labelId)) {
      removeLabelFromNote(note.id, labelId)
    } else {
      addLabelToNote(note.id, labelId)
    }
  }

  const handleCreateLabel = () => {
    if (!newLabelName.trim()) return
    const labelId = createLabel(newLabelName.trim(), newLabelColor)
    addLabelToNote(note.id, labelId)
    setNewLabelName('')
    setNewLabelColor('blue')
    setShowNewLabelInput(false)
    addToast({ message: `Label "${newLabelName.trim()}" created` })
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
        className="fixed bg-[#2C2C2E] rounded-2xl shadow-xl z-[9999] w-[320px] overflow-hidden border border-[#3A3A3C]"
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

        {/* Color/Label Tabs */}
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
              onClick={() => setActiveTab('label')}
              className={`flex-1 py-2 rounded-lg text-[15px] font-medium transition-colors ${
                activeTab === 'label' 
                  ? 'bg-[#3A3A3C] text-white' 
                  : 'text-[#8E8E93]'
              }`}
            >
              Label
            </button>
          </div>

          {/* Color Options */}
          {activeTab === 'color' && (
            <div className="flex items-center justify-center gap-2.5 mt-3 pb-1">
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

          {/* Label Options - Google Keep Style */}
          {activeTab === 'label' && (
            <div className="mt-3 pb-1">
              {/* Existing Labels */}
              <div className="bg-[#1C1C1E] rounded-xl overflow-hidden max-h-[200px] overflow-y-auto">
                {labels.length > 0 ? (
                  labels.map((label, index) => (
                    <button
                      key={label.id}
                      onClick={() => handleLabelToggle(label.id)}
                      className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] transition-colors ${
                        index < labels.length - 1 ? 'border-b border-[#3A3A3C]' : ''
                      }`}
                    >
                      {/* Checkbox */}
                      <div 
                        className={`w-5 h-5 rounded flex items-center justify-center border-2 transition-colors ${
                          noteLabelIds.includes(label.id)
                            ? 'bg-[#0A84FF] border-[#0A84FF]'
                            : 'border-[#8E8E93]'
                        }`}
                      >
                        {noteLabelIds.includes(label.id) && (
                          <Check size={14} className="text-white" strokeWidth={3} />
                        )}
                      </div>
                      
                      {/* Label color dot */}
                      <div 
                        className="w-3 h-3 rounded-full"
                        style={{ backgroundColor: LABEL_COLORS[label.color] }}
                      />
                      
                      {/* Label name */}
                      <span className="text-white text-[15px] flex-1 text-left">{label.name}</span>
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-4 text-center">
                    <Tag size={24} className="text-[#8E8E93] mx-auto mb-2" />
                    <p className="text-[#8E8E93] text-sm">No labels yet</p>
                  </div>
                )}
              </div>

              {/* Create New Label */}
              {!showNewLabelInput ? (
                <button
                  onClick={() => setShowNewLabelInput(true)}
                  className="w-full mt-2 px-4 py-3 flex items-center gap-3 bg-[#1C1C1E] rounded-xl hover:bg-[#2A2A2C] transition-colors"
                >
                  <Plus size={20} className="text-[#0A84FF]" />
                  <span className="text-[#0A84FF] text-[15px] font-medium">Create new label</span>
                </button>
              ) : (
                <div className="mt-2 bg-[#1C1C1E] rounded-xl p-3">
                  {/* New label name input */}
                  <input
                    ref={newLabelInputRef}
                    type="text"
                    value={newLabelName}
                    onChange={(e) => setNewLabelName(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleCreateLabel()
                      if (e.key === 'Escape') setShowNewLabelInput(false)
                    }}
                    placeholder="Enter label name"
                    className="w-full bg-[#2C2C2E] rounded-lg px-3 py-2.5 text-white text-[15px] outline-none placeholder-[#8E8E93] mb-3"
                  />
                  
                  {/* Color picker for new label */}
                  <div className="flex items-center gap-2 mb-3">
                    {LABEL_COLOR_OPTIONS.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => setNewLabelColor(opt.id)}
                        className="relative w-6 h-6 rounded-full transition-transform hover:scale-110"
                        style={{ backgroundColor: opt.color }}
                      >
                        {newLabelColor === opt.id && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <Check size={14} className="text-white" strokeWidth={3} />
                          </div>
                        )}
                      </button>
                    ))}
                  </div>
                  
                  {/* Action buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setShowNewLabelInput(false)
                        setNewLabelName('')
                      }}
                      className="flex-1 py-2 rounded-lg bg-[#3A3A3C] text-white text-[15px] font-medium hover:bg-[#4A4A4C] transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={handleCreateLabel}
                      disabled={!newLabelName.trim()}
                      className="flex-1 py-2 rounded-lg bg-[#0A84FF] text-white text-[15px] font-medium hover:bg-[#0A84FF]/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Create
                    </button>
                  </div>
                </div>
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
