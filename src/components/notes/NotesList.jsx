import { ChevronLeft } from 'lucide-react'
import { useAppStore } from '../../store/appStore'
import FolderCard from './FolderCard'
import NoteCard from './NoteCard'

export default function NotesList() {
  const {
    folders,
    getFilteredNotes,
    deleteFolder,
    addToast,
    selectNote,
    selectedNoteId,
    selectedFolderId,
    setSelectedFolder,
    clearSelectedFolder,
    getNotesCountByFolder,
  } = useAppStore()
  
  const filteredNotes = getFilteredNotes()
  const selectedFolder = folders.find(f => f.id === selectedFolderId)
  const showFolders = !selectedFolderId
  const hasContent = (showFolders && folders.length > 0) || filteredNotes.length > 0

  const handleDeleteFolder = (folder) => {
    deleteFolder(folder.id)
    addToast({ message: 'Folder removed' })
  }

  const handleFolderClick = (folder) => {
    setSelectedFolder(folder.id)
  }

  return (
    <div className="flex-1 overflow-y-auto bg-[#1C1C1E]">
      {/* Folder Header when inside a folder */}
      {selectedFolder && (
        <div className="px-[30px] py-4">
          <button
            onClick={clearSelectedFolder}
            className="flex items-center gap-1 text-[#0A84FF] hover:opacity-80 transition-opacity mb-3 -ml-1"
          >
            <ChevronLeft size={20} />
            <span className="font-medium">All Notes</span>
          </button>
          <div className="flex items-center gap-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center text-2xl"
              style={{ background: selectedFolder.gradient || selectedFolder.color }}
            >
              {selectedFolder.icon || '📁'}
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">{selectedFolder.name}</h2>
              <p className="text-[#8E8E93] text-sm">
                {filteredNotes.length} {filteredNotes.length === 1 ? 'note' : 'notes'}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="py-6 px-[30px]">
        {hasContent ? (
          <div className="flex flex-col gap-6">
            {/* Folders Section */}
            {showFolders && folders.length > 0 && (
              <div>
                <h3 className="text-[#8E8E93] text-xs uppercase tracking-wider mb-3">Folders</h3>
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
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
              </div>
            )}
            
            {/* Notes Section */}
            {filteredNotes.length > 0 && (
              <div>
                {showFolders && <h3 className="text-[#8E8E93] text-xs uppercase tracking-wider mb-3">Notes</h3>}
                <div className="grid grid-cols-4 sm:grid-cols-5 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2">
                  {filteredNotes.map((note) => (
                    <NoteCard
                      key={note.id}
                      note={note}
                      onClick={selectNote}
                      isSelected={selectedNoteId === note.id}
                    />
                  ))}
                </div>
              </div>
            )}
            
            {/* Empty folder state */}
            {selectedFolderId && filteredNotes.length === 0 && (
              <div className="flex flex-col items-center justify-center py-12 text-center">
                <div className="text-5xl mb-4">📂</div>
                <h3 className="text-lg font-semibold text-white mb-2">This folder is empty</h3>
                <p className="text-[#8E8E93] text-sm">Create a new note or move existing notes here</p>
              </div>
            )}
          </div>
        ) : (
          <EmptyState />
        )}
      </div>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="text-6xl mb-6">📝</div>
      <h2 className="text-xl font-bold text-white mb-2">No notes yet</h2>
      <p className="text-[#8E8E93] text-sm max-w-xs">
        Tap the + New button to create your first note or folder
      </p>
    </div>
  )
}
