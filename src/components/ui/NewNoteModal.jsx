import { useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Document, Image as ImageIcon } from 'react-iconly'
import { Layout, FileText, Check, Plus, Palette, Tag, Grid, X } from 'lucide-react'
import { useAppStore, LABEL_COLORS } from '../../store/appStore'
import { NOTEBOOK_COLORS, COLOR_PALETTE, ICON_OPTIONS } from '../notes/NoteCard'
import { Star } from 'react-iconly'

const LABEL_COLOR_OPTIONS = Object.entries(LABEL_COLORS).map(([id, color]) => ({ id, color }))

export default function NewNoteModal({ isOpen, onClose, documentType = 'notebook' }) {
  const { 
    createNote, 
    updateNote, 
    selectNote, 
    folders, 
    labels, 
    createLabel,
    addLabelToNote,
    addToast 
  } = useAppStore()
  
  const [name, setName] = useState('')
  const [selectedColor, setSelectedColor] = useState('blue')
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [selectedLabels, setSelectedLabels] = useState([])
  const [selectedIcon, setSelectedIcon] = useState('none')
  const [showFolderDropdown, setShowFolderDropdown] = useState(false)
  const [activeTab, setActiveTab] = useState('image')
  const [showNewLabelInput, setShowNewLabelInput] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState('blue')

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('')
      setSelectedColor('blue')
      setSelectedFolder(null)
      setSelectedLabels([])
      setSelectedIcon('none')
      setShowFolderDropdown(false)
      setActiveTab('image')
      setShowNewLabelInput(false)
      setNewLabelName('')
      setNewLabelColor('blue')
    }
  }, [isOpen])

  // Get title based on document type
  const getModalTitle = () => {
    switch (documentType) {
      case 'notebook': return 'New Notebook'
      case 'whiteboard': return 'New Whiteboard'
      case 'task': return 'New Task'
      default: return 'New Note'
    }
  }

  // Get default name based on type
  const getDefaultName = () => {
    switch (documentType) {
      case 'notebook': return 'Untitled Notebook'
      case 'whiteboard': return 'Untitled Whiteboard'
      case 'task': return 'Untitled Task'
      default: return 'Untitled'
    }
  }

  const handleCreate = () => {
    const noteId = createNote(documentType)
    updateNote(noteId, {
      title: name || getDefaultName(),
      colorKey: selectedColor,
      folderId: selectedFolder,
      icon: selectedIcon === 'none' ? null : selectedIcon,
    })

    // Add selected labels to the note
    selectedLabels.forEach(labelId => {
      addLabelToNote(noteId, labelId)
    })

    selectNote(noteId)
    onClose()
  }

  const handleLabelToggle = (labelId) => {
    setSelectedLabels(prev => 
      prev.includes(labelId) 
        ? prev.filter(id => id !== labelId)
        : [...prev, labelId]
    )
  }

  const handleCreateLabel = () => {
    if (!newLabelName.trim()) return
    const labelId = createLabel(newLabelName.trim(), newLabelColor)
    setSelectedLabels(prev => [...prev, labelId])
    setNewLabelName('')
    setNewLabelColor('blue')
    setShowNewLabelInput(false)
    addToast({ type: 'success', message: `Label "${newLabelName.trim()}" created` })
  }

  const colors = NOTEBOOK_COLORS[selectedColor] || NOTEBOOK_COLORS.blue
  const selectedFolderName = selectedFolder 
    ? folders.find(f => f.id === selectedFolder)?.name 
    : 'No Folder'

  const tabs = [
    { id: 'image', icon: ImageIcon, label: 'Image', isIconly: true },
    { id: 'color', icon: Palette, label: 'Color' },
    { id: 'label', icon: Tag, label: 'Label' },
    { id: 'icon', icon: Grid, label: 'Icon' },
  ]

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 bg-black/50 z-50"
            onClick={onClose}
          />
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
            <motion.div
              key="panel"
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="bg-[#2C2C2E] w-full max-w-sm rounded-2xl pointer-events-auto max-h-[90vh] overflow-y-auto border border-[#3A3A3C]"
            >
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#3A3A3C]">
            <motion.button type="button" onClick={onClose} whileTap={{ scale: 0.97 }} className="text-[#0A84FF] text-[15px]">Cancel</motion.button>
            <span className="text-white font-medium text-[15px]">{getModalTitle()}</span>
            <motion.button type="button" onClick={handleCreate} whileTap={{ scale: 0.97 }} className="text-[#0A84FF] font-medium text-[15px]">Create</motion.button>
          </div>

          {/* Preview */}
          <div className="flex justify-center py-5 border-b border-[#3A3A3C]">
            {documentType === 'notebook' ? (
              <div className="relative w-[70px] h-[90px]">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[5px] rounded-[50%] bg-black/30 blur-[2px]" />
                <div 
                  className="absolute bottom-[3px] left-0 right-0 h-[82px] rounded-lg overflow-hidden flex"
                  style={{ backgroundColor: colors.main }}
                >
                  <div className="w-[8px] h-full flex-shrink-0" style={{ backgroundColor: colors.spine }} />
                  <div className="w-[6px] h-full flex-shrink-0" style={{ backgroundColor: colors.accent }} />
                  <div 
                    className="flex-1 h-full relative flex items-center justify-center"
                    style={{ background: `linear-gradient(145deg, ${colors.cover} 0%, ${colors.main} 60%, ${colors.spine} 100%)` }}
                  >
                    <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 40%, rgba(0,0,0,0.1) 100%)' }} />
                    {selectedIcon !== 'none' && (() => {
                      const IconComp = ICON_OPTIONS.find(i => i.id === selectedIcon)?.icon
                      return IconComp ? <IconComp size={24} className="text-white/80 relative z-10" /> : null
                    })()}
                  </div>
                </div>
              </div>
            ) : documentType === 'whiteboard' ? (
              <div className="relative w-[90px] h-[70px]">
                <div 
                  className="absolute inset-0 rounded-lg border-2 border-dashed flex items-center justify-center"
                  style={{ borderColor: colors.main, backgroundColor: `${colors.main}15` }}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Layout size={24} style={{ color: colors.main }} />
                    <span className="text-[10px]" style={{ color: colors.main }}>∞ Canvas</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="relative w-[60px] h-[80px]">
                <div className="absolute inset-0 rounded-lg bg-white flex flex-col p-2" style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}>
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="h-2 rounded-sm" style={{ backgroundColor: colors.main, width: '70%' }} />
                    <div className="h-1 bg-gray-200 rounded-sm w-full" />
                    <div className="h-1 bg-gray-200 rounded-sm w-full" />
                    <div className="h-1 bg-gray-200 rounded-sm w-4/5" />
                    <div className="h-1 bg-gray-200 rounded-sm w-full" />
                    <div className="h-1 bg-gray-200 rounded-sm w-3/4" />
                  </div>
                </div>
                <div className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg" style={{ backgroundColor: colors.main }} />
              </div>
            )}
          </div>

          {/* Name Input */}
          <div className="p-3 border-b border-[#3A3A3C]">
            <p className="text-[11px] text-[#8E8E93] uppercase tracking-wide mb-1.5">Name</p>
            <div className="bg-[#1C1C1E] rounded-xl overflow-hidden">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={getDefaultName()}
                className="w-full bg-transparent text-white text-[15px] px-3 py-2.5 outline-none placeholder-[#8E8E93]"
                autoFocus
              />
            </div>
          </div>

          {/* Folder Selection */}
          <div className="px-3 pt-3 pb-2">
            <p className="text-[11px] text-[#8E8E93] uppercase tracking-wide mb-1.5">Folder</p>
            <div className="bg-[#1C1C1E] rounded-xl overflow-hidden relative">
              <button
                onClick={() => setShowFolderDropdown(!showFolderDropdown)}
                className="w-full px-3 py-2.5 flex items-center justify-between text-white"
              >
                <span className="text-[15px]">{selectedFolderName}</span>
                <ChevronDown 
                  set="broken" size={16} stroke="regular" primaryColor="#8E8E93" 
                  className={`transition-transform ${showFolderDropdown ? 'rotate-180' : ''}`}
                />
              </button>
              
              {showFolderDropdown && (
                <div className="border-t border-[#3A3A3C]">
                  <button
                    onClick={() => { setSelectedFolder(null); setShowFolderDropdown(false) }}
                    className={`w-full px-3 py-2.5 flex items-center justify-between hover:bg-[#2A2A2C] ${!selectedFolder ? 'text-[#0A84FF]' : 'text-white'}`}
                  >
                    <span className="text-[15px]">No Folder</span>
                    {!selectedFolder && <Check size={18} className="text-[#0A84FF]" />}
                  </button>
                  {folders.map((folder) => (
                    <button
                      key={folder.id}
                      onClick={() => { setSelectedFolder(folder.id); setShowFolderDropdown(false) }}
                      className={`w-full px-3 py-2.5 flex items-center justify-between hover:bg-[#2A2A2C] border-t border-[#3A3A3C] ${selectedFolder === folder.id ? 'text-[#0A84FF]' : 'text-white'}`}
                    >
                      <span className="text-[15px]">{folder.name}</span>
                      {selectedFolder === folder.id && <Check size={18} className="text-[#0A84FF]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Tabbed Section */}
          <div className="px-3 pb-3">
            {/* Tab Headers */}
            <div className="bg-[#1C1C1E] rounded-xl p-1 flex mb-2">
              {tabs.map((tab) => {
                const TabIcon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <motion.button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    whileTap={{ scale: 0.97 }}
                    className={`flex-1 py-2 rounded-lg flex flex-col items-center gap-1 transition-colors ${
                      isActive ? 'bg-[#3A3A3C] text-white' : 'text-[#8E8E93]'
                    }`}
                  >
                    {tab.isIconly ? (
                      <TabIcon set="broken" size={20} stroke="regular" primaryColor={isActive ? '#fff' : '#8E8E93'} />
                    ) : (
                      <TabIcon size={20} />
                    )}
                    <span className="text-[11px]">{tab.label}</span>
                  </motion.button>
                )
              })}
            </div>

            {/* Tab Content */}
            <div className="bg-[#1C1C1E] rounded-xl overflow-hidden relative min-h-[120px]">
              <AnimatePresence mode="wait">
              {/* Image Tab */}
              {activeTab === 'image' && (
                <motion.div
                  key="image"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                  className="p-4"
                >
                  <div className="h-14 flex flex-row items-center justify-center gap-2 border-2 border-dashed border-[#3A3A3C] rounded-xl px-3">
                    <ImageIcon set="broken" size={20} stroke="regular" primaryColor="#8E8E93" />
                    <p className="text-[#8E8E93] text-xs">Add Cover Image</p>
                    <button className="px-3 py-1.5 bg-[#0A84FF] text-white text-xs font-medium rounded-lg hover:bg-[#0A84FF]/80 transition-colors">
                      Choose Image
                    </button>
                  </div>
                </motion.div>
              )}

              {/* Color Tab - same palette as NoteCard dropdown; store palette id so only one selected */}
              {activeTab === 'color' && (
                <motion.div
                  key="color"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                  className="p-4"
                >
                  <div className="grid grid-cols-8 gap-3">
                    {COLOR_PALETTE.map((opt) => {
                      const isSelected = selectedColor === opt.id
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setSelectedColor(opt.id)}
                          className={`relative w-6 h-6 rounded-full transition-transform hover:scale-110 ${
                            opt.id === 'white' ? 'border border-[#3A3A3C]' : ''
                          }`}
                          style={{ backgroundColor: opt.color }}
                        >
                          {isSelected && (
                            <div className="absolute inset-0 flex items-center justify-center">
                              <Check size={14} className={opt.id === 'white' ? 'text-gray-800' : 'text-white'} strokeWidth={3} />
                            </div>
                          )}
                        </button>
                      )
                    })}
                  </div>
                </motion.div>
              )}

              {/* Label Tab */}
              {activeTab === 'label' && (
                <motion.div
                  key="label"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                  className="max-h-[200px] overflow-y-auto"
                >
                  {labels.length > 0 ? (
                    labels.map((label, index) => (
                      <button
                        key={label.id}
                        onClick={() => handleLabelToggle(label.id)}
                        className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] ${
                          index < labels.length - 1 ? 'border-b border-[#3A3A3C]' : ''
                        }`}
                      >
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: LABEL_COLORS[label.color] }} />
                        <span className="text-white text-[15px] flex-1 text-left">{label.name}</span>
                        {selectedLabels.includes(label.id) && <Check size={18} className="text-[#0A84FF]" />}
                      </button>
                    ))
                  ) : !showNewLabelInput ? (
                    <div className="px-4 py-6 text-center text-[#8E8E93] text-sm">No labels yet</div>
                  ) : null}
                  
                  {!showNewLabelInput ? (
                    <button
                      onClick={() => setShowNewLabelInput(true)}
                      className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] border-t border-[#3A3A3C]"
                    >
                      <Plus size={18} className="text-[#0A84FF]" />
                      <span className="text-[#0A84FF] text-[15px]">Create new label</span>
                    </button>
                  ) : (
                    <div className="p-3 border-t border-[#3A3A3C]">
                      <input
                        type="text"
                        value={newLabelName}
                        onChange={(e) => setNewLabelName(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleCreateLabel()
                          if (e.key === 'Escape') { setShowNewLabelInput(false); setNewLabelName('') }
                        }}
                        placeholder="Label name"
                        className="w-full bg-[#2C2C2E] rounded-lg px-3 py-2 text-white text-[15px] outline-none placeholder-[#8E8E93] mb-2"
                        autoFocus
                      />
                      <div className="flex items-center gap-2 mb-2">
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
                      <div className="flex gap-2">
                        <button
                          onClick={() => { setShowNewLabelInput(false); setNewLabelName('') }}
                          className="flex-1 py-2 rounded-lg bg-[#3A3A3C] text-white text-[14px] hover:bg-[#4A4A4C]"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleCreateLabel}
                          disabled={!newLabelName.trim()}
                          className="flex-1 py-2 rounded-lg bg-[#0A84FF] text-white text-[14px] hover:bg-[#0A84FF]/80 disabled:opacity-50"
                        >
                          Create
                        </button>
                      </div>
                    </div>
                  )}
                </motion.div>
              )}

              {/* Icon Tab - same icons as NoteCard dropdown */}
              {activeTab === 'icon' && (
                <motion.div
                  key="icon"
                  initial={{ opacity: 0, x: 8 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -8 }}
                  transition={{ duration: 0.2 }}
                  className="p-4 max-h-[250px] overflow-y-auto"
                >
                  <div className="grid grid-cols-6 gap-3">
                    {ICON_OPTIONS.map((opt) => {
                      const IconComp = opt.icon
                      const isSelected = selectedIcon === opt.id
                      return (
                        <button
                          key={opt.id}
                          onClick={() => setSelectedIcon(opt.id)}
                          className={`w-11 h-11 rounded-xl flex items-center justify-center transition-all ${
                            isSelected ? 'bg-[#0A84FF] text-white' : 'bg-[#2C2C2E] text-[#8E8E93] hover:bg-[#3A3A3C] hover:text-white'
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
          </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
