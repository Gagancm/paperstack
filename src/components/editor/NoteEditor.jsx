import { useState, useEffect, useRef } from 'react'
import { motion } from 'framer-motion'
import { ChevronLeft, Star, Delete, CloseSquare, TickSquare, MoreSquare, ChevronRight, Bookmark, Send, Swap, Lock, Message, Setting, Edit } from 'react-iconly'
import { Tag, Copy, ListTree, Trash2, PanelLeft, MoveHorizontal, SlidersHorizontal } from 'lucide-react'
import { useAppStore, LABEL_COLORS } from '../../store/appStore'
import UnifiedCanvas from './UnifiedCanvas'

// Paper templates
const PAPER_TEMPLATES = [
  { id: 'blank', name: 'Blank' },
  { id: 'dotted', name: 'Dotted' },
  { id: 'grid', name: 'Grid' },
  { id: 'lined', name: 'Lined' },
  { id: 'lined-margin', name: 'Margin' },
  { id: 'cornell', name: 'Cornell' },
]

// Paper colors
const PAPER_COLORS = [
  { name: 'White', hex: '#FFFFFF' },
  { name: 'Cream', hex: '#FFF8E7' },
  { name: 'Yellow', hex: '#FFFDE7' },
  { name: 'Green', hex: '#E8F5E9' },
  { name: 'Blue', hex: '#E3F2FD' },
  { name: 'Dark', hex: '#2C2C2E' },
  { name: 'Sepia', hex: '#F5E6D3' },
  { name: 'Rose', hex: '#FCE4EC' },
]

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
    addLabelToNote,
    removeLabelFromNote,
    addToast,
  } = useAppStore()

  const [showMenu, setShowMenu] = useState(false)
  const [showLabelPicker, setShowLabelPicker] = useState(false)
  const [showFolderPicker, setShowFolderPicker] = useState(false)
  // Page settings now handled in UnifiedCanvas
  const canvasRef = useRef(null)

  const note = getSelectedNote()
  
  // Page settings state - initialized after note is available
  const [paperTemplate, setPaperTemplate] = useState('lined')
  const [paperColor, setPaperColor] = useState('#FFFFFF')
  
  // Sync paper settings when note changes
  useEffect(() => {
    if (note) {
      setPaperTemplate(note.paperTemplate || 'lined')
      setPaperColor(note.paperColor || '#FFFFFF')
    }
  }, [note?.id])

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
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 bg-[#1C1C1E] flex flex-col"
    >
      {/* Header - responsive height and touch targets for iPad/mobile */}
      <div className="flex items-center px-3 sm:px-4 h-12 sm:h-11 bg-[#2C2C2E] border-b border-[#3A3A3C] safe-area-pt">
        {/* Left: Back button - fixed width for centering */}
        <div className="flex items-center w-20 sm:w-[100px]">
          <button onClick={handleClose} className="p-2 sm:p-1.5 rounded-lg hover:bg-[#3A3A3C] text-[#0A84FF] min-w-[44px] min-h-[44px] flex items-center justify-center ipad:min-w-0 ipad:min-h-0">
            <ChevronLeft set="broken" size={18} stroke="regular" />
          </button>
        </div>

        {/* Center: Folder / Note Title */}
        <div className="flex-1 flex justify-center items-center gap-1.5 min-w-0">
          {currentFolder && (
            <>
              <span className="text-sm sm:text-[15px] text-[#8E8E93] truncate max-w-[80px] sm:max-w-none">{currentFolder.name}</span>
              <span className="text-[15px] text-[#8E8E93] shrink-0">/</span>
            </>
          )}
          <input
            type="text"
            value={note.title}
            onChange={(e) => updateNote(note.id, { title: e.target.value })}
            placeholder="Untitled"
            className="text-sm sm:text-[15px] font-medium text-white bg-transparent border-none outline-none placeholder-[#8E8E93] text-center w-full max-w-[140px] sm:max-w-[200px]"
            maxLength={60}
          />
        </div>

        {/* Right: Actions - fixed width to match left */}
        <div className="flex items-center gap-0.5 w-20 sm:w-[100px] justify-end shrink-0">
          <button
            onClick={() => togglePinNote(note.id)}
            className={`p-2 sm:p-1.5 rounded-lg hover:bg-[#3A3A3C] min-w-[44px] min-h-[44px] flex items-center justify-center ipad:min-w-0 ipad:min-h-0 ${note.pinned ? 'text-yellow-500' : 'text-[#8E8E93]'}`}
          >
            <Star set={note.pinned ? 'bold' : 'broken'} size={18} stroke="regular" />
          </button>
          
          <div className="relative">
            <button 
              onClick={() => setShowLabelPicker(!showLabelPicker)} 
              className="p-2 sm:p-1.5 rounded-lg hover:bg-[#3A3A3C] text-[#8E8E93] min-w-[44px] min-h-[44px] flex items-center justify-center ipad:min-w-0 ipad:min-h-0"
            >
              <Tag size={18} />
            </button>

            {showLabelPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLabelPicker(false)} />
                <div className="absolute right-0 top-full mt-2 bg-[#2C2C2E] rounded-2xl shadow-xl z-50 w-64 overflow-hidden border border-[#3A3A3C]">
                  {/* Labels Section */}
                  <div className="p-3">
                    <p className="text-[#8E8E93] text-[11px] uppercase tracking-wide mb-2 px-1">
                      Labels
                    </p>
                    <div className="bg-[#1C1C1E] rounded-xl overflow-hidden max-h-64 overflow-y-auto">
                      {labels.length > 0 ? (
                        labels.map((label, index) => (
                          <button
                            key={label.id}
                            onClick={() => {
                              if (note.labels.includes(label.id)) {
                                removeLabelFromNote(note.id, label.id)
                              } else {
                                addLabelToNote(note.id, label.id)
                              }
                            }}
                            className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] transition-colors ${
                              index < labels.length - 1 ? 'border-b border-[#3A3A3C]' : ''
                            }`}
                          >
                            <div
                              className="w-4 h-4 rounded-full shrink-0"
                              style={{ backgroundColor: LABEL_COLORS[label.color] }}
                            />
                            <span className="flex-1 text-left text-[15px] text-white">{label.name}</span>
                            {note.labels.includes(label.id) && (
                              <TickSquare set="bold" size={20} primaryColor="#0A84FF" />
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-6 text-center">
                          <Tag size={24} className="text-[#8E8E93] mx-auto mb-2" />
                          <p className="text-[#8E8E93] text-sm">No labels yet</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)} 
              className="p-2 sm:p-1.5 rounded-lg hover:bg-[#3A3A3C] text-[#8E8E93] min-w-[44px] min-h-[44px] flex items-center justify-center ipad:min-w-0 ipad:min-h-0"
            >
              <MoreSquare set="broken" size={18} stroke="regular" />
            </button>

            {showMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
                <div className="absolute right-0 top-full mt-2 bg-[#2C2C2E] rounded-2xl shadow-xl z-50 w-72 max-h-[80vh] overflow-y-auto border border-[#3A3A3C]">
                  {/* Page Actions Section */}
                  <div className="p-3 pb-2">
                    <p className="text-[#8E8E93] text-[11px] uppercase tracking-wide mb-2 px-1">
                      Page Actions
                    </p>
                    <div className="bg-[#1C1C1E] rounded-xl overflow-hidden">
                      {/* Add to Favorites */}
                      <button
                        onClick={() => { togglePinNote(note.id); setShowMenu(false) }}
                        className="w-full px-4 py-3 flex items-center gap-3 text-white hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]"
                      >
                        <Bookmark set="broken" size={20} stroke="regular" primaryColor="#8E8E93" />
                        <span className="text-[15px]">{note.pinned ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                      </button>

                      {/* Copy Page */}
                      <button
                        onClick={() => { duplicateNote(note.id); setShowMenu(false) }}
                        className="w-full px-4 py-3 flex items-center gap-3 text-white hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]"
                      >
                        <Copy size={20} className="text-[#8E8E93]" />
                        <span className="text-[15px]">Copy Page</span>
                      </button>

                      {/* Rotate Page */}
                      <button
                        onClick={() => { addToast({ message: 'Rotate coming soon' }); setShowMenu(false) }}
                        className="w-full px-4 py-3 flex items-center justify-between text-white hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]"
                      >
                        <div className="flex items-center gap-3">
                          <Swap set="broken" size={20} stroke="regular" primaryColor="#8E8E93" />
                          <span className="text-[15px]">Rotate Page</span>
                        </div>
                        <ChevronRight set="broken" size={18} stroke="regular" primaryColor="#8E8E93" />
                      </button>

                      {/* Add Page to Outline */}
                      <button
                        onClick={() => { addToast({ message: 'Outline coming soon' }); setShowMenu(false) }}
                        className="w-full px-4 py-3 flex items-center gap-3 text-white hover:bg-[#2A2A2C] transition-colors"
                      >
                        <ListTree size={20} className="text-[#8E8E93]" />
                        <span className="text-[15px]">Add Page to Outline</span>
                      </button>
                    </div>
                  </div>

                  {/* Danger Zone Section */}
                  <div className="px-3 pb-2">
                    <p className="text-[#8E8E93] text-[11px] uppercase tracking-wide mb-2 px-1">
                      Danger Zone
                    </p>
                    <div className="bg-[#1C1C1E] rounded-xl overflow-hidden">
                      {/* Clear Page */}
                      <button
                        onClick={() => { addToast({ message: 'Page cleared' }); setShowMenu(false) }}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]"
                      >
                        <Trash2 size={20} className="text-[#FF9500]" />
                        <span className="text-[15px] text-[#FF9500]">Clear Page</span>
                      </button>

                      {/* Move Page to Trash */}
                      <button
                        onClick={handleDelete}
                        className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] transition-colors"
                      >
                        <Delete set="broken" size={20} stroke="regular" primaryColor="#FF453A" />
                        <span className="text-[15px] text-[#FF453A]">Move Page to Trash</span>
                      </button>
                    </div>
                  </div>

                  {/* Settings Section */}
                  <div className="px-3 pb-3">
                    <p className="text-[#8E8E93] text-[11px] uppercase tracking-wide mb-2 px-1">
                      Settings
                    </p>
                    <div className="bg-[#1C1C1E] rounded-xl overflow-hidden">
                      {/* Add Lock */}
                      <button
                        onClick={() => { addToast({ message: 'Lock coming soon' }); setShowMenu(false) }}
                        className="w-full px-4 py-3 flex items-center gap-3 text-white hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]"
                      >
                        <Lock set="broken" size={20} stroke="regular" primaryColor="#8E8E93" />
                        <span className="text-[15px]">Add Lock</span>
                      </button>

                      {/* Show Resolved Comments */}
                      <button
                        onClick={() => { addToast({ message: 'Comments coming soon' }); setShowMenu(false) }}
                        className="w-full px-4 py-3 flex items-center gap-3 text-white hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]"
                      >
                        <Message set="broken" size={20} stroke="regular" primaryColor="#8E8E93" />
                        <span className="text-[15px] flex-1 text-left">Show Resolved Comments</span>
                        <div className="w-10 h-6 bg-[#3A3A3C] rounded-full relative flex-shrink-0">
                          <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow" />
                        </div>
                      </button>

                      {/* Scrolling Direction */}
                      <button
                        onClick={() => { addToast({ message: 'Scroll direction coming soon' }); setShowMenu(false) }}
                        className="w-full px-4 py-3 flex items-center gap-3 text-white hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]"
                      >
                        <MoveHorizontal size={20} className="text-[#8E8E93]" />
                        <span className="text-[15px] flex-1 text-left">Scrolling Direction</span>
                        <span className="text-[13px] text-[#8E8E93]">Vertical</span>
                      </button>

                      {/* Sidebar */}
                      <button
                        onClick={() => { addToast({ message: 'Sidebar coming soon' }); setShowMenu(false) }}
                        className="w-full px-4 py-3 flex items-center gap-3 text-white hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]"
                      >
                        <PanelLeft size={20} className="text-[#8E8E93]" />
                        <span className="text-[15px] flex-1 text-left">Sidebar</span>
                        <span className="text-[13px] text-[#8E8E93]">Left</span>
                      </button>

                      {/* Stylus & Palm Rejection */}
                      <button
                        onClick={() => { addToast({ message: 'Stylus settings coming soon' }); setShowMenu(false) }}
                        className="w-full px-4 py-3 flex items-center gap-3 text-white hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]"
                      >
                        <Edit set="broken" size={20} stroke="regular" primaryColor="#8E8E93" />
                        <span className="text-[15px]">Stylus & Palm Rejection</span>
                      </button>

                      {/* Task Editing */}
                      <button
                        onClick={() => { addToast({ message: 'Task editing coming soon' }); setShowMenu(false) }}
                        className="w-full px-4 py-3 flex items-center gap-3 text-white hover:bg-[#2A2A2C] transition-colors"
                      >
                        <SlidersHorizontal size={20} className="text-[#8E8E93]" />
                        <span className="text-[15px]">Task Editing</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

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
        ref={canvasRef}
        noteId={note.id}
        paperTemplate={paperTemplate}
        paperColor={paperColor}
        onPaperTemplateChange={(template) => {
          setPaperTemplate(template)
          updateNote(note.id, { paperTemplate: template })
        }}
        onPaperColorChange={(color) => {
          setPaperColor(color)
          updateNote(note.id, { paperColor: color })
        }}
      />
    </motion.div>
  )
}

function FolderPicker({ currentFolderId, folders, onSelect, onClose }) {
  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-[#2C2C2E] w-full max-w-sm rounded-2xl pointer-events-auto border border-[#3A3A3C] overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#3A3A3C]">
            <h3 className="text-[17px] font-semibold text-white">Move to Folder</h3>
            <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#3A3A3C] text-[#8E8E93]">
              <CloseSquare set="broken" size={20} stroke="regular" />
            </button>
          </div>
          
          {/* Folders List */}
          <div className="p-3">
            <div className="bg-[#1C1C1E] rounded-xl overflow-hidden max-h-80 overflow-y-auto">
              {/* No Folder Option */}
              <button
                onClick={() => onSelect(null)}
                className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] transition-colors border-b border-[#3A3A3C]"
              >
                <span className="text-xl">📄</span>
                <span className="flex-1 text-left text-[15px] text-white">No Folder</span>
                {!currentFolderId && <TickSquare set="bold" size={20} primaryColor="#0A84FF" />}
              </button>
              
              {/* Folder Options */}
              {folders.map((folder, index) => (
                <button
                  key={folder.id}
                  onClick={() => onSelect(folder.id)}
                  className={`w-full px-4 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] transition-colors ${
                    index < folders.length - 1 ? 'border-b border-[#3A3A3C]' : ''
                  }`}
                >
                  <div 
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-lg"
                    style={{ background: folder.gradient || folder.color }}
                  >
                    {folder.icon || '📁'}
                  </div>
                  <span className="flex-1 text-left text-[15px] text-white">{folder.name}</span>
                  {currentFolderId === folder.id && <TickSquare set="bold" size={20} primaryColor="#0A84FF" />}
                </button>
              ))}
              
              {/* Empty State */}
              {folders.length === 0 && (
                <div className="px-4 py-8 text-center">
                  <span className="text-2xl block mb-2">📁</span>
                  <p className="text-[#8E8E93] text-sm">No folders yet</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
