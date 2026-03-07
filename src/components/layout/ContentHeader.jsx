import { useState, useRef, useEffect } from 'react'
import { Filter, Plus, ChevronDown, Category, ChevronRight, Document, Folder, Edit, Scan, Image as ImageIcon, Camera, Star, Delete } from 'react-iconly'
import { Cloud, List, Check, CheckCircle2, RefreshCw, FileText, Layout, Download, Mic, BookOpen, ChevronLeft, Tag, Trash2, X } from 'lucide-react'
import { useAppStore, LABEL_COLORS, DOCUMENT_TYPES } from '../../store/appStore'
import NewNoteModal from '../ui/NewNoteModal'
import NewFolderModal from '../ui/NewFolderModal'

const LABEL_COLOR_OPTIONS = Object.entries(LABEL_COLORS).map(([id, color]) => ({ id, color }))

export default function ContentHeader() {
  const [filterOpen, setFilterOpen] = useState(false)
  const [newMenuOpen, setNewMenuOpen] = useState(false)
  const [viewMenuOpen, setViewMenuOpen] = useState(false)
  const [cloudMenuOpen, setCloudMenuOpen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [showNewNoteModal, setShowNewNoteModal] = useState(false)
  const [showNewFolderModal, setShowNewFolderModal] = useState(false)
  const [showNewLabelInput, setShowNewLabelInput] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState('blue')
  const newLabelInputRef = useRef(null)
  
  const {
    activeFilter,
    setActiveFilter,
    activeDocumentType,
    labels,
    selectedFolderId,
    folders,
    clearSelectedFolder,
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    syncStatus,
    lastSyncTime,
    createNote,
    selectNote,
    addToast,
    createLabel,
    notes,
    getNotesCountByLabel,
  } = useAppStore()

  const selectedFolder = folders.find(f => f.id === selectedFolderId)

  // Calculate counts
  const allNotesCount = notes.filter(n => !n.inTrash && (n.documentType || 'notebook') === activeDocumentType).length
  const favoritesCount = notes.filter(n => !n.inTrash && n.pinned && (n.documentType || 'notebook') === activeDocumentType).length
  const trashCount = notes.filter(n => n.inTrash).length

  // Get current document type info
  const currentDocType = DOCUMENT_TYPES[activeDocumentType] || DOCUMENT_TYPES.notebook

  useEffect(() => {
    if (showNewLabelInput) {
      setTimeout(() => newLabelInputRef.current?.focus(), 100)
    }
  }, [showNewLabelInput])

  const getFilterLabel = () => {
    if (activeFilter === 'all') return 'All'
    if (activeFilter === 'favorites') return 'Favorites'
    if (activeFilter === 'trash') return 'Trash'
    const label = labels.find((l) => l.id === activeFilter)
    return label?.name || 'All'
  }

  const sortOptions = [
    { id: 'dateCreated', label: 'Date Created' },
    { id: 'lastModified', label: 'Last Modified' },
    { id: 'name', label: 'Name' },
    { id: 'type', label: 'Type' },
  ]

  const formatLastSync = () => {
    if (!lastSyncTime) return 'Never'
    const date = new Date(lastSyncTime)
    const today = new Date()
    const isToday = date.toDateString() === today.toDateString()
    
    if (isToday) {
      return `Today at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
    }
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) + 
           ` at ${date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', hour12: true })}`
  }

  const handleSyncNow = () => {
    setIsSyncing(true)
    setTimeout(() => {
      setIsSyncing(false)
    }, 2000)
  }

  const handleQuickNote = () => {
    const noteId = createNote(activeDocumentType)
    selectNote(noteId)
    setNewMenuOpen(false)
  }

  const handleNewNotebook = () => {
    setNewMenuOpen(false)
    setShowNewNoteModal(true)
  }

  const handleNewFolder = () => {
    setNewMenuOpen(false)
    setShowNewFolderModal(true)
  }

  const handleImport = () => {
    addToast({ message: 'Import feature coming soon' })
    setNewMenuOpen(false)
  }

  const handleCreateLabel = () => {
    if (!newLabelName.trim()) return
    createLabel(newLabelName.trim(), newLabelColor)
    addToast({ message: `Label "${newLabelName.trim()}" created` })
    setNewLabelName('')
    setNewLabelColor('blue')
    setShowNewLabelInput(false)
  }

  const handleFilterSelect = (filterId) => {
    setActiveFilter(filterId)
    setFilterOpen(false)
  }

  return (
    <>
      <div className="bg-[#1C1C1E]">
        {/* Title row - only show when not in folder */}
        {!selectedFolderId && (
          <div className="px-[30px] py-4">
            <h1 className="text-2xl font-bold text-white">{currentDocType.label}</h1>
          </div>
        )}

        {/* Controls row - aligns with sidebar nav items */}
        <div className={`flex items-center px-[30px] ${selectedFolderId ? 'py-3' : 'pb-4'}`}>
          {/* Left side - Filter dropdown */}
          <div className="flex items-center flex-1">
            <div className="relative">
              <button
                onClick={() => setFilterOpen(!filterOpen)}
                className="flex items-center gap-2 px-3 py-1.5 -ml-3 rounded-lg hover:bg-[#3A3A3C] transition-colors"
              >
                <div className="text-[#8E8E93]">
                  <Filter set="broken" size={16} stroke="regular" />
                </div>
                <span className="text-white text-sm">{getFilterLabel()}</span>
                <div className="text-[#8E8E93]">
                  <ChevronDown set="broken" size={14} stroke="regular" />
                </div>
              </button>
              
              {filterOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setFilterOpen(false)} />
                  <div className="absolute left-0 top-full mt-2 bg-[#2C2C2E] rounded-2xl shadow-xl z-50 w-[320px] overflow-hidden border border-[#3A3A3C]">
                    
                    {/* Quick Filters Section */}
                    <div className="p-3 pb-2">
                      <p className="text-[#8E8E93] text-[11px] uppercase tracking-wide mb-2 px-1">
                        Quick Filters
                      </p>
                      <div className="bg-[#1C1C1E] rounded-xl overflow-hidden">
                        {/* All Notes */}
                        <button
                          onClick={() => handleFilterSelect('all')}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]"
                        >
                          <div className="flex items-center gap-3">
                            <FileText size={20} className="text-[#8E8E93]" />
                            <span className="text-white text-[15px]">All {currentDocType.label}</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[#8E8E93] text-[13px]">{allNotesCount}</span>
                            {activeFilter === 'all' && (
                              <Check size={18} className="text-[#0A84FF]" />
                            )}
                          </div>
                        </button>

                        {/* Favorites */}
                        <button
                          onClick={() => handleFilterSelect('favorites')}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]"
                        >
                          <div className="flex items-center gap-3">
                            <Star set="bold" size={20} primaryColor="#FFD60A" />
                            <span className="text-white text-[15px]">Favorites</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[#8E8E93] text-[13px]">{favoritesCount}</span>
                            {activeFilter === 'favorites' && (
                              <Check size={18} className="text-[#0A84FF]" />
                            )}
                          </div>
                        </button>

                        {/* Trash */}
                        <button
                          onClick={() => handleFilterSelect('trash')}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#2A2A2C] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Trash2 size={20} className="text-[#FF453A]" />
                            <span className="text-white text-[15px]">Trash</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <span className="text-[#8E8E93] text-[13px]">{trashCount}</span>
                            {activeFilter === 'trash' && (
                              <Check size={18} className="text-[#0A84FF]" />
                            )}
                          </div>
                        </button>
                      </div>
                    </div>

                    {/* Labels Section */}
                    <div className="px-3 pb-3">
                      <p className="text-[#8E8E93] text-[11px] uppercase tracking-wide mb-2 px-1">
                        Labels
                      </p>
                      
                      <div className="bg-[#1C1C1E] rounded-xl overflow-hidden max-h-[200px] overflow-y-auto">
                        {labels.length > 0 ? (
                          labels.map((label, index) => (
                            <button
                              key={label.id}
                              onClick={() => handleFilterSelect(label.id)}
                              className={`w-full px-4 py-3 flex items-center justify-between hover:bg-[#2A2A2C] transition-colors ${
                                index < labels.length - 1 ? 'border-b border-[#3A3A3C]' : ''
                              }`}
                            >
                              <div className="flex items-center gap-3">
                                <div 
                                  className="w-4 h-4 rounded-full"
                                  style={{ backgroundColor: LABEL_COLORS[label.color] }}
                                />
                                <span className="text-white text-[15px]">{label.name}</span>
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-[#8E8E93] text-[13px]">{getNotesCountByLabel(label.id)}</span>
                                {activeFilter === label.id && (
                                  <Check size={18} className="text-[#0A84FF]" />
                                )}
                              </div>
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
                          <Plus set="broken" size={20} stroke="regular" primaryColor="#0A84FF" />
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
                              if (e.key === 'Escape') {
                                setShowNewLabelInput(false)
                                setNewLabelName('')
                              }
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
                  </div>
                </>
              )}
            </div>
          </div>

          {/* Center - Folder name (only when inside a folder) */}
          {selectedFolder && (
            <div className="flex-1 flex justify-center">
              <span className="text-white font-semibold text-base">{selectedFolder.name}</span>
            </div>
          )}

          {/* Right controls */}
          <div className={`flex items-center gap-1 ${selectedFolder ? 'flex-1 justify-end' : ''}`}>
            {/* New button with expanded menu */}
            <div className="relative">
              <button
                onClick={() => setNewMenuOpen(!newMenuOpen)}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#0A84FF] hover:bg-[#0A84FF]/80 transition-colors"
              >
                <Plus set="broken" size={16} stroke="regular" primaryColor="white" />
                <span className="text-white text-sm font-medium">New</span>
              </button>
              
              {newMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setNewMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 bg-[#2C2C2E] rounded-2xl shadow-xl z-50 w-[320px] overflow-hidden border border-[#3A3A3C]">
                    
                    {/* Quick Create Section - Icon Grid */}
                    <div className="p-3 pb-2">
                      <p className="text-[#8E8E93] text-[11px] uppercase tracking-wide mb-2 px-1">
                        Quick Create
                      </p>
                      <div className="flex justify-center gap-2">
                        {/* Notebook */}
                        <button
                          onClick={handleNewNotebook}
                          className="w-[88px] h-[76px] flex flex-col items-center justify-center gap-2 rounded-xl hover:bg-[#3A3A3C] transition-colors"
                        >
                          <div className="w-11 h-11 bg-[#1C1C1E] rounded-xl flex items-center justify-center">
                            <Document set="broken" size={22} stroke="regular" primaryColor="#0A84FF" />
                          </div>
                          <span className="text-white text-[12px]">Notebook</span>
                        </button>

                        {/* Text Doc */}
                        <button
                          onClick={() => {
                            const noteId = createNote('document')
                            selectNote(noteId)
                            setNewMenuOpen(false)
                          }}
                          className="w-[88px] h-[76px] flex flex-col items-center justify-center gap-2 rounded-xl hover:bg-[#3A3A3C] transition-colors"
                        >
                          <div className="w-11 h-11 bg-[#1C1C1E] rounded-xl flex items-center justify-center">
                            <FileText size={22} className="text-[#30D158]" />
                          </div>
                          <span className="text-white text-[12px]">Document</span>
                        </button>

                        {/* Whiteboard */}
                        <button
                          onClick={() => {
                            const noteId = createNote('whiteboard')
                            selectNote(noteId)
                            setNewMenuOpen(false)
                          }}
                          className="w-[88px] h-[76px] flex flex-col items-center justify-center gap-2 rounded-xl hover:bg-[#3A3A3C] transition-colors"
                        >
                          <div className="w-11 h-11 bg-[#1C1C1E] rounded-xl flex items-center justify-center">
                            <Layout size={22} className="text-[#BF5AF2]" />
                          </div>
                          <span className="text-white text-[12px]">Whiteboard</span>
                        </button>
                      </div>

                      {/* Second row - Import and Quick Record */}
                      <div className="flex justify-center gap-2 mt-1">
                        <button
                          onClick={handleImport}
                          className="w-[88px] h-[76px] flex flex-col items-center justify-center gap-2 rounded-xl hover:bg-[#3A3A3C] transition-colors"
                        >
                          <div className="w-11 h-11 bg-[#1C1C1E] rounded-xl flex items-center justify-center">
                            <Download size={22} className="text-[#FF9500]" />
                          </div>
                          <span className="text-white text-[12px]">Import</span>
                        </button>

                        <button
                          onClick={() => {
                            addToast({ message: 'Quick Record coming soon' })
                            setNewMenuOpen(false)
                          }}
                          className="w-[88px] h-[76px] flex flex-col items-center justify-center gap-2 rounded-xl hover:bg-[#3A3A3C] transition-colors"
                        >
                          <div className="w-11 h-11 bg-[#1C1C1E] rounded-xl flex items-center justify-center">
                            <Mic size={22} className="text-[#FF453A]" />
                          </div>
                          <span className="text-white text-[12px]">Record</span>
                        </button>
                      </div>
                    </div>

                    {/* More Options Section */}
                    <div className="px-3 pb-2">
                      <p className="text-[#8E8E93] text-[11px] uppercase tracking-wide mb-2 px-1">
                        More Options
                      </p>
                      <div className="bg-[#1C1C1E] rounded-xl overflow-hidden">
                        {/* QuickNote */}
                        <button
                          onClick={handleQuickNote}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]"
                        >
                          <Edit set="broken" size={20} stroke="regular" primaryColor="#8E8E93" />
                          <span className="text-white text-[15px]">QuickNote</span>
                        </button>

                        {/* Scan Documents */}
                        <button
                          onClick={() => {
                            addToast({ message: 'Scan Documents coming soon' })
                            setNewMenuOpen(false)
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]"
                        >
                          <Scan set="broken" size={20} stroke="regular" primaryColor="#8E8E93" />
                          <span className="text-white text-[15px]">Scan Documents</span>
                        </button>

                        {/* Study Set */}
                        <button
                          onClick={() => {
                            addToast({ message: 'Study Set coming soon' })
                            setNewMenuOpen(false)
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]"
                        >
                          <BookOpen size={20} className="text-[#8E8E93]" />
                          <span className="text-white text-[15px]">Study Set</span>
                        </button>

                        {/* Image */}
                        <button
                          onClick={() => {
                            addToast({ message: 'Image import coming soon' })
                            setNewMenuOpen(false)
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]"
                        >
                          <ImageIcon set="broken" size={20} stroke="regular" primaryColor="#8E8E93" />
                          <span className="text-white text-[15px]">Image</span>
                        </button>

                        {/* Take Photo */}
                        <button
                          onClick={() => {
                            addToast({ message: 'Take Photo coming soon' })
                            setNewMenuOpen(false)
                          }}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] transition-colors"
                        >
                          <Camera set="broken" size={20} stroke="regular" primaryColor="#8E8E93" />
                          <span className="text-white text-[15px]">Take Photo</span>
                        </button>
                      </div>
                    </div>

                    {/* Organize Section */}
                    <div className="px-3 pb-3">
                      <p className="text-[#8E8E93] text-[11px] uppercase tracking-wide mb-2 px-1">
                        Organize
                      </p>
                      <div className="bg-[#1C1C1E] rounded-xl overflow-hidden">
                        <button
                          onClick={handleNewFolder}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] transition-colors"
                        >
                          <Folder set="broken" size={20} stroke="regular" primaryColor="#8E8E93" />
                          <span className="text-white text-[15px]">Folder</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* View options dropdown */}
            <div className="relative">
              <button 
                onClick={() => setViewMenuOpen(!viewMenuOpen)}
                className="p-2 rounded-lg hover:bg-[#3A3A3C] transition-colors text-[#8E8E93]"
              >
                <Category set="broken" size={18} stroke="regular" />
              </button>

              {viewMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setViewMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 bg-[#2C2C2E] rounded-2xl shadow-xl z-50 w-[240px] overflow-hidden border border-[#3A3A3C]">
                    
                    {/* View Mode Section */}
                    <div className="p-3 pb-2">
                      <p className="text-[#8E8E93] text-[11px] uppercase tracking-wide mb-2 px-1">
                        View Mode
                      </p>
                      <div className="bg-[#1C1C1E] rounded-xl overflow-hidden">
                        {/* Grid View */}
                        <button
                          onClick={() => {
                            setViewMode('grid')
                            setViewMenuOpen(false)
                          }}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]"
                        >
                          <div className="flex items-center gap-3">
                            <Category set="broken" size={20} stroke="regular" primaryColor="#8E8E93" />
                            <span className="text-white text-[15px]">Grid</span>
                          </div>
                          {viewMode === 'grid' && <Check size={18} className="text-[#0A84FF]" />}
                        </button>

                        {/* List View */}
                        <button
                          onClick={() => {
                            setViewMode('list')
                            setViewMenuOpen(false)
                          }}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#2A2A2C] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <List size={20} className="text-[#8E8E93]" />
                            <span className="text-white text-[15px]">List</span>
                          </div>
                          {viewMode === 'list' && <Check size={18} className="text-[#0A84FF]" />}
                        </button>
                      </div>
                    </div>

                    {/* Sort By Section */}
                    <div className="px-3 pb-3">
                      <p className="text-[#8E8E93] text-[11px] uppercase tracking-wide mb-2 px-1">
                        Sort By
                      </p>
                      <div className="bg-[#1C1C1E] rounded-xl overflow-hidden">
                        {sortOptions.map((opt, index) => (
                          <button
                            key={opt.id}
                            onClick={() => {
                              setSortBy(opt.id)
                              setViewMenuOpen(false)
                            }}
                            className={`w-full px-4 py-3 flex items-center justify-between hover:bg-[#2A2A2C] transition-colors ${
                              index < sortOptions.length - 1 ? 'border-b border-[#3A3A3C]' : ''
                            }`}
                          >
                            <span className="text-white text-[15px]">{opt.label}</span>
                            {sortBy === opt.id && <Check size={18} className="text-[#0A84FF]" />}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-[#3A3A3C] mx-1" />

            {/* Google Drive Sync dropdown */}
            <div className="relative">
              <button 
                onClick={() => setCloudMenuOpen(!cloudMenuOpen)}
                className="p-2 rounded-lg hover:bg-[#3A3A3C] transition-colors"
              >
                <Cloud size={18} className={isSyncing ? 'text-[#0A84FF] animate-pulse' : 'text-[#8E8E93]'} />
              </button>

              {cloudMenuOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setCloudMenuOpen(false)} />
                  <div className="absolute right-0 top-full mt-2 bg-[#2C2C2E] rounded-2xl shadow-xl z-50 w-[280px] overflow-hidden border border-[#3A3A3C]">
                    
                    {/* Status Section */}
                    <div className="p-3 pb-2">
                      <p className="text-[#8E8E93] text-[11px] uppercase tracking-wide mb-2 px-1">
                        Status
                      </p>
                      <div className="bg-[#1C1C1E] rounded-xl overflow-hidden">
                        <div className="px-4 py-3 flex items-center gap-3">
                          {syncStatus === 'saved' || syncStatus === 'saving' ? (
                            <CheckCircle2 
                              size={20} 
                              className="text-[#34C759]"
                              fill="#34C759"
                              strokeWidth={0}
                            />
                          ) : (
                            <Cloud size={20} className="text-[#8E8E93]" />
                          )}
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-[15px]">
                              {syncStatus === 'saved' ? 'Synced' : 
                               syncStatus === 'saving' ? 'Syncing...' :
                               syncStatus === 'offline' ? 'Offline' :
                               'Error'}
                            </p>
                            <p className="text-[#8E8E93] text-[13px]">
                              {formatLastSync()}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Actions Section */}
                    <div className="px-3 pb-3">
                      <p className="text-[#8E8E93] text-[11px] uppercase tracking-wide mb-2 px-1">
                        Actions
                      </p>
                      <div className="bg-[#1C1C1E] rounded-xl overflow-hidden">
                        <button
                          onClick={handleSyncNow}
                          disabled={isSyncing}
                          className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C] disabled:opacity-50"
                        >
                          <RefreshCw size={20} className={`text-[#0A84FF] ${isSyncing ? 'animate-spin' : ''}`} />
                          <span className="text-white text-[15px]">{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                        </button>

                        <button
                          onClick={() => {
                            addToast({ message: 'Sync settings coming soon' })
                            setCloudMenuOpen(false)
                          }}
                          className="w-full px-4 py-3 flex items-center justify-between hover:bg-[#2A2A2C] transition-colors"
                        >
                          <div className="flex items-center gap-3">
                            <Cloud size={20} className="text-[#8E8E93]" />
                            <span className="text-white text-[15px]">Sync Settings</span>
                          </div>
                          <ChevronRight set="broken" size={18} stroke="regular" primaryColor="#8E8E93" />
                        </button>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      <NewNoteModal isOpen={showNewNoteModal} onClose={() => setShowNewNoteModal(false)} />
      <NewFolderModal isOpen={showNewFolderModal} onClose={() => setShowNewFolderModal(false)} />
    </>
  )
}
