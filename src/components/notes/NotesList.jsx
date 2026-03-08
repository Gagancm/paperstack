import { motion } from 'framer-motion'
import { useAppStore, LABEL_COLORS, DOCUMENT_TYPES, effectiveDocType } from '../../store/appStore'
import FolderCard from './FolderCard'
import NoteCard from './NoteCard'
import { Star, Document } from 'react-iconly'
import { ChevronDown, Layout, FileText } from 'lucide-react'

const listContainer = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.04 } } }
const listItem = { hidden: { opacity: 0, y: 8 }, show: { opacity: 1, y: 0 } }

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
    activeFilter,
  } = useAppStore()
  
  const filteredNotes = getFilteredNotes()
  const folders = getFilteredFolders()
  const showFolders = !selectedFolderId
  const groupByType = activeFilter === 'trash' || activeFilter === 'favorites'
  const hasContent = (showFolders && folders.length > 0) || filteredNotes.length > 0

  // Group notes by document type for Trash and Favorites views
  const notesByType = groupByType
    ? ['notebook', 'task', 'whiteboard'].map((type) => ({
        type,
        label: DOCUMENT_TYPES[type]?.label || type,
        notes: filteredNotes.filter((n) => effectiveDocType(n) === type),
      })).filter((g) => g.notes.length > 0)
    : null

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
    <div className={`flex-1 bg-[#1C1C1E] flex flex-col min-h-0 ${hasContent ? 'overflow-y-auto' : 'overflow-hidden flex items-center justify-center'}`}>
      <div className={hasContent ? 'py-4 sm:py-6 px-4 sm:px-6 ipad:px-[30px]' : 'w-full flex items-center justify-center px-4 sm:px-6 ipad:px-[30px]'}>
        {hasContent ? (
          <motion.div className="flex flex-col gap-8" variants={listContainer} initial="hidden" animate="show">
            {/* Folders Section */}
            {showFolders && folders.length > 0 && (
              <div>
                <h3 className="text-[#8E8E93] text-xs uppercase tracking-wider mb-4">Folders</h3>
                {viewMode === 'grid' ? (
                  <div className="flex flex-wrap gap-3 sm:gap-4">
                    {folders.map((folder) => (
                      <motion.div key={folder.id} variants={listItem}>
                        <FolderCard
                          folder={folder}
                          noteCount={getNotesCountByFolder(folder.id)}
                          onClick={() => handleFolderClick(folder)}
                          onDelete={handleDeleteFolder}
                        />
                      </motion.div>
                    ))}
                  </div>
                ) : (
                  <div className="flex flex-col gap-1">
                    {folders.map((folder) => (
                      <motion.div key={folder.id} variants={listItem}>
                        <FolderListItem
                          folder={folder}
                          noteCount={getNotesCountByFolder(folder.id)}
                          onClick={() => handleFolderClick(folder)}
                          formatDate={formatDate}
                        />
                      </motion.div>
                    ))}
                  </div>
                )}
              </div>
            )}
            
            {/* Notes Section - grouped by type in Trash/Favorites, single section otherwise */}
            {filteredNotes.length > 0 && (
              <div className="flex flex-col gap-8">
                {groupByType && notesByType ? (
                  notesByType.map(({ type, label, notes: typeNotes }) => (
                    <div key={type}>
                      <h3 className="text-[#8E8E93] text-xs uppercase tracking-wider mb-4">{label}</h3>
                      {viewMode === 'grid' ? (
                        <div className="flex flex-wrap gap-3 sm:gap-4">
                          {typeNotes.map((note) => (
                            <motion.div key={note.id} variants={listItem}>
                              <NoteCard
                                note={note}
                                onClick={selectNote}
                                isSelected={selectedNoteId === note.id}
                              />
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="flex flex-col gap-1">
                          {typeNotes.map((note) => (
                            <motion.div key={note.id} variants={listItem}>
                              <NoteListItem
                                note={note}
                                onClick={() => selectNote(note.id)}
                                isSelected={selectedNoteId === note.id}
                                formatDate={formatDate}
                                labelObjects={getNoteLabelObjects(note)}
                              />
                            </motion.div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div>
                    {showFolders && <h3 className="text-[#8E8E93] text-xs uppercase tracking-wider mb-4">{docTypeInfo.label}</h3>}
                    {viewMode === 'grid' ? (
                      <div className="flex flex-wrap gap-3 sm:gap-4">
                        {filteredNotes.map((note) => (
                          <motion.div key={note.id} variants={listItem}>
                            <NoteCard
                              note={note}
                              onClick={selectNote}
                              isSelected={selectedNoteId === note.id}
                            />
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-1">
                        {filteredNotes.map((note) => (
                          <motion.div key={note.id} variants={listItem}>
                            <NoteListItem
                              note={note}
                              onClick={() => selectNote(note.id)}
                              isSelected={selectedNoteId === note.id}
                              formatDate={formatDate}
                              labelObjects={getNoteLabelObjects(note)}
                            />
                          </motion.div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </motion.div>
        ) : (
          <EmptyState docType={docTypeInfo} activeFilter={activeFilter} selectedFolderId={selectedFolderId} />
        )}
      </div>
    </div>
  )
}

// List view item for notes
function NoteListItem({ note, onClick, isSelected, formatDate, labelObjects }) {
  const documentType = effectiveDocType(note)
  
  // Get document type icon
  const getDocTypeIcon = () => {
    switch (documentType) {
      case 'whiteboard':
        return <Layout size={14} className="text-[#BF5AF2]" />
      case 'task':
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

function EmptyState({ docType, activeFilter, selectedFolderId }) {
  const isTrash = activeFilter === 'trash'
  const isFavorites = activeFilter === 'favorites'
  const isEmptyFolder = !!selectedFolderId

  const TRASH_JOKES = [
    { line1: "The trash can is on a diet.", line2: "It hasn't had a single byte all day." },
    { line1: "Even your trash is minimalist.", line2: "Marie Kondo would be proud (and confused)." },
    { line1: "Your trash ran away to join the circus.", line2: "It said it needed more drama in its life." },
    { line1: "The trash is empty. The trash is clean.", line2: "Your ex's love letters have nowhere to hide." },
    { line1: "No trash. No drama.", line2: "Just you and your impeccable life choices." },
  ]
  const FAVORITES_JOKES = [
    { line1: "Your favorites list is playing hard to get.", line2: "Star something. Anything. We believe in you." },
    { line1: "Zero favorites. Maximum mystery.", line2: "What will be worthy of the gold star?" },
    { line1: "The stars are empty tonight.", line2: "Give a note a ⭐ and watch it shine here." },
    { line1: "No favorites yet—your heart is still shopping.", line2: "Tap that star when you find the one." },
    { line1: "Even the best need a favorite.", line2: "Pick one. We won't tell the others." },
  ]
  const NOTEBOOK_JOKES = [
    { line1: "No notebooks? That's a bold choice.", line2: "Hit + New when you're ready to write the next chapter." },
    { line1: "The notebook shelf is judging no one.", line2: "Add one and break the silence." },
    { line1: "Zero notebooks. Infinite potential.", line2: "Your first one is one click away." },
    { line1: "Empty notebooks, empty mind?", line2: "Nah. Just hit + New and fill the void." },
    { line1: "No notebooks yet. The pens are nervous.", line2: "Create one and put them to work." },
  ]
  const WHITEBOARD_JOKES = [
    { line1: "The whiteboard is blank. So is the cat's schedule.", line2: "Start drawing. Someone has to." },
    { line1: "No whiteboards. The markers are crying.", line2: "Create one and give them a purpose." },
    { line1: "Infinite canvas, zero boards.", line2: "Add one and go wild. No eraser shame." },
    { line1: "Blank slate energy. Literally.", line2: "+ New and make your first mess." },
    { line1: "The whiteboard is waiting for its first doodle.", line2: "Don't keep it waiting." },
  ]
  const TASK_JOKES = [
    { line1: "No tasks. Either you're done or in denial.", line2: "Add one. We won't tell." },
    { line1: "Zero tasks. The to-do list is on vacation.", line2: "Create one when it gets back." },
    { line1: "No tasks yet. Your future self will thank you.", line2: "Or curse you. Depends on the task." },
    { line1: "The task list is empty. So is our judgment.", line2: "Hit + New when you're ready to adult." },
    { line1: "No tasks. Productivity is a myth anyway.", line2: "Just kidding. Add one. You got this." },
  ]
  const FOLDER_JOKES = [
    { line1: "This folder is on a cleanse.", line2: `No ${docType.label.toLowerCase().slice(0, -1)} in here yet.` },
    { line1: "Empty folder. Full potential.", line2: `Create or move ${docType.label.toLowerCase()} in and make it home.` },
    { line1: "The folder is waiting for company.", line2: `Drop in a ${docType.label.toLowerCase().slice(0, -1)} or two.` },
  ]

  const getContent = () => {
    if (isTrash) {
      const joke = TRASH_JOKES[Math.floor(Math.random() * TRASH_JOKES.length)]
      return { illustration: '🗑️', ...joke }
    }
    if (isFavorites) {
      const joke = FAVORITES_JOKES[Math.floor(Math.random() * FAVORITES_JOKES.length)]
      return { illustration: '⭐', ...joke }
    }
    if (isEmptyFolder) {
      const joke = FOLDER_JOKES[Math.floor(Math.random() * FOLDER_JOKES.length)]
      return { illustration: '📂', ...joke }
    }
    const icons = { whiteboard: '🎨', task: '📄', notebook: '📓' }
    const icon = icons[docType.id] || '📓'
    if (docType.id === 'notebook') {
      const joke = NOTEBOOK_JOKES[Math.floor(Math.random() * NOTEBOOK_JOKES.length)]
      return { illustration: icon, ...joke }
    }
    if (docType.id === 'whiteboard') {
      const joke = WHITEBOARD_JOKES[Math.floor(Math.random() * WHITEBOARD_JOKES.length)]
      return { illustration: icon, ...joke }
    }
    if (docType.id === 'task') {
      const joke = TASK_JOKES[Math.floor(Math.random() * TASK_JOKES.length)]
      return { illustration: icon, ...joke }
    }
    const joke = NOTEBOOK_JOKES[Math.floor(Math.random() * NOTEBOOK_JOKES.length)]
    return { illustration: icon, ...joke }
  }

  const content = getContent()

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, ease: 'easeOut' }}
      className="flex flex-col items-center justify-center text-center max-w-sm"
    >
      <div className="text-7xl mb-6 select-none" aria-hidden>{content.illustration}</div>
      <p className="text-xl font-bold text-white mb-2">{content.line1}</p>
      <p className="text-[#8E8E93] text-sm">{content.line2}</p>
    </motion.div>
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
    red: '#FF453A', orange: '#FF9500', yellow: '#FFD60A', lime: '#8BC34A', green: '#30D158',
    teal: '#48C9B0', cyan: '#32ADE6', blue: '#0A84FF', indigo: '#5856D6', purple: '#BF5AF2',
    pink: '#FF375F', magenta: '#FF2D92', mint: '#A5D6A7', sky: '#81D4FA', gray: '#8E8E93',
    white: '#E5E5EA',
  }
  return colors[colorKey] || colors.blue
}

function getFolderColor(colorKey) {
  const colors = {
    red: '#FF453A', orange: '#FF9500', yellow: '#FFD60A', lime: '#8BC34A', green: '#30D158',
    teal: '#48C9B0', cyan: '#32ADE6', blue: '#0A84FF', indigo: '#5856D6', purple: '#BF5AF2',
    pink: '#FF375F', magenta: '#FF2D92', mint: '#A5D6A7', sky: '#81D4FA', gray: '#8E8E93',
    white: '#E5E5EA',
  }
  return colors[colorKey] || colors.blue
}
