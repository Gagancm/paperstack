import { useState, useEffect, useRef } from 'react'
import { Search } from 'react-iconly'
import { X, Star, Folder, TrendingUp } from 'lucide-react'
import { useAppStore, LABEL_COLORS } from '../../store/appStore'

export default function SearchOverlay({ isOpen, onClose }) {
  const [query, setQuery] = useState('')
  const inputRef = useRef(null)
  
  const {
    searchQuery,
    setSearchQuery,
    notes,
    folders,
    labels,
    getFilteredNotes,
    getFilteredFolders,
    selectNote,
    setSelectedFolder,
    setActiveFilter,
  } = useAppStore()

  // Focus input when overlay opens
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100)
      setQuery(searchQuery)
    }
  }, [isOpen, searchQuery])

  // Handle escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleClose = () => {
    setSearchQuery('')
    setQuery('')
    onClose()
  }

  const handleSearch = (value) => {
    setQuery(value)
    setSearchQuery(value)
  }

  const handleNoteClick = (noteId) => {
    selectNote(noteId)
    handleClose()
  }

  const handleFolderClick = (folderId) => {
    setSelectedFolder(folderId)
    handleClose()
  }

  const handleLabelClick = (labelId) => {
    setActiveFilter(labelId)
    handleClose()
  }

  // Get filtered results
  const filteredNotes = query ? getFilteredNotes() : []
  const filteredFolders = query ? getFilteredFolders() : []
  
  // Filter labels by search query
  const filteredLabels = query 
    ? labels.filter(l => l.name.toLowerCase().includes(query.toLowerCase()))
    : []

  // Recent notes (last 6 modified)
  const recentNotes = [...notes]
    .filter(n => !n.inTrash)
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
    .slice(0, 6)

  if (!isOpen) return null

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh]">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={handleClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[#2C2C2E] rounded-2xl shadow-2xl border border-[#3A3A3C] overflow-hidden mx-4">
        {/* Search Input */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#3A3A3C]">
          <Search set="broken" size={20} className="text-[#8E8E93] shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Search notes, folders, labels..."
            className="flex-1 bg-transparent text-white placeholder-[#6E6E73] outline-none text-[15px]"
            autoFocus
          />
          {query && (
            <button
              onClick={() => handleSearch('')}
              className="text-[#8E8E93] hover:text-white p-1"
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Recent Searches / Quick Access Pills */}
        <div className="px-4 py-3 border-b border-[#3A3A3C] flex items-center gap-2 overflow-x-auto">
          {labels.slice(0, 6).map((label) => (
            <button
              key={label.id}
              onClick={() => handleLabelClick(label.id)}
              className="flex items-center gap-2 px-3 py-1.5 bg-[#3A3A3C] rounded-full hover:bg-[#4A4A4C] transition-colors shrink-0"
            >
              <div 
                className="w-2.5 h-2.5 rounded-full"
                style={{ backgroundColor: LABEL_COLORS[label.color] }}
              />
              <span className="text-white text-[13px]">{label.name}</span>
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="max-h-[60vh] overflow-y-auto">
          {!query ? (
            /* Default State - Show sidebar + Recent notes */
            <div className="flex">
              {/* Left Sidebar */}
              <div className="w-48 border-r border-[#3A3A3C] p-3 shrink-0">
                <SidebarItem icon={<TrendingUp size={16} />} label="Recent" active />
                <SidebarItem icon={<Star size={16} />} label="Favorites" onClick={() => { setActiveFilter('favorites'); handleClose(); }} />
                <SidebarItem icon={<Folder size={16} />} label="Folders" />
                
                <div className="mt-4 pt-4 border-t border-[#3A3A3C]">
                  <p className="text-[#6E6E73] text-[11px] uppercase tracking-wider mb-2 px-2">Labels</p>
                  {labels.map((label) => (
                    <button
                      key={label.id}
                      onClick={() => handleLabelClick(label.id)}
                      className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#3A3A3C] transition-colors text-left"
                    >
                      <div 
                        className="w-2.5 h-2.5 rounded-full"
                        style={{ backgroundColor: LABEL_COLORS[label.color] }}
                      />
                      <span className="text-[#8E8E93] text-[13px]">{label.name}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Right Content - Recent Notes */}
              <div className="flex-1 p-4">
                <p className="text-[#6E6E73] text-[11px] uppercase tracking-wider mb-3">Recent</p>
                <div className="grid grid-cols-2 gap-3">
                  {recentNotes.map((note) => (
                    <NoteCard 
                      key={note.id} 
                      note={note} 
                      onClick={() => handleNoteClick(note.id)} 
                      labels={labels} 
                    />
                  ))}
                </div>
                {recentNotes.length === 0 && (
                  <div className="text-center py-8">
                    <p className="text-[#6E6E73] text-sm">No recent notes</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            /* Search Results */
            <div className="flex">
              {/* Left Sidebar - Filtered */}
              <div className="w-48 border-r border-[#3A3A3C] p-3 shrink-0">
                {filteredLabels.length > 0 && (
                  <>
                    <p className="text-[#6E6E73] text-[11px] uppercase tracking-wider mb-2 px-2">Labels</p>
                    {filteredLabels.map((label) => (
                      <button
                        key={label.id}
                        onClick={() => handleLabelClick(label.id)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#3A3A3C] transition-colors text-left"
                      >
                        <div 
                          className="w-2.5 h-2.5 rounded-full"
                          style={{ backgroundColor: LABEL_COLORS[label.color] }}
                        />
                        <span className="text-white text-[13px]">{label.name}</span>
                      </button>
                    ))}
                  </>
                )}

                {filteredFolders.length > 0 && (
                  <div className={filteredLabels.length > 0 ? 'mt-4 pt-4 border-t border-[#3A3A3C]' : ''}>
                    <p className="text-[#6E6E73] text-[11px] uppercase tracking-wider mb-2 px-2">Folders</p>
                    {filteredFolders.map((folder) => (
                      <button
                        key={folder.id}
                        onClick={() => handleFolderClick(folder.id)}
                        className="w-full flex items-center gap-2 px-2 py-1.5 rounded-lg hover:bg-[#3A3A3C] transition-colors text-left"
                      >
                        <Folder size={14} className="text-[#0A84FF]" />
                        <span className="text-white text-[13px] truncate">{folder.name}</span>
                      </button>
                    ))}
                  </div>
                )}

                {filteredLabels.length === 0 && filteredFolders.length === 0 && (
                  <p className="text-[#6E6E73] text-[13px] px-2">No matches</p>
                )}
              </div>

              {/* Right Content - Notes Results */}
              <div className="flex-1 p-4">
                <p className="text-[#6E6E73] text-[11px] uppercase tracking-wider mb-3">
                  Notes {filteredNotes.length > 0 && `(${filteredNotes.length})`}
                </p>
                {filteredNotes.length > 0 ? (
                  <div className="grid grid-cols-2 gap-3">
                    {filteredNotes.map((note) => (
                      <NoteCard 
                        key={note.id} 
                        note={note} 
                        onClick={() => handleNoteClick(note.id)} 
                        labels={labels} 
                      />
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="text-white font-medium mb-1">No notes found</p>
                    <p className="text-[#6E6E73] text-sm">Try different keywords</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// Sidebar Item
function SidebarItem({ icon, label, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2 px-2 py-2 rounded-lg transition-colors text-left ${
        active ? 'bg-[#3A3A3C] text-white' : 'text-[#8E8E93] hover:bg-[#3A3A3C] hover:text-white'
      }`}
    >
      {icon}
      <span className="text-[13px]">{label}</span>
    </button>
  )
}

// Note Card for search results
function NoteCard({ note, onClick, labels }) {
  const noteLabels = (note.labels || [])
    .map(id => labels.find(l => l.id === id))
    .filter(Boolean)
    .slice(0, 2)

  const getPreview = () => {
    if (!note.content) return 'No content'
    const plain = note.content.replace(/<[^>]*>/g, '')
    return plain.slice(0, 60) || 'No content'
  }

  return (
    <button
      onClick={onClick}
      className="w-full text-left bg-[#3A3A3C] rounded-xl p-3 hover:bg-[#4A4A4C] transition-colors"
    >
      <div className="flex items-start justify-between gap-2 mb-1">
        <h4 className="text-white font-medium text-[13px] truncate flex-1">
          {note.title || 'Untitled'}
        </h4>
        {note.pinned && <Star size={12} className="text-[#FFD60A] shrink-0" fill="#FFD60A" />}
      </div>
      <p className="text-[#8E8E93] text-[11px] line-clamp-2 mb-2">{getPreview()}</p>
      {noteLabels.length > 0 && (
        <div className="flex items-center gap-1">
          {noteLabels.map((label) => (
            <div
              key={label.id}
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: LABEL_COLORS[label.color] }}
            />
          ))}
        </div>
      )}
    </button>
  )
}
