import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronDown, Delete, Star, Folder, Image as ImageIcon, TickSquare } from 'react-iconly'
import { X, Check, Upload, Plus, Tag, Palette, Grid, Heart, Calendar, Globe, Bell, BookOpen, Music, Camera, Film, Coffee, Zap, Bookmark, Award, Flag, Home, Briefcase, GraduationCap, FolderOpen, Archive, FileText, Inbox } from 'lucide-react'
import { useAppStore, LABEL_COLORS } from '../../store/appStore'

// Folder color options - one entry per palette id so each selection shows its actual color
const FOLDER_COLORS = {
  red: { main: '#FF453A', light: '#FF7A72', dark: '#E03830' },
  orange: { main: '#FF9500', light: '#FFB340', dark: '#E08500' },
  yellow: { main: '#FFD60A', light: '#FFE347', dark: '#E0BD00' },
  lime: { main: '#8BC34A', light: '#A5D66A', dark: '#6B9B3A' },
  green: { main: '#30D158', light: '#5EDE7E', dark: '#28B84C' },
  teal: { main: '#48C9B0', light: '#6DD5C3', dark: '#3AB39B' },
  cyan: { main: '#32ADE6', light: '#5BC0ED', dark: '#2280B8' },
  blue: { main: '#0A84FF', light: '#3BA1FF', dark: '#0070E0' },
  indigo: { main: '#5856D6', light: '#7B78E0', dark: '#3D3BA8' },
  purple: { main: '#BF5AF2', light: '#D17FF7', dark: '#A347D1' },
  pink: { main: '#FF375F', light: '#FF6B8A', dark: '#E0274D' },
  magenta: { main: '#FF2D92', light: '#FF5AA8', dark: '#CC2575' },
  mint: { main: '#A5D6A7', light: '#C5E8C6', dark: '#7AB07C' },
  sky: { main: '#81D4FA', light: '#A8E2FC', dark: '#5AB0E0' },
  gray: { main: '#8E8E93', light: '#AEAEB2', dark: '#7A7A7E' },
  white: { main: '#E5E5EA', light: '#F2F2F7', dark: '#C7C7CC' },
}

// Color palette (same as NoteCard; each id maps to a folder color key)
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

// Icon options for folders (18 total)
const FOLDER_ICON_OPTIONS = [
  { id: 'none', icon: null, label: 'None' },
  { id: 'folder', icon: FolderOpen, label: 'Folder' },
  { id: 'archive', icon: Archive, label: 'Archive' },
  { id: 'inbox', icon: Inbox, label: 'Inbox' },
  { id: 'file', icon: FileText, label: 'Files' },
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
]

