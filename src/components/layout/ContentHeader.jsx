import { useState } from 'react'
import { Filter, Plus, ChevronDown, Category, ChevronRight, Document, Folder, Edit, Scan, Image as ImageIcon, Camera } from 'react-iconly'
import { Cloud, List, Check, CheckCircle2, RefreshCw, FileText, Layout, Download, Mic, BookOpen } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import NewNoteModal from '../ui/NewNoteModal'
import NewFolderModal from '../ui/NewFolderModal'

export default function ContentHeader() {
  const [filterOpen, setFilterOpen] = useState(false)
  const [newMenuOpen, setNewMenuOpen] = useState(false)
  const [viewMenuOpen, setViewMenuOpen] = useState(false)
  const [cloudMenuOpen, setCloudMenuOpen] = useState(false)
  const [isSyncing, setIsSyncing] = useState(false)
  const [showNewNoteModal, setShowNewNoteModal] = useState(false)
  const [showNewFolderModal, setShowNewFolderModal] = useState(false)
  
  const {
    activeFilter,
    setActiveFilter,
    labels,
    selectedFolderId,
    viewMode,
    setViewMode,
    sortBy,
    setSortBy,
    syncStatus,
    lastSyncTime,
    createNote,
    selectNote,
    addToast,
  } = useAppStore()

  const getFilterLabel = () => {
    if (activeFilter === 'all') return 'All'
    if (activeFilter === 'favorites') return 'Favorites'
    if (activeFilter === 'trash') return 'Trash'
    const label = labels.find((l) => l.id === activeFilter)
    return label?.name || 'All'
  }

  const filterOptions = [
    { id: 'all', label: 'All' },
    { id: 'favorites', label: 'Favorites' },
    { id: 'trash', label: 'Trash' },
    ...labels.map((l) => ({ id: l.id, label: l.name })),
  ]

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
    const noteId = createNote()
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

  if (selectedFolderId) {
    return (
      <>
        <NewNoteModal isOpen={showNewNoteModal} onClose={() => setShowNewNoteModal(false)} />
        <NewFolderModal isOpen={showNewFolderModal} onClose={() => setShowNewFolderModal(false)} />
      </>
    )
  }

  return (
    <>
      <div className="bg-[#1C1C1E]">
        {/* Title row */}
        <div className="px-[30px] py-4">
          <h1 className="text-2xl font-bold text-white">Notes</h1>
        </div>

        {/* Controls row - aligns with sidebar nav items */}
        <div className="flex items-center justify-between px-[30px] pb-4">
          {/* Filter dropdown */}
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
                <div className="absolute left-0 top-full mt-2 bg-[#2C2C2E] rounded-2xl shadow-xl z-50 w-[220px] overflow-hidden border border-[#3A3A3C]">
                  
                  {/* Header */}
                  <div className="py-3 text-center border-b border-[#3A3A3C]">
                    <h3 className="text-white font-semibold text-[15px]">Filter Notes</h3>
                  </div>

                  {/* Filter Options Card */}
                  <div className="p-3">
                    <div className="bg-[#1C1C1E] rounded-xl overflow-hidden">
                      {filterOptions.map((opt, index) => (
                        <button
                          key={opt.id}
                          onClick={() => {
                            setActiveFilter(opt.id)
                            setFilterOpen(false)
                          }}
                          className={`w-full px-4 py-3.5 flex items-center justify-between hover:bg-[#2A2A2C] transition-colors ${
                            index < filterOptions.length - 1 ? 'border-b border-[#3A3A3C]' : ''
                          }`}
                        >
                          <span className="text-white text-[17px]">{opt.label}</span>
                          {activeFilter === opt.id && (
                            <Check size={20} className="text-[#0A84FF]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1">
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
                    
                    {/* Top Row - Main creation options with icons */}
                    <div className="p-4 pb-2">
                      <div className="flex justify-center gap-4">
                        {/* Notebook */}
                        <button
                          onClick={handleNewNotebook}
                          className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[#3A3A3C] transition-colors min-w-[80px]"
                        >
                          <div className="w-12 h-12 bg-[#1C1C1E] rounded-xl flex items-center justify-center">
                            <Document set="broken" size={24} stroke="regular" primaryColor="#fff" />
                          </div>
                          <span className="text-white text-[13px]">Notebook</span>
                        </button>

                        {/* Text Doc */}
                        <button
                          onClick={handleQuickNote}
                          className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[#3A3A3C] transition-colors min-w-[80px]"
                        >
                          <div className="w-12 h-12 bg-[#1C1C1E] rounded-xl flex items-center justify-center">
                            <FileText size={24} className="text-white" />
                          </div>
                          <span className="text-white text-[13px]">Text Doc</span>
                        </button>

                        {/* Whiteboard */}
                        <button
                          onClick={() => {
                            addToast({ message: 'Whiteboard coming soon' })
                            setNewMenuOpen(false)
                          }}
                          className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[#3A3A3C] transition-colors min-w-[80px]"
                        >
                          <div className="w-12 h-12 bg-[#1C1C1E] rounded-xl flex items-center justify-center">
                            <Layout size={24} className="text-white" />
                          </div>
                          <span className="text-white text-[13px]">Whiteboard</span>
                        </button>
                      </div>
                    </div>

                    {/* Second Row - Import and Quick Record */}
                    <div className="px-4 pb-4">
                      <div className="flex justify-center gap-4">
                        {/* Import */}
                        <button
                          onClick={handleImport}
                          className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[#3A3A3C] transition-colors min-w-[80px]"
                        >
                          <div className="w-12 h-12 bg-[#1C1C1E] rounded-xl flex items-center justify-center">
                            <Download size={24} className="text-white" />
                          </div>
                          <span className="text-white text-[13px]">Import</span>
                        </button>

                        {/* Quick Record */}
                        <button
                          onClick={() => {
                            addToast({ message: 'Quick Record coming soon' })
                            setNewMenuOpen(false)
                          }}
                          className="flex flex-col items-center gap-2 p-3 rounded-xl hover:bg-[#3A3A3C] transition-colors min-w-[80px]"
                        >
                          <div className="w-12 h-12 bg-[#1C1C1E] rounded-xl flex items-center justify-center">
                            <Mic size={24} className="text-white" />
                          </div>
                          <span className="text-white text-[13px]">Quick Record</span>
                        </button>
                      </div>
                    </div>

                    {/* List Options Section */}
                    <div className="px-3 pb-2">
                      <div className="bg-[#1C1C1E] rounded-xl overflow-hidden">
                        {/* QuickNote */}
                        <button
                          onClick={handleQuickNote}
                          className="w-full px-4 py-3.5 flex items-center gap-4 hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]"
                        >
                          <Edit set="broken" size={22} stroke="regular" primaryColor="#fff" />
                          <span className="text-white text-[17px]">QuickNote</span>
                        </button>

                        {/* Scan Documents */}
                        <button
                          onClick={() => {
                            addToast({ message: 'Scan Documents coming soon' })
                            setNewMenuOpen(false)
                          }}
                          className="w-full px-4 py-3.5 flex items-center gap-4 hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]"
                        >
                          <Scan set="broken" size={22} stroke="regular" primaryColor="#fff" />
                          <span className="text-white text-[17px]">Scan Documents</span>
                        </button>

                        {/* Study Set */}
                        <button
                          onClick={() => {
                            addToast({ message: 'Study Set coming soon' })
                            setNewMenuOpen(false)
                          }}
                          className="w-full px-4 py-3.5 flex items-center gap-4 hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]"
                        >
                          <BookOpen size={22} className="text-white" />
                          <span className="text-white text-[17px]">Study Set</span>
                        </button>

                        {/* Image */}
                        <button
                          onClick={() => {
                            addToast({ message: 'Image import coming soon' })
                            setNewMenuOpen(false)
                          }}
                          className="w-full px-4 py-3.5 flex items-center gap-4 hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]"
                        >
                          <ImageIcon set="broken" size={22} stroke="regular" primaryColor="#fff" />
                          <span className="text-white text-[17px]">Image</span>
                        </button>

                        {/* Take Photo */}
                        <button
                          onClick={() => {
                            addToast({ message: 'Take Photo coming soon' })
                            setNewMenuOpen(false)
                          }}
                          className="w-full px-4 py-3.5 flex items-center gap-4 hover:bg-[#2A2A2C] transition-colors"
                        >
                          <Camera set="broken" size={22} stroke="regular" primaryColor="#fff" />
                          <span className="text-white text-[17px]">Take Photo</span>
                        </button>
                      </div>
                    </div>

                    {/* Folder Option - Separate card */}
                    <div className="px-3 pb-3">
                      <button
                        onClick={handleNewFolder}
                        className="w-full bg-[#1C1C1E] rounded-xl px-4 py-3.5 flex items-center gap-4 hover:bg-[#2A2A2C] transition-colors"
                      >
                        <Folder set="broken" size={22} stroke="regular" primaryColor="#fff" />
                        <span className="text-white text-[17px]">Folder</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-[#3A3A3C] mx-2" />

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
                  <div className="absolute right-0 top-full mt-1 bg-[#2C2C2E] rounded-2xl shadow-xl z-50 min-w-[200px] py-2 border border-[#3A3A3C] overflow-hidden">
                    
                    {/* Select Items option */}
                    <button
                      onClick={() => {
                        setViewMenuOpen(false)
                      }}
                      className="w-full px-4 py-3 flex items-center justify-between text-white hover:bg-[#3A3A3C] transition-colors"
                    >
                      <span className="text-[15px]">Select Items</span>
                      <div className="w-5 h-5 rounded-full border-2 border-[#8E8E93]" />
                    </button>

                    {/* Divider */}
                    <div className="h-px bg-[#3A3A3C] mx-3 my-1" />

                    {/* Grid View */}
                    <button
                      onClick={() => {
                        setViewMode('grid')
                        setViewMenuOpen(false)
                      }}
                      className="w-full px-4 py-3 flex items-center justify-between text-white hover:bg-[#3A3A3C] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {viewMode === 'grid' && <Check size={18} className="text-[#0A84FF]" />}
                        {viewMode !== 'grid' && <div className="w-[18px]" />}
                        <span className="text-[15px]">Grid</span>
                      </div>
                      <Category set="broken" size={18} stroke="regular" />
                    </button>

                    {/* List View */}
                    <button
                      onClick={() => {
                        setViewMode('list')
                        setViewMenuOpen(false)
                      }}
                      className="w-full px-4 py-3 flex items-center justify-between text-white hover:bg-[#3A3A3C] transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {viewMode === 'list' && <Check size={18} className="text-[#0A84FF]" />}
                        {viewMode !== 'list' && <div className="w-[18px]" />}
                        <span className="text-[15px]">List</span>
                      </div>
                      <List size={18} className="text-white" />
                    </button>

                    {/* Divider */}
                    <div className="h-px bg-[#3A3A3C] mx-3 my-1" />

                    {/* Sort options */}
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.id}
                        onClick={() => {
                          setSortBy(opt.id)
                          setViewMenuOpen(false)
                        }}
                        className="w-full px-4 py-3 flex items-center justify-between text-white hover:bg-[#3A3A3C] transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {sortBy === opt.id && <Check size={18} className="text-[#0A84FF]" />}
                          {sortBy !== opt.id && <div className="w-[18px]" />}
                          <span className="text-[15px]">{opt.label}</span>
                        </div>
                        {sortBy === opt.id && (
                          <ChevronDown set="broken" size={16} stroke="regular" primaryColor="#0A84FF" />
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Cloud & Backup dropdown */}
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
                  <div className="absolute right-0 top-full mt-1 bg-[#2C2C2E] rounded-2xl shadow-xl z-50 w-[300px] overflow-hidden border border-[#3A3A3C]">
                    
                    {/* Header */}
                    <div className="py-4 text-center">
                      <h3 className="text-white font-semibold text-[17px]">Cloud & Backup Status</h3>
                    </div>

                    {/* Cloud Sync Section */}
                    <div className="px-4 pb-4">
                      <p className="text-[#8E8E93] text-[13px] uppercase tracking-wide mb-2">
                        Cloud Sync
                      </p>
                      
                      <div className="bg-[#1C1C1E] rounded-xl px-4 py-3">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5 shrink-0">
                            {syncStatus === 'saved' || syncStatus === 'saving' ? (
                              <CheckCircle2 
                                size={24} 
                                className="text-[#34C759]"
                                fill="#34C759"
                                strokeWidth={0}
                              />
                            ) : (
                              <Cloud size={24} className="text-[#8E8E93]" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white text-[15px] font-medium leading-tight">
                              {syncStatus === 'saved' ? 'Library synced with iCloud' : 
                               syncStatus === 'saving' ? 'Syncing...' :
                               syncStatus === 'offline' ? 'Offline - Changes saved locally' :
                               'Sync error'}
                            </p>
                            <p className="text-[#8E8E93] text-[13px] mt-0.5">
                              Last sync: {formatLastSync()}
                            </p>
                          </div>
                        </div>

                        <button
                          onClick={handleSyncNow}
                          disabled={isSyncing}
                          className="mt-3 text-[#0A84FF] text-[17px] font-normal flex items-center gap-2 disabled:opacity-50"
                        >
                          {isSyncing && <RefreshCw size={16} className="animate-spin" />}
                          {isSyncing ? 'Syncing...' : 'Sync Now'}
                        </button>
                      </div>
                    </div>

                    {/* Cloud & Backup Settings */}
                    <div className="px-4 pb-4">
                      <button
                        onClick={() => {
                          setCloudMenuOpen(false)
                        }}
                        className="w-full bg-[#1C1C1E] rounded-xl px-4 py-4 flex items-center justify-between hover:bg-[#2A2A2C] transition-colors"
                      >
                        <span className="text-white text-[17px]">Cloud & Backup Settings</span>
                        <ChevronRight set="broken" size={20} stroke="regular" primaryColor="#8E8E93" />
                      </button>
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
