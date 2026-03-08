import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Star, Folder, Delete, Image as ImageIcon, TickSquare } from 'react-iconly'
import { Copy, X, Check, Upload, Plus, Tag, Palette, Grid, Heart, Calendar, Globe, Bell, BookOpen, Music, Camera, Film, Coffee, Zap, Bookmark, Award, Flag, Home, Briefcase, GraduationCap, RotateCcw, Trash2 } from 'lucide-react'
import { useAppStore, LABEL_COLORS } from '../../store/appStore'

// Notebook color options - one entry per palette id so each selection shows its actual color
const NOTEBOOK_COLORS = {
  red: { main: '#FF453A', spine: '#CC372E', cover: '#FF7A72', accent: '#FFA099' },
  orange: { main: '#FF9500', spine: '#CC7700', cover: '#FFB340', accent: '#FFCC73' },
  yellow: { main: '#FFD60A', spine: '#CCAB08', cover: '#FFE347', accent: '#FFED80' },
  lime: { main: '#8BC34A', spine: '#6B9B3A', cover: '#A5D66A', accent: '#C5E89E' },
  green: { main: '#30D158', spine: '#26A746', cover: '#5EDE7E', accent: '#8BE9A2' },
  teal: { main: '#48C9B0', spine: '#3AA18D', cover: '#6DD5C3', accent: '#95E2D5' },
  cyan: { main: '#32ADE6', spine: '#2280B8', cover: '#5BC0ED', accent: '#8ED5F5' },
  blue: { main: '#0A84FF', spine: '#0866CC', cover: '#3BA1FF', accent: '#60B8FF' },
  indigo: { main: '#5856D6', spine: '#3D3BA8', cover: '#7B78E0', accent: '#A5A3EB' },
  purple: { main: '#BF5AF2', spine: '#9645C2', cover: '#D17FF7', accent: '#E0A0FA' },
  pink: { main: '#FF375F', spine: '#CC2C4C', cover: '#FF6B8A', accent: '#FF9AAF' },
  magenta: { main: '#FF2D92', spine: '#CC2575', cover: '#FF5AA8', accent: '#FF8AC4' },
  mint: { main: '#A5D6A7', spine: '#7AB07C', cover: '#C5E8C6', accent: '#DDF0DE' },
  sky: { main: '#81D4FA', spine: '#5AB0E0', cover: '#A8E2FC', accent: '#C9EDFD' },
  gray: { main: '#8E8E93', spine: '#727276', cover: '#AEAEB2', accent: '#C7C7CB' },
  white: { main: '#E5E5EA', spine: '#C7C7CC', cover: '#F2F2F7', accent: '#FFFFFF' },
}

// Color palette (subset; each id maps to a notebook color key)
const COLOR_PALETTE = [
  { id: 'red', color: '#FF453A' },
  { id: 'orange', color: '#FF9500' },
  { id: 'yellow', color: '#FFD60A' },
  { id: 'lime', color: '#8BC34A' },
  { id: 'green', color: '#30D158' },
  { id: 'teal', color: '#48C9B0' },
  { id: 'cyan', color: '#32ADE6' },
  { id: 'blue', color: '#0A84FF' },
  { id: 'indigo', color: '#5856D6' },
  { id: 'purple', color: '#BF5AF2' },
  { id: 'pink', color: '#FF375F' },
  { id: 'magenta', color: '#FF2D92' },
  { id: 'mint', color: '#A5D6A7' },
  { id: 'sky', color: '#81D4FA' },
  { id: 'gray', color: '#8E8E93' },
  { id: 'white', color: '#FFFFFF' },
]

const LABEL_COLOR_OPTIONS = Object.entries(LABEL_COLORS).map(([id, color]) => ({ id, color }))

