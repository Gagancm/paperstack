import { useAppStore, LABEL_COLORS, DOCUMENT_TYPES } from '../../store/appStore'
import FolderCard from './FolderCard'
import NoteCard from './NoteCard'
import { Star, Document } from 'react-iconly'
import { ChevronDown, Layout, FileText } from 'lucide-react'

export default function NotesList() {
  const {
    getFilteredNotes,
    getFilteredFolders,
    deleteFolder,
    addToast,
    selectNote,
    selectedNoteId,
    selectedFolderId,
    setSelectedFolder,
    getNotesCountByFolder,
    viewMode,
    labels,
    activeDocumentType,
  } = useAppStore()
  
  const filteredNotes = getFilteredNotes()
  const folders = getFilteredFolders()
  const showFolders = !selectedFolderId
  const hasContent = (showFolders && folders.length > 0) || filteredNotes.length > 0

  const handleDeleteFolder = (folder) => {
    deleteFolder(folder.id)
    addToast({ message: 'Folder removed' })
  }

  const handleFolderClick = (folder) => {
    setSelectedFolder(folder.id)
  }

  const formatDate = (dateStr) => {
    if (!dateStr) return ''
    const d = new Date(dateStr)
    const now = new Date()
    const diffMs = now - d
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return 'Just now'
    if (diffMins < 60) return `${diffMins}m ago`
    if (diffHours < 24) return `${diffHours}h ago`
    if (diffDays === 1) return 'Yesterday'
    if (diffDays < 7) return `${diffDays}d ago`
    
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
  }

  const getNoteLabelObjects = (note) => {
    if (!note.labels || note.labels.length === 0) return []
    return note.labels
      .map(labelId => labels.find(l => l.id === labelId))
      .filter(Boolean)
      .slice(0, 3) // Show max 3 labels
  }

  // Get document type info for empty state
  const docTypeInfo = DOCUMENT_TYPES[activeDocumentType] || DOCUMENT_TYPES.notebook

  return (
    <div className="flex-1 overflow-y-auto bg-[#1C1C1E]">
      <div className="py-6 px-[30px]">
        {hasContent ? (
          <div className="flex flex-col gap-8">
            {/* Folders Section */}
            {showFolders && folders.length > 0 && (
              <div>
                <h3 className="text-[#8E8E93] text-xs uppercase tracking-wider mb-4">Folders</h3>
                {viewMode === 'grid' ? (
                  <div className="flex flex-wrap gap-4">
                    {folders.map((folder) => (
                      <FolderCard
                        key={folder.id}
                        folder={folder}
                        noteCount={getNotesCountByFolder(folder.id)}
                        onClick={() => handleFolderClick(folder)}
                        onDelete={handleDeleteFolder}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {folders.map((folder) => (
                      <FolderListItem
                        key={folder.id}
                        folder={folder}
                        noteCount={getNotesCountByFolder(folder.id)}
                        onClick={() => handleFolderClick(folder)}
                        formatDate={formatDate}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Notes Section */}
            {filteredNotes.length > 0 && (
              <div>
                {showFolders && <h3 className="text-[#8E8E93] text-xs uppercase tracking-wider mb-4">{docTypeInfo.label}</h3>}
                {viewMode === 'grid' ? (
                  <div className="flex flex-wrap gap-4">
                    {filteredNotes.map((note) => (
                      <NoteCard
                        key={note.id}
                        note={note}
                        onClick={selectNote}
                        isSelected={selectedNoteId === note.id}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {filteredNotes.map((note) => (
                      <NoteListItem
                        key={note.id}
                        note={note}
                        onClick={() => selectNote(note.id)}
                        isSelected={selectedNoteId === note.id}
                        formatDate={formatDate}
                        labelObjects={getNoteLabelObjects(note)}
                      />
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Empty folder state */}
            {selectedFolderId && filteredNotes.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-5xl mb-4">📂</div>
                <h3 className="text-lg font-semibold text-white mb-2">This folder is empty</h3>
                <p className="text-[#8E8E93] text-sm">Create a new {docTypeInfo.label.toLowerCase().slice(0, -1)} or move existing ones here</p>
              </div>
            )}
          </div>
        ) : (
          <EmptyState docType={docTypeInfo} />
        )}
      </div>
    </div>
  )
}

// List view item for notes
function NoteListItem({ note, onClick, isSelected, formatDate, labelObjects }) {
  const documentType = note.documentType || 'notebook'
  
  // Get document type icon
  const getDocTypeIcon = () => {
    switch (documentType) {
      case 'whiteboard':
        return <Layout size={14} className="text-[#BF5AF2]" />
      case 'document':
        return <FileText size={14} className="text-[#30D158]" />
      default:
        return <Document set="broken" size={14} stroke="regular" primaryColor="#0A84FF" />
    }
  }

  return (
    <div
      onClick={onClick}
      className={`flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-colors ${
        isSelected ? 'bg-[#0A84FF]/20' : 'hover:bg-[#2C2C2E]'
      }`}
    >
      {/* Color indicator */}
      <div 
        className="w-1 h-10 rounded-full flex-shrink-0"
        style={{ backgroundColor: getNotebookColor(note.colorKey || 'blue') }}
      />
      
      {/* Note info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="flex-shrink-0">{getDocTypeIcon()}</span>
          <p className="text-white font-medium text-[15px] truncate">
            {note.title || 'Untitled'}
          </p>
          {note.pinned && (
            <Star set="bold" size={14} primaryColor="#FFD60A" />
          )}
        </div>
        <div className="flex items-center gap-2 mt-0.5">
          {/* Preview text */}
          <p className="text-[#8E8E93] text-[13px] truncate flex-1">
            {note.content ? stripHtml(note.content).slice(0, 60) : 'No content'}
          </p>
          {/* Labels */}
          {labelObjects.length > 0 && (
            <div className="flex items-center gap-1 flex-shrink-0">
              {labelObjects.map((label) => (
                <div
                  key={label.id}
                  className="w-2 h-2 rounded-full"
                  style={{ backgroundColor: LABEL_COLORS[label.color] }}
                  title={label.name}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      
      {/* Date */}
      <span className="text-[#8E8E93] text-[13px] flex-shrink-0">
        {formatDate(note.updatedAt)}
      </span>
      
      {/* Dropdown button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          // TODO: Open menu
        }}
        className="p-1 rounded hover:bg-[#3A3A3C] transition-colors text-[#0A84FF] flex-shrink-0"
      >
        <ChevronDown size={16} />
      </button>
    </div>
  )
}

// List view item for folders
function FolderListItem({ folder, noteCount, onClick, formatDate }) {
  return (
    <div
      onClick={onClick}
      className="flex items-center gap-4 px-4 py-3 rounded-xl cursor-pointer transition-colors hover:bg-[#2C2C2E]"
    >
      {/* Folder icon */}
      <div 
        className="w-10 h-10 rounded-lg flex items-center justify-center text-lg flex-shrink-0"
        style={{ backgroundColor: getFolderColor(folder.colorKey || 'blue') }}
      >
        📁
      </div>
      
      {/* Folder info */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-white font-medium text-[15px] truncate">
            {folder.name}
          </p>
          {folder.pinned && (
            <Star set="bold" size={14} primaryColor="#FFD60A" />
          )}
        </div>
        <p className="text-[#8E8E93] text-[13px]">
          {noteCount} {noteCount === 1 ? 'note' : 'notes'}
        </p>
      </div>
      
      {/* Date */}
      <span className="text-[#8E8E93] text-[13px] flex-shrink-0">
        {formatDate(folder.updatedAt)}
      </span>
      
      {/* Dropdown button */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          // TODO: Open menu
        }}
        className="p-1 rounded hover:bg-[#3A3A3C] transition-colors text-[#0A84FF] flex-shrink-0"
      >
        <ChevronDown size={16} />
      </button>
    </div>
  )
}

function EmptyState({ docType }) {
  // Get appropriate icon based on document type
  const getIcon = () => {
    switch (docType.id) {
      case 'whiteboard':
        return '🎨'
      case 'document':
        return '📄'
      default:
        return '📓'
    }
  }

  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-6xl mb-6">{getIcon()}</div>
      <h2 className="text-xl font-bold text-white mb-2">No {docType.label.toLowerCase()} yet</h2>
      <p className="text-[#8E8E93] text-sm max-w-xs">
        Tap the + New button to create your first {docType.label.toLowerCase().slice(0, -1)}
      </p>
      <p className="text-[#636366] text-xs mt-2 max-w-xs">
        {docType.description}
      </p>
    </div>
  )
}

// Helper functions
function stripHtml(html) {
  const tmp = document.createElement('div')
  tmp.innerHTML = html
  return tmp.textContent || tmp.innerText || ''
}

function getNotebookColor(colorKey) {
  const colors = {
    blue: '#0A84FF',
    purple: '#BF5AF2',
    pink: '#FF375F',
    red: '#FF453A',
    orange: '#FF9500',
    yellow: '#FFD60A',
    green: '#30D158',
    teal: '#48C9B0',
    gray: '#8E8E93',
  }
  return colors[colorKey] || colors.blue
}

function getFolderColor(colorKey) {
  const colors = {
    blue: '#0A84FF',
    purple: '#BF5AF2',
    pink: '#FF375F',
    red: '#FF453A',
    orange: '#FF9500',
    yellow: '#FFD60A',
    green: '#30D158',
    teal: '#48C9B0',
    gray: '#8E8E93',
  }
  return colors[colorKey] || colors.blue
}
