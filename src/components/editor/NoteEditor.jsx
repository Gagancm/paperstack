import { useState, useEffect, useRef, useCallback } from 'react'
import { ChevronLeft, Star, Folder, Delete, CloseSquare, TickSquare, MoreSquare } from 'react-iconly'
import { Tag, Copy, Settings } from 'lucide-react'
import { useAppStore, LABEL_COLORS } from '../../store/appStore'
import LabelPicker from '../labels/LabelPicker'
import UnifiedCanvas from './UnifiedCanvas'

export default function NoteEditor({ onClose }) {
  const {
    getSelectedNote,
    updateNote,
    togglePinNote,
    deleteNote,
    duplicateNote,
    selectNote,
    labels,
    folders,
    removeLabelFromNote,
    addToast,
  } = useAppStore()

  const [showMenu, setShowMenu] = useState(false)
  const [showLabelPicker, setShowLabelPicker] = useState(false)
  const [showFolderPicker, setShowFolderPicker] = useState(false)
  const [showPageSettings, setShowPageSettings] = useState(false)

  const note = getSelectedNote()

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  if (!note) return null

  const noteLabels = note.labels.map((id) => labels.find((l) => l.id === id)).filter(Boolean)
  const currentFolder = folders.find(f => f.id === note.folderId)

  const handleClose = () => { selectNote(null); onClose() }
  const handleDelete = () => { deleteNote(note.id); setShowMenu(false); onClose() }

  const handleMoveToFolder = (folderId) => {
    updateNote(note.id, { folderId: folderId || null })
    setShowFolderPicker(false)
    const folderName = folderId ? folders.find(f => f.id === folderId)?.name : 'No Folder'
    addToast({ message: `Moved to ${folderName}` })
  }

  return (
    <div className="fixed inset-0 z-50 bg-[#1C1C1E] flex flex-col">
      {/* Header - matches home/folder design */}
      <div className="flex items-center px-3 h-11 bg-[#2C2C2E] border-b border-[#3A3A3C]">
        {/* Left: Back button */}
        <div className="flex items-center min-w-[80px]">
          <button onClick={handleClose} className="p-1.5 rounded-lg hover:bg-[#3A3A3C] text-[#0A84FF]">
            <ChevronLeft set="broken" size={18} stroke="regular" />
          </button>
        </div>

        {/* Center: Folder / Note Title */}
        <div className="flex-1 flex justify-center items-center gap-1.5">
          {currentFolder && (
            <>
              <span className="text-[15px] text-[#8E8E93]">{currentFolder.name}</span>
              <span className="text-[15px] text-[#8E8E93]">/</span>
            </>
          )}
          <input
            type="text"
            value={note.title}
            onChange={(e) => updateNote(note.id, { title: e.target.value })}
            placeholder="Untitled"
            className="text-[15px] font-medium text-white bg-transparent border-none outline-none placeholder-[#8E8E93] text-center max-w-[200px]"
            maxLength={60}
          />
        </div>

        {/* Right: Actions */}
        <div className="flex items-center gap-0.5 min-w-[80px] justify-end">
          <button
            onClick={() => togglePinNote(note.id)}
            className={`p-1.5 rounded-lg hover:bg-[#3A3A3C] ${note.pinned ? 'text-yellow-500' : 'text-[#8E8E93]'}`}
          >
            <Star set={note.pinned ? 'bold' : 'broken'} size={18} stroke="regular" />
          </button>
          
          <button 
            onClick={() => setShowLabelPicker(!showLabelPicker)} 
            className="p-1.5 rounded-lg hover:bg-[#3A3A3C] text-[#8E8E93]"
          >
            <Tag size={18} />
          </button>

          <button 
            onClick={() => setShowPageSettings(!showPageSettings)} 
            className={`p-1.5 rounded-lg hover:bg-[#3A3A3C] ${showPageSettings ? 'text-[#0A84FF]' : 'text-[#8E8E93]'}`}
          >
            <Settings size={18} />
          </button>

          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)} 
              className="p-1.5 rounded-lg hover:bg-[#3A3A3C] text-[#8E8E93]"
            >
              <MoreSquare set="broken" size={18} stroke="regular" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-1 bg-[#2C2C2E] rounded-xl shadow-xl z-50 w-52 py-1 border border-[#3A3A3C]">
                  <button
                    onClick={() => { setShowMenu(false); setShowFolderPicker(true) }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-left text-white hover:bg-[#3A3A3C]"
                  >
                    <Folder set="broken" size={18} stroke="regular" className="text-[#8E8E93]" />
                    <span className="text-sm">Move to Folder</span>
                  </button>
                  <div className="h-px bg-[#3A3A3C] mx-2" />
                  <button
                    onClick={() => { duplicateNote(note.id); setShowMenu(false) }}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-left text-white hover:bg-[#3A3A3C]"
                  >
                    <Copy size={18} className="text-[#8E8E93]" />
                    <span className="text-sm">Duplicate</span>
                  </button>
                  <div className="h-px bg-[#3A3A3C] mx-2" />
                  <button
                    onClick={handleDelete}
                    className="w-full px-4 py-2.5 flex items-center gap-3 text-left text-[#FF453A] hover:bg-[#3A3A3C]"
                  >
                    <Delete set="broken" size={18} stroke="regular" />
                    <span className="text-sm">Delete</span>
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Label Picker */}
      {showLabelPicker && (
        <LabelPicker noteId={note.id} selectedLabels={note.labels} onClose={() => setShowLabelPicker(false)} />
      )}

      {/* Folder Picker Modal */}
      {showFolderPicker && (
        <FolderPicker
          currentFolderId={note.folderId}
          folders={folders}
          onSelect={handleMoveToFolder}
          onClose={() => setShowFolderPicker(false)}
        />
      )}

      {/* Unified Canvas - Main Editor */}
      <UnifiedCanvas 
        noteId={note.id} 
        showPageSettings={showPageSettings}
        onClosePageSettings={() => setShowPageSettings(false)}
      />
    </div>
  )
}

function FolderPicker({ currentFolderId, folders, onSelect, onClose }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-[#2C2C2E] w-full max-w-sm rounded-2xl pointer-events-auto">
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#3A3A3C]">
            <h3 className="text-lg font-semibold text-white">Move to Folder</h3>
            <button onClick={onClose} className="p-2 rounded-lg hover:bg-[#3A3A3C] text-[#8E8E93]">
              <CloseSquare set="broken" size={20} stroke="regular" />
            </button>
          </div>
          
          <div className="max-h-80 overflow-y-auto">
            <button
              onClick={() => onSelect(null)}
              className={`w-full px-5 py-4 flex items-center gap-3 hover:bg-[#3A3A3C] ${!currentFolderId ? 'text-[#0A84FF]' : 'text-white'}`}
            >
              <span className="text-2xl">📄</span>
              <span className="flex-1 text-left">No Folder</span>
              {!currentFolderId && <TickSquare set="broken" size={20} stroke="regular" primaryColor="#0A84FF" />}
            </button>
            
            <div className="h-px bg-[#3A3A3C]" />
            
            {folders.map((folder) => (
              <button
                key={folder.id}
                onClick={() => onSelect(folder.id)}
                className={`w-full px-5 py-4 flex items-center gap-3 hover:bg-[#3A3A3C] ${currentFolderId === folder.id ? 'text-[#0A84FF]' : 'text-white'}`}
              >
                <div 
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                  style={{ background: folder.gradient || folder.color }}
                >
                  {folder.icon || '📁'}
                </div>
                <span className="flex-1 text-left">{folder.name}</span>
                {currentFolderId === folder.id && <TickSquare set="broken" size={20} stroke="regular" primaryColor="#0A84FF" />}
              </button>
            ))}
            
            {folders.length === 0 && (
              <div className="px-5 py-8 text-center text-[#8E8E93]">No folders yet</div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