export default function FolderCard({ folder, noteCount = 0, onClick, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState(null)
  const menuButtonRef = useRef(null)
  
  const { updateFolder, addToast, labels } = useAppStore()

  // Get color from folder or default to blue
  const colorKey = folder.colorKey || 'blue'
  const colors = FOLDER_COLORS[colorKey] || FOLDER_COLORS.blue
  const folderIcon = folder.icon || null

  const openMenu = (e) => {
    e.stopPropagation()
    if (menuButtonRef.current) {
      const r = menuButtonRef.current.getBoundingClientRect()
      // Position menu to the right of the card
      setMenuPosition({ 
        top: Math.max(100, r.top - 100), 
        left: Math.min(window.innerWidth - 360, r.right + 10)
      })
    }
    setMenuOpen(true)
  }

  const handleCardClick = () => {
    if (menuOpen) return
    onClick?.()
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

  // Get icon component if set
  const IconComponent = folderIcon ? FOLDER_ICON_OPTIONS.find(i => i.id === folderIcon)?.icon : null

  return (
    <motion.div 
      className="flex flex-col items-center cursor-pointer group w-[100px] sm:w-[110px] ipad:w-[120px]"
      onClick={handleCardClick}
      whileHover={{ scale: 1.03 }}
      whileTap={{ scale: 0.98 }}
      transition={{ type: 'spring', stiffness: 400, damping: 20 }}
    >
      {/* Folder graphic - responsive for mobile / iPad / desktop */}
      <div className="relative w-[80px] h-[68px] sm:w-[90px] sm:h-[76px] ipad:w-[100px] ipad:h-[85px] mb-2">
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
          
          {/* Custom Icon in center */}
          {IconComponent && (
            <div className="absolute inset-0 flex items-center justify-center">
              <IconComponent size={24} className="text-white/80" />
            </div>
          )}
          
          {/* Favorite star */}
          {folder.pinned && (
            <div className="absolute top-1.5 right-1.5 text-white/90">
              <Star set="bold" size={14} filled />
            </div>
          )}
        </div>
      </div>

      {/* Folder info */}
      <div className="w-full text-center px-0.5 sm:px-1">
        <div className="flex items-center justify-center gap-0.5">
          <p className="text-white font-medium text-xs sm:text-sm truncate max-w-[70px] sm:max-w-[85px]">{folder.name}</p>
          <button
            ref={menuButtonRef}
            onClick={openMenu}
            className="p-1.5 rounded hover:bg-white/10 transition-colors shrink-0 text-[#0A84FF] min-w-[44px] min-h-[44px] flex items-center justify-center ipad:min-w-0 ipad:min-h-0 ipad:p-0.5"
          >
            <ChevronDown set="broken" size={14} stroke="regular" />
          </button>
        </div>
        <p className="text-[#8E8E93] text-[10px] sm:text-[11px]">
          {formatDate(folder.updatedAt)}
        </p>
      </div>

      {/* Menu dropdown */}
      {menuOpen && menuPosition && createPortal(
        <FolderEditMenu
          menuPosition={menuPosition}
          folder={folder}
          labels={labels}
          onClose={handleCloseMenu}
          updateFolder={updateFolder}
          onDelete={onDelete}
          addToast={addToast}
        />,
        document.body
      )}
    </motion.div>
  )
}

function FolderEditMenu({ 
  menuPosition, 
  folder, 
  labels,
  onClose, 
  updateFolder, 
  onDelete,
  addToast
}) {
  const [activeTab, setActiveTab] = useState('image') // 'image', 'color', 'tag', 'icon'
  const [name, setName] = useState(folder.name || '')
  const [selectedColor, setSelectedColor] = useState(folder.colorKey || 'blue')
  const [selectedIcon, setSelectedIcon] = useState(folder.icon || 'none')
  const [showNewLabelInput, setShowNewLabelInput] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState('blue')
  const inputRef = useRef(null)
  const newLabelInputRef = useRef(null)
  
  const { createLabel, addLabelToFolder, removeLabelFromFolder } = useAppStore()
  
  const folderLabelIds = folder.labelIds || []

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

  const handleNameChange = (e) => {
    setName(e.target.value)
    updateFolder(folder.id, { name: e.target.value })
  }

  const handleColorSelect = (colorId) => {
    setSelectedColor(colorId)
    updateFolder(folder.id, { colorKey: colorId })
  }

  const handleIconSelect = (iconId) => {
    setSelectedIcon(iconId)
    updateFolder(folder.id, { icon: iconId === 'none' ? null : iconId })
  }

  const handleLabelToggle = (labelId) => {
    if (folderLabelIds.includes(labelId)) {
      removeLabelFromFolder(folder.id, labelId)
    } else {
      addLabelToFolder(folder.id, labelId)
    }
  }

  const handleCreateLabel = () => {
    if (!newLabelName.trim()) return
    const labelId = createLabel(newLabelName.trim(), newLabelColor)
    addLabelToFolder(folder.id, labelId)
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
    onDelete?.(folder)
    onClose()
  }

  const tabs = [
    { id: 'image', icon: ImageIcon, label: 'Image' },
    { id: 'color', icon: Palette, label: 'Color' },
    { id: 'tag', icon: Tag, label: 'Tag' },
    { id: 'icon', icon: Grid, label: 'Icon' },
  ]

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
              value={name}
              onChange={handleNameChange}
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
                      {folderLabelIds.includes(label.id) && (
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
                {FOLDER_ICON_OPTIONS.map((opt) => {
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

export { FOLDER_COLORS, COLOR_PALETTE, FOLDER_ICON_OPTIONS }
