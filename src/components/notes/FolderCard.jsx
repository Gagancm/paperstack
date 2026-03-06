import { useState, useRef, useEffect } from 'react'
import { createPortal } from 'react-dom'
import { ChevronDown, Delete, Star, Folder } from 'react-iconly'
import { X, Check, Upload, Plus, Tag } from 'lucide-react'
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

export default function FolderCard({ folder, noteCount = 0, onClick, onDelete }) {
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuPosition, setMenuPosition] = useState(null)
  const menuButtonRef = useRef(null)
  
  const { updateFolder, addToast, labels } = useAppStore()

  // Get color from folder or default to blue
  const colorKey = folder.colorKey || 'blue'
  const colors = FOLDER_COLORS[colorKey] || FOLDER_COLORS.blue

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
  const [activeTab, setActiveTab] = useState('color') // 'color' or 'label'
  const [name, setName] = useState(folder.name || '')
  const [selectedColor, setSelectedColor] = useState(folder.colorKey || 'blue')
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
                          folderLabelIds.includes(label.id)
                            ? 'bg-[#0A84FF] border-[#0A84FF]'
                            : 'border-[#8E8E93]'
                        }`}
                      >
                        {folderLabelIds.includes(label.id) && (
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

export { FOLDER_COLORS }
