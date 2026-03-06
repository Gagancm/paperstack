import { useState } from 'react'
import { Filter, Plus, ChevronDown, Category } from 'react-iconly'
import { Cloud } from 'lucide-react' // Cloud not available in Iconly
import { useAppStore } from '../../store/appStore'
import NewNoteModal from '../ui/NewNoteModal'
import NewFolderModal from '../ui/NewFolderModal'

export default function ContentHeader() {
  const [filterOpen, setFilterOpen] = useState(false)
  const [newMenuOpen, setNewMenuOpen] = useState(false)
  const [showNewNoteModal, setShowNewNoteModal] = useState(false)
  const [showNewFolderModal, setShowNewFolderModal] = useState(false)
  
  const {
    activeFilter,
    setActiveFilter,
    labels,
    selectedFolderId,
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
                <div className="absolute left-0 top-full mt-1 bg-[#2C2C2E] rounded-lg shadow-xl z-50 min-w-[150px] py-1 border border-[#3A3A3C]">
                  {filterOptions.map((opt) => (
                    <button
                      key={opt.id}
                      onClick={() => {
                        setActiveFilter(opt.id)
                        setFilterOpen(false)
                      }}
                      className={`w-full px-4 py-2 text-left text-sm transition-colors ${
                        activeFilter === opt.id 
                          ? 'bg-[#0A84FF] text-white' 
                          : 'text-white hover:bg-[#3A3A3C]'
                      }`}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>

          {/* Right controls */}
          <div className="flex items-center gap-1">
            {/* New button */}
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
                  <div className="absolute right-0 top-full mt-1 bg-[#2C2C2E] rounded-lg shadow-xl z-50 min-w-[150px] py-1 border border-[#3A3A3C]">
                    <button
                      onClick={() => {
                        setNewMenuOpen(false)
                        setShowNewNoteModal(true)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#3A3A3C]"
                    >
                      New Note
                    </button>
                    <button
                      onClick={() => {
                        setNewMenuOpen(false)
                        setShowNewFolderModal(true)
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-white hover:bg-[#3A3A3C]"
                    >
                      New Folder
                    </button>
                  </div>
                </>
              )}
            </div>

            {/* Divider */}
            <div className="w-px h-5 bg-[#3A3A3C] mx-2" />

            {/* Grid view icon */}
            <button className="p-2 rounded-lg hover:bg-[#3A3A3C] transition-colors text-[#8E8E93]">
              <Category set="broken" size={18} stroke="regular" />
            </button>

            {/* Sync icon - Cloud not available in Iconly, keeping lucide */}
            <button className="p-2 rounded-lg hover:bg-[#3A3A3C] transition-colors">
              <Cloud size={18} className="text-[#8E8E93]" />
            </button>
          </div>
        </div>
      </div>

      <NewNoteModal isOpen={showNewNoteModal} onClose={() => setShowNewNoteModal(false)} />
      <NewFolderModal isOpen={showNewFolderModal} onClose={() => setShowNewFolderModal(false)} />
    </>
  )
}
