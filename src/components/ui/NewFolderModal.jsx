import { useState, useEffect } from 'react'
import { Image as ImageIcon } from 'react-iconly'
import { Check, Plus, Palette, Tag, Grid, X } from 'lucide-react'
import { useAppStore, LABEL_COLORS } from '../../store/appStore'
import { FOLDER_COLORS, COLOR_PALETTE, FOLDER_ICON_OPTIONS } from '../notes/FolderCard'
import { Star } from 'react-iconly'

const LABEL_COLOR_OPTIONS = Object.entries(LABEL_COLORS).map(([id, color]) => ({ id, color }))

export default function NewFolderModal({ isOpen, onClose }) {
  const { 
    createFolder, 
    updateFolder, 
    labels, 
    createLabel, 
    addLabelToFolder,
    addToast 
  } = useAppStore()
  
  const [name, setName] = useState('New Folder')
  const [selectedColor, setSelectedColor] = useState('blue')
  const [selectedLabels, setSelectedLabels] = useState([])
  const [selectedIcon, setSelectedIcon] = useState('none')
  const [activeTab, setActiveTab] = useState('image')
  const [showNewLabelInput, setShowNewLabelInput] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState('blue')

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setName('New Folder')
      setSelectedColor('blue')
      setSelectedLabels([])
      setSelectedIcon('none')
      setActiveTab('image')
      setShowNewLabelInput(false)
      setNewLabelName('')
      setNewLabelColor('blue')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleCreate = () => {
    const folderId = createFolder(name || 'New Folder')
    updateFolder(folderId, {
      colorKey: selectedColor,
      icon: selectedIcon === 'none' ? null : selectedIcon,
    })

    // Add selected labels to the folder
    selectedLabels.forEach(labelId => {
      addLabelToFolder(folderId, labelId)
    })
    
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

  const colors = FOLDER_COLORS[selectedColor] || FOLDER_COLORS.blue

  const tabs = [
    { id: 'image', icon: ImageIcon, label: 'Image', isIconly: true },
    { id: 'color', icon: Palette, label: 'Color' },
    { id: 'label', icon: Tag, label: 'Label' },
    { id: 'icon', icon: Grid, label: 'Icon' },
  ]

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-[#2C2C2E] w-full max-w-sm rounded-2xl pointer-events-auto max-h-[90vh] overflow-y-auto border border-[#3A3A3C]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#3A3A3C]">
            <button onClick={onClose} className="text-[#0A84FF] text-[15px]">Cancel</button>
            <span className="text-white font-medium text-[15px]">New Folder</span>
            <button onClick={handleCreate} className="text-[#0A84FF] font-medium text-[15px]">Create</button>
          </div>

          {/* Preview */}
          <div className="flex justify-center py-5 border-b border-[#3A3A3C]">
            <div className="relative w-[80px] h-[68px]">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] h-[5px] rounded-[50%] bg-black/25 blur-[2px]" />
              <div 
                className="absolute bottom-[3px] left-1/2 -translate-x-1/2 w-[95%] h-[52px] rounded-md"
                style={{ backgroundColor: colors.dark }}
              />
              <div 
                className="absolute top-0 left-[5px] w-[38%] h-[11px] rounded-t-md"
                style={{ backgroundColor: colors.main }}
              />
              <div 
                className="absolute bottom-[3px] left-1/2 -translate-x-1/2 w-[95%] h-[46px] rounded-md flex items-center justify-center"
                style={{ background: `linear-gradient(180deg, ${colors.light} 0%, ${colors.main} 100%)` }}
              >
                <div 
                  className="absolute top-0 left-0 right-0 h-[2px] rounded-t-md"
                  style={{ backgroundColor: colors.light, opacity: 0.8 }}
                />
                {selectedIcon !== 'none' && (() => {
                  const IconComp = FOLDER_ICON_OPTIONS.find(i => i.id === selectedIcon)?.icon
                  return IconComp ? <IconComp size={20} className="text-white/80 relative z-10" /> : null
                })()}
              </div>
            </div>
          </div>

          {/* Name Input */}
          <div className="p-3 border-b border-[#3A3A3C]">
            <p className="text-[11px] text-[#8E8E93] uppercase tracking-wide mb-1.5">Name</p>
            <div className="bg-[#1C1C1E] rounded-xl overflow-hidden">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="New Folder"
                className="w-full bg-transparent text-white text-[15px] px-3 py-2.5 outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Tabbed Section */}
          <div className="p-3">
            {/* Tab Headers */}
            <div className="bg-[#1C1C1E] rounded-xl p-1 flex mb-2">
              {tabs.map((tab) => {
                const TabIcon = tab.icon
                const isActive = activeTab === tab.id
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
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
                  </button>
                )
              })}
            </div>

            {/* Tab Content */}
            <div className="bg-[#1C1C1E] rounded-xl overflow-hidden">
              {/* Image Tab */}
              {activeTab === 'image' && (
                <div className="p-4">
                  <div className="h-14 flex flex-row items-center justify-center gap-2 border-2 border-dashed border-[#3A3A3C] rounded-xl px-3">
                    <ImageIcon set="broken" size={20} stroke="regular" primaryColor="#8E8E93" />
                    <p className="text-[#8E8E93] text-xs">Add Cover Image</p>
                    <button className="px-3 py-1.5 bg-[#0A84FF] text-white text-xs font-medium rounded-lg hover:bg-[#0A84FF]/80 transition-colors">
                      Choose Image
                    </button>
                  </div>
                </div>
              )}

              {/* Color Tab */}
              {/* Color Tab - same palette as FolderCard dropdown; store palette id so only one selected */}
              {activeTab === 'color' && (
                <div className="p-4">
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
                </div>
              )}

              {/* Label Tab */}
              {activeTab === 'label' && (
                <div className="max-h-[200px] overflow-y-auto">
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
                </div>
              )}

              {/* Icon Tab - same icons as FolderCard dropdown */}
              {activeTab === 'icon' && (
                <div className="p-4 max-h-[250px] overflow-y-auto">
                  <div className="grid grid-cols-6 gap-3">
                    {FOLDER_ICON_OPTIONS.map((opt) => {
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
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