// Icon options for notebooks (18 total)
const ICON_OPTIONS = [
  { id: 'none', icon: null, label: 'None' },
  { id: 'heart', icon: Heart, label: 'Heart' },
  { id: 'star', icon: Star, label: 'Star' },
  { id: 'calendar', icon: Calendar, label: 'Calendar' },
  { id: 'globe', icon: Globe, label: 'Globe' },
  { id: 'bell', icon: Bell, label: 'Bell' },
  { id: 'book', icon: BookOpen, label: 'Book' },
  { id: 'music', icon: Music, label: 'Music' },
  { id: 'camera', icon: Camera, label: 'Camera' },
  { id: 'film', icon: Film, label: 'Film' },
  { id: 'coffee', icon: Coffee, label: 'Coffee' },
  { id: 'zap', icon: Zap, label: 'Zap' },
  { id: 'bookmark', icon: Bookmark, label: 'Bookmark' },
  { id: 'award', icon: Award, label: 'Award' },
  { id: 'flag', icon: Flag, label: 'Flag' },
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'briefcase', icon: Briefcase, label: 'Work' },
  { id: 'graduation', icon: GraduationCap, label: 'School' },
]

export default function NoteCard({ note, onClick, isSelected }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState(null)
  const menuButtonRef = useRef(null)
  
  const { togglePinNote, deleteNote, duplicateNote, folders, updateNote, addToast, labels, addLabelToNote, removeLabelFromNote } = useAppStore()
  
  // Get color from note or default to blue
  const colorKey = note.colorKey || 'blue'
  const colors = NOTEBOOK_COLORS[colorKey] || NOTEBOOK_COLORS.blue
  const noteIcon = note.icon || null

  const openMenu = (e) => {
    e.stopPropagation()
    if (menuButtonRef.current) {
      const r = menuButtonRef.current.getBoundingClientRect()
      // Position menu right next to the dropdown chevron, slightly above it
      const menuWidth = note.inTrash ? 280 : 340
      setMenuPosition({ 
        top: r.top - 8,
        left: Math.min(window.innerWidth - menuWidth - 12, r.right + 6)
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
    if (isToday) return 'Today'
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    if (d.toDateString() === yesterday.toDateString()) return 'Yesterday'
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  }

  // Get icon component if set
  const IconComponent = noteIcon ? ICON_OPTIONS.find(i => i.id === noteIcon)?.icon : null

  return (
    <motion.div 
      className="flex flex-col items-center cursor-pointer group"
      onClick={handleCardClick}
      style={{ width: '120px' }}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
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
            
            {/* Custom Icon in center */}
            {IconComponent && (
              <div className="absolute inset-0 flex items-center justify-center">
                <IconComponent size={28} className="text-white/80" />
              </div>
            )}
            
            {/* Favorite star */}
            {note.pinned && (
              <div className="absolute top-2 right-2 text-white/90">
                <Star set="bold" size={14} filled />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Note info: left = name + day, right = dropdown */}
      <div className="w-full px-1 flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1 text-left">
          <p className="text-white font-medium text-sm truncate">
            {note.title || 'Untitled'}
          </p>
          <p className="text-[#8E8E93] text-[11px]">
            {formatDate(note.updatedAt)}
          </p>
        </div>
        <button
          ref={menuButtonRef}
          onClick={openMenu}
          className="p-1 rounded hover:bg-white/10 transition-colors shrink-0 text-[#0A84FF]"
        >
          <ChevronDown set="broken" size={20} stroke="regular" />
        </button>
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
    </motion.div>
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
  const [activeTab, setActiveTab] = useState('image') // 'image', 'color', 'tag', 'icon'
  const [title, setTitle] = useState(note.title || '')
  const [selectedColor, setSelectedColor] = useState(note.colorKey || 'blue')
  const [selectedIcon, setSelectedIcon] = useState(note.icon || 'none')
  const [showNewLabelInput, setShowNewLabelInput] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState('blue')
  const inputRef = useRef(null)
  const newLabelInputRef = useRef(null)
  
  const { createLabel, restoreNote, permanentlyDeleteNote } = useAppStore()
  
  const noteLabelIds = note.labels || []
  const inTrash = note.inTrash === true

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

  const handleIconSelect = (iconId) => {
    setSelectedIcon(iconId)
    updateNote(note.id, { icon: iconId === 'none' ? null : iconId })
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
    addToast({ type: 'success', message: `Label "${newLabelName.trim()}" created` })
  }

  const handleMove = () => {
    addToast({ type: 'info', message: 'Move feature coming soon' })
    onClose()
  }

  const handleExport = () => {
    addToast({ type: 'info', message: 'Export feature coming soon' })
    onClose()
  }

  const handleDelete = () => {
    deleteNote(note.id)
    onClose()
  }

  const tabs = [
    { id: 'image', icon: ImageIcon, label: 'Image' },
    { id: 'color', icon: Palette, label: 'Color' },
    { id: 'tag', icon: Tag, label: 'Tag' },
    { id: 'icon', icon: Grid, label: 'Icon' },
  ]

  // Trash: only Restore and Delete Permanently (no rename/title bar)
  if (inTrash) {
    return (
      <>
        <div className="fixed inset-0 z-[9998]" onClick={onClose} />
        <div
          className="fixed bg-[#2C2C2E] rounded-2xl shadow-xl z-[9999] min-w-[260px] w-max overflow-hidden border border-[#3A3A3C]"
          style={{ top: menuPosition.top, left: menuPosition.left }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="px-3 py-3 space-y-2">
            <button
              onClick={() => { restoreNote(note.id); addToast({ type: 'success', message: 'Restored' }); onClose() }}
              className="w-full bg-[#1C1C1E] rounded-xl px-4 py-3.5 flex items-center gap-4 hover:bg-[#2A2A2C] transition-colors text-left"
            >
              <RotateCcw size={22} className="text-[#30D158] shrink-0" />
              <span className="text-white text-[17px] whitespace-nowrap">Restore</span>
            </button>
            <button
              onClick={() => { permanentlyDeleteNote(note.id); addToast({ type: 'success', message: 'Deleted permanently' }); onClose() }}
              className="w-full bg-[#1C1C1E] rounded-xl px-4 py-3.5 flex items-center gap-4 hover:bg-[#2A2A2C] transition-colors text-left"
            >
              <Trash2 size={22} className="text-[#FF453A] shrink-0" />
              <span className="text-[#FF453A] text-[17px] whitespace-nowrap">Delete Permanently</span>
            </button>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <div className="fixed inset-0 z-[9998]" onClick={onClose} />
      <div
        className="fixed bg-[#2C2C2E] rounded-2xl shadow-xl z-[9999] w-[340px] overflow-hidden border border-[#3A3A3C]"
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

        {/* 4-Tab Segmented Control */}
        <div className="px-3 pb-2">
          <div className="bg-[#1C1C1E] rounded-xl p-1 flex">
            {tabs.map((tab) => {
              const TabIcon = tab.icon
              const isActive = activeTab === tab.id
              return (
                <motion.button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  whileTap={{ scale: 0.97 }}
                  className={`flex-1 py-2.5 rounded-lg flex flex-col items-center gap-1 transition-colors ${
                    isActive 
                      ? 'bg-[#3A3A3C] text-white' 
                      : 'text-[#8E8E93] hover:text-white'
                  }`}
                >
                  {tab.id === 'image' ? (
                    <TabIcon set="broken" size={20} stroke="regular" primaryColor={isActive ? '#fff' : '#8E8E93'} />
                  ) : (
                    <TabIcon size={20} />
                  )}
                  <span className="text-[11px] font-medium">{tab.label}</span>
                </motion.button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-3 pb-2 relative min-h-[100px]">
          <AnimatePresence mode="wait">
          {/* Image Tab */}
          {activeTab === 'image' && (
            <motion.div key="image" initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} transition={{ duration: 0.18 }} className="bg-[#1C1C1E] rounded-xl p-4">
              <div className="h-14 flex flex-row items-center justify-center gap-2 border-2 border-dashed border-[#3A3A3C] rounded-xl px-3">
                <ImageIcon set="broken" size={20} stroke="regular" primaryColor="#8E8E93" />
                <p className="text-[#8E8E93] text-xs">Add Cover Image</p>
                <button className="px-3 py-1.5 bg-[#0A84FF] text-white text-xs font-medium rounded-lg hover:bg-[#0A84FF]/80 transition-colors">
                  Choose Image
                </button>
              </div>
            </motion.div>
          )}

          {/* Color Tab */}
          {activeTab === 'color' && (
            <motion.div key="color" initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} transition={{ duration: 0.18 }} className="bg-[#1C1C1E] rounded-xl p-4">
              {/* Color Grid */}
              <div className="grid grid-cols-8 gap-3">
                {COLOR_PALETTE.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleColorSelect(opt.id)}
                    className={`relative w-6 h-6 rounded-full transition-transform hover:scale-110 ${
                      opt.id === 'white' ? 'border border-[#3A3A3C]' : ''
                    }`}
                    style={{ backgroundColor: opt.color }}
                  >
                    {selectedColor === opt.id && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <Check size={14} className={opt.id === 'white' ? 'text-gray-800' : 'text-white'} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </motion.div>
          )}

          {/* Tag Tab */}
          {activeTab === 'tag' && (
            <motion.div key="tag" initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} transition={{ duration: 0.18 }}>
              {/* Existing Labels */}
              <div className="bg-[#1C1C1E] rounded-xl overflow-hidden max-h-[220px] overflow-y-auto">
                {labels.length > 0 ? (
                  labels.map((label, index) => (
                    <button
                      key={label.id}
                      onClick={() => handleLabelToggle(label.id)}
                      className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] transition-colors ${
                        index < labels.length - 1 ? 'border-b border-[#3A3A3C]' : ''
                      }`}
                    >
                      {/* Label color dot */}
                      <div 
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: LABEL_COLORS[label.color] }}
                      />
                      
                      {/* Label name */}
                      <span className="text-white text-[15px] flex-1 text-left">{label.name}</span>
                      
                      {/* Checkbox */}
                      {noteLabelIds.includes(label.id) && (
                        <TickSquare set="bold" size={22} primaryColor="#0A84FF" />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="px-4 py-6 text-center">
                    <Tag size={28} className="text-[#8E8E93] mx-auto mb-2" />
                    <p className="text-[#8E8E93] text-sm">No tags yet</p>
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
                  <span className="text-[#0A84FF] text-[15px] font-medium">Create new tag</span>
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
                    placeholder="Enter tag name"
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
            </motion.div>
          )}

          {/* Icon Tab */}
          {activeTab === 'icon' && (
            <motion.div key="icon" initial={{ opacity: 0, x: 6 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -6 }} transition={{ duration: 0.18 }} className="bg-[#1C1C1E] rounded-xl p-4 max-h-[250px] overflow-y-auto">
              <div className="grid grid-cols-6 gap-3">
                {ICON_OPTIONS.map((opt) => {
                  const IconComp = opt.icon
                  const isSelected = selectedIcon === opt.id
                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleIconSelect(opt.id)}
                      className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                        isSelected 
                          ? 'bg-[#0A84FF] text-white' 
                          : 'bg-[#2C2C2E] text-[#8E8E93] hover:bg-[#3A3A3C] hover:text-white'
                      }`}
                      title={opt.label}
                    >
                      {opt.id === 'none' ? (
                        <X size={20} />
                      ) : opt.id === 'star' ? (
                        <Star set="broken" size={20} stroke="regular" primaryColor={isSelected ? '#fff' : '#8E8E93'} />
                      ) : IconComp ? (
                        <IconComp size={20} />
                      ) : null}
                    </button>
                  )
                })}
              </div>
            </motion.div>
          )}
          </AnimatePresence>
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

export { NOTEBOOK_COLORS, COLOR_PALETTE, ICON_OPTIONS }
