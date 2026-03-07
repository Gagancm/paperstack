import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Delete, Star, Folder, Image as ImageIcon, TickSquare } from 'react-iconly'
import { X, Check, Upload, Plus, Tag, Palette, Grid, Heart, Calendar, Globe, Bell, BookOpen, Music, Camera, Film, Coffee, Zap, Bookmark, Award, Flag, Home, Briefcase, GraduationCap, Lightbulb, Target, TrendingUp, Users, ShoppingBag, Plane, Car, Utensils, Dumbbell, Moon, Sun, Cloud, Umbrella, Leaf, Flower2, Smile, FolderOpen, Archive, FileText, Inbox } from 'lucide-react'
import { useAppStore, LABEL_COLORS } from '../../store/appStore'

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

// Extended color palette like GoodNotes
const COLOR_PALETTE = [
  // Row 1 - Rainbow spectrum
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
  // Row 2 - Pastels and neutrals
  { id: 'peach', color: '#FFAB91' },
  { id: 'cream', color: '#FFE0B2' },
  { id: 'mint', color: '#A5D6A7' },
  { id: 'sky', color: '#81D4FA' },
  { id: 'lavender', color: '#CE93D8' },
  { id: 'rose', color: '#F48FB1' },
  { id: 'brown', color: '#A1887F' },
  { id: 'gray', color: '#8E8E93' },
  { id: 'slate', color: '#546E7A' },
  { id: 'charcoal', color: '#37474F' },
  { id: 'white', color: '#FFFFFF' },
  { id: 'black', color: '#1C1C1E' },
]

const LABEL_COLOR_OPTIONS = Object.entries(LABEL_COLORS).map(([id, color]) => ({ id, color }))

// Icon options for folders
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
  { id: 'flag', icon: Flag, label: 'Flag' },
  { id: 'home', icon: Home, label: 'Home' },
  { id: 'briefcase', icon: Briefcase, label: 'Work' },
  { id: 'graduation', icon: GraduationCap, label: 'School' },
  { id: 'lightbulb', icon: Lightbulb, label: 'Ideas' },
  { id: 'target', icon: Target, label: 'Goals' },
  { id: 'trending', icon: TrendingUp, label: 'Progress' },
  { id: 'users', icon: Users, label: 'Team' },
  { id: 'shopping', icon: ShoppingBag, label: 'Shopping' },
  { id: 'plane', icon: Plane, label: 'Travel' },
  { id: 'car', icon: Car, label: 'Car' },
  { id: 'food', icon: Utensils, label: 'Food' },
  { id: 'fitness', icon: Dumbbell, label: 'Fitness' },
  { id: 'moon', icon: Moon, label: 'Night' },
  { id: 'sun', icon: Sun, label: 'Day' },
  { id: 'cloud', icon: Cloud, label: 'Weather' },
  { id: 'smile', icon: Smile, label: 'Happy' },
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
    </div>
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
    // Map extended palette to folder colors (use closest match)
    const folderColorMap = {
      red: 'red', orange: 'orange', yellow: 'yellow', lime: 'green', green: 'green',
      teal: 'teal', cyan: 'blue', blue: 'blue', indigo: 'purple', purple: 'purple',
      pink: 'pink', magenta: 'pink', peach: 'orange', cream: 'yellow', mint: 'green',
      sky: 'blue', lavender: 'purple', rose: 'pink', brown: 'gray', gray: 'gray',
      slate: 'gray', charcoal: 'gray', white: 'gray', black: 'gray'
    }
    updateFolder(folder.id, { colorKey: folderColorMap[colorId] || 'blue' })
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
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
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
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="px-3 pb-2">
          {/* Image Tab */}
          {activeTab === 'image' && (
            <div className="bg-[#1C1C1E] rounded-xl p-4">
              <div className="flex flex-col items-center justify-center py-6 border-2 border-dashed border-[#3A3A3C] rounded-xl">
                <ImageIcon set="broken" size={40} stroke="regular" primaryColor="#8E8E93" />
                <p className="text-[#8E8E93] text-sm mt-2">Add Cover Image</p>
                <button className="mt-3 px-4 py-2 bg-[#0A84FF] text-white text-sm font-medium rounded-lg hover:bg-[#0A84FF]/80 transition-colors">
                  Choose Image
                </button>
              </div>
            </div>
          )}

          {/* Color Tab */}
          {activeTab === 'color' && (
            <div className="bg-[#1C1C1E] rounded-xl p-4">
              {/* Color Grid */}
              <div className="grid grid-cols-12 gap-2">
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
                        <Check size={14} className={opt.id === 'white' || opt.id === 'cream' ? 'text-gray-800' : 'text-white'} strokeWidth={3} />
                      </div>
                    )}
                  </button>
                ))}
              </div>
              
              {/* Opacity Slider (visual only for now) */}
              <div className="mt-4 pt-3 border-t border-[#3A3A3C]">
                <div className="flex items-center gap-3">
                  <span className="text-[#8E8E93] text-sm">Opacity</span>
                  <div className="flex-1 h-2 bg-gradient-to-r from-transparent to-white rounded-full relative">
                    <div className="absolute right-0 top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full shadow-lg border-2 border-[#0A84FF]" />
                  </div>
                  <span className="text-white text-sm w-10 text-right">100%</span>
                </div>
              </div>
            </div>
          )}

          {/* Tag Tab */}
          {activeTab === 'tag' && (
            <div>
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
            </div>
          )}

          {/* Icon Tab */}
          {activeTab === 'icon' && (
            <div className="bg-[#1C1C1E] rounded-xl p-4 max-h-[250px] overflow-y-auto">
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

export { FOLDER_COLORS, FOLDER_ICON_OPTIONS }
