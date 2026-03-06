import { useState, useEffect, useRef } from 'react'
import { ChevronLeft, Star, Delete, CloseSquare, TickSquare, MoreSquare, ChevronRight, Bookmark, Send, Swap, Lock, Message, Setting, Edit } from 'react-iconly'
import { Tag, Copy, Settings, ListTree, Trash2, PanelLeft, MoveHorizontal, SlidersHorizontal, RotateCcw } from 'lucide-react'
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
  const [showPageSettings, setShowPageSettings] = useState(false)
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
          
          <div className="relative">
            <button 
              onClick={() => setShowLabelPicker(!showLabelPicker)} 
              className="p-1.5 rounded-lg hover:bg-[#3A3A3C] text-[#8E8E93]"
            >
              <Tag size={18} />
            </button>

            {showLabelPicker && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowLabelPicker(false)} />
                <div className="absolute right-0 top-full mt-1 bg-[#2C2C2E] rounded-xl shadow-xl z-50 w-64 max-h-[80vh] overflow-y-auto border border-[#3A3A3C]">
                  {/* Header */}
                  <div className="py-2 text-center border-b border-[#3A3A3C] sticky top-0 bg-[#2C2C2E] rounded-t-xl">
                    <span className="text-white font-medium text-[15px]">Labels</span>
                  </div>

                  {/* Labels List */}
                  <div className="p-1.5">
                    <div className="bg-[#1C1C1E] rounded-lg overflow-hidden">
                      {labels.length > 0 ? (
                        <div className="max-h-64 overflow-y-auto">
                          {labels.map((label, index) => (
                            <button
                              key={label.id}
                              onClick={() => {
                                if (note.labels.includes(label.id)) {
                                  removeLabelFromNote(note.id, label.id)
                                } else {
                                  addLabelToNote(note.id, label.id)
                                }
                              }}
                              className={`w-full px-3 py-2.5 flex items-center gap-3 hover:bg-[#2A2A2C] ${
                                index < labels.length - 1 ? 'border-b border-[#3A3A3C]' : ''
                              }`}
                            >
                              <div
                                className="w-4 h-4 rounded-full shrink-0"
                                style={{ backgroundColor: LABEL_COLORS[label.color] }}
                              />
                              <span className="flex-1 text-left text-[15px] text-white">{label.name}</span>
                              {note.labels.includes(label.id) && (
                                <TickSquare set="broken" size={18} stroke="regular" primaryColor="#0A84FF" />
                              )}
                            </button>
                          ))}
                        </div>
                      ) : (
                        <div className="px-3 py-4 text-center text-[13px] text-[#8E8E93]">
                          No labels yet
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
              onClick={() => setShowPageSettings(!showPageSettings)} 
              className={`p-1.5 rounded-lg hover:bg-[#3A3A3C] ${showPageSettings ? 'text-[#0A84FF]' : 'text-[#8E8E93]'}`}
            >
              <Settings size={18} />
            </button>

            {showPageSettings && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowPageSettings(false)} />
                <div className="absolute right-0 top-full mt-1 bg-[#2C2C2E] rounded-xl shadow-xl z-50 w-64 max-h-[80vh] overflow-y-auto border border-[#3A3A3C]">
                  {/* Header */}
                  <div className="py-2 text-center border-b border-[#3A3A3C] sticky top-0 bg-[#2C2C2E] rounded-t-xl">
                    <span className="text-white font-medium text-[15px]">Page Settings</span>
                  </div>

                  {/* Template Section */}
                  <div className="p-1.5">
                    <p className="text-[11px] text-[#8E8E93] uppercase tracking-wide px-2 py-1.5">Template</p>
                    <div className="bg-[#1C1C1E] rounded-lg overflow-hidden">
                      {PAPER_TEMPLATES.map((template, index) => (
                        <button
                          key={template.id}
                          onClick={() => {
                            setPaperTemplate(template.id)
                            updateNote(note.id, { paperTemplate: template.id })
                          }}
                          className={`w-full px-3 py-2.5 flex items-center gap-3 hover:bg-[#2A2A2C] ${
                            index < PAPER_TEMPLATES.length - 1 ? 'border-b border-[#3A3A3C]' : ''
                          }`}
                        >
                          <span className={`text-[15px] flex-1 text-left ${
                            paperTemplate === template.id ? 'text-[#0A84FF]' : 'text-white'
                          }`}>
                            {template.name}
                          </span>
                          {paperTemplate === template.id && (
                            <div className="w-2 h-2 rounded-full bg-[#0A84FF]" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Paper Color Section */}
                  <div className="px-1.5 pb-1.5">
                    <p className="text-[11px] text-[#8E8E93] uppercase tracking-wide px-2 py-1.5">Paper Color</p>
                    <div className="bg-[#1C1C1E] rounded-lg p-3">
                      <div className="flex flex-wrap gap-2">
                        {PAPER_COLORS.map((color) => (
                          <button
                            key={color.hex}
                            onClick={() => {
                              setPaperColor(color.hex)
                              updateNote(note.id, { paperColor: color.hex })
                            }}
                            className={`w-7 h-7 rounded-full transition-transform ${
                              paperColor === color.hex ? 'ring-2 ring-[#0A84FF] scale-110' : ''
                            }`}
                            style={{ backgroundColor: color.hex, border: '1px solid #3A3A3C' }}
                            title={color.name}
                          />
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Clear Page */}
                  <div className="px-1.5 pb-1.5">
                    <div className="bg-[#1C1C1E] rounded-lg overflow-hidden">
                      <button
                        onClick={() => {
                          canvasRef.current?.clearCanvas?.()
                          setShowPageSettings(false)
                        }}
                        className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-[#2A2A2C]"
                      >
                        <RotateCcw size={18} className="text-[#FF453A]" />
                        <span className="text-[15px] text-[#FF453A]">Clear This Page</span>
                      </button>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

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
                <div className="absolute right-0 top-full mt-1 bg-[#2C2C2E] rounded-xl shadow-xl z-50 w-64 max-h-[80vh] overflow-y-auto border border-[#3A3A3C]">
                  {/* Header */}
                  <div className="py-2 text-center border-b border-[#3A3A3C] sticky top-0 bg-[#2C2C2E] rounded-t-xl">
                    <span className="text-white font-medium text-[15px]">More</span>
                  </div>

                  {/* Page Actions */}
                  <div className="p-1.5">
                    <div className="bg-[#1C1C1E] rounded-lg overflow-hidden">
                      {/* Add to Favorites */}
                      <button
                        onClick={() => { togglePinNote(note.id); setShowMenu(false) }}
                        className="w-full px-3 py-2.5 flex items-center gap-3 text-white hover:bg-[#2A2A2C] border-b border-[#3A3A3C]"
                      >
                        <Bookmark set="broken" size={18} stroke="regular" primaryColor="#8E8E93" />
                        <span className="text-[15px]">{note.pinned ? 'Remove from Favorites' : 'Add to Favorites'}</span>
                      </button>

                      {/* Copy Page */}
                      <button
                        onClick={() => { duplicateNote(note.id); setShowMenu(false) }}
                        className="w-full px-3 py-2.5 flex items-center gap-3 text-white hover:bg-[#2A2A2C] border-b border-[#3A3A3C]"
                      >
                        <Copy size={18} className="text-[#8E8E93]" />
                        <span className="text-[15px]">Copy Page</span>
                      </button>

                      {/* Rotate Page */}
                      <button
                        onClick={() => { addToast({ message: 'Rotate coming soon' }); setShowMenu(false) }}
                        className="w-full px-3 py-2.5 flex items-center justify-between text-white hover:bg-[#2A2A2C] border-b border-[#3A3A3C]"
                      >
                        <div className="flex items-center gap-3">
                          <Swap set="broken" size={18} stroke="regular" primaryColor="#8E8E93" />
                          <span className="text-[15px]">Rotate Page</span>
                        </div>
                        <ChevronRight set="broken" size={16} stroke="regular" primaryColor="#8E8E93" />
                      </button>

                      {/* Add Page to Outline */}
                      <button
                        onClick={() => { addToast({ message: 'Outline coming soon' }); setShowMenu(false) }}
                        className="w-full px-3 py-2.5 flex items-center gap-3 text-white hover:bg-[#2A2A2C] border-b border-[#3A3A3C]"
                      >
                        <ListTree size={18} className="text-[#8E8E93]" />
                        <span className="text-[15px]">Add Page to Outline</span>
                      </button>

                      {/* Change Template */}
                      <button
                        onClick={() => { setShowMenu(false); setShowPageSettings(true) }}
                        className="w-full px-3 py-2.5 flex items-center gap-3 text-white hover:bg-[#2A2A2C] border-b border-[#3A3A3C]"
                      >
                        <Setting set="broken" size={18} stroke="regular" primaryColor="#8E8E93" />
                        <span className="text-[15px]">Change Template</span>
                      </button>

                      {/* Go to Page */}
                      <button
                        onClick={() => { addToast({ message: 'Go to Page coming soon' }); setShowMenu(false) }}
                        className="w-full px-3 py-2.5 flex items-center justify-between text-white hover:bg-[#2A2A2C] border-b border-[#3A3A3C]"
                      >
                        <div className="flex items-center gap-3">
                          <Send set="broken" size={18} stroke="regular" primaryColor="#8E8E93" />
                          <span className="text-[15px]">Go to Page</span>
                        </div>
                        <span className="text-[13px] text-[#8E8E93]">(1 - 1)</span>
                      </button>

                      {/* Clear Page */}
                      <button
                        onClick={() => { addToast({ message: 'Page cleared' }); setShowMenu(false) }}
                        className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-[#2A2A2C] border-b border-[#3A3A3C]"
                      >
                        <Trash2 size={18} className="text-[#FF9500]" />
                        <span className="text-[15px] text-[#FF9500]">Clear Page</span>
                      </button>

                      {/* Move Page to Trash */}
                      <button
                        onClick={handleDelete}
                        className="w-full px-3 py-2.5 flex items-center gap-3 hover:bg-[#2A2A2C]"
                      >
                        <Delete set="broken" size={18} stroke="regular" primaryColor="#FF453A" />
                        <span className="text-[15px] text-[#FF453A]">Move Page to Trash</span>
                      </button>
                    </div>
                  </div>

                  {/* Settings Section */}
                  <div className="px-1.5 pb-1.5">
                    <p className="text-[11px] text-[#8E8E93] uppercase tracking-wide px-2 py-1.5">Settings</p>
                    <div className="bg-[#1C1C1E] rounded-lg overflow-hidden">
                      {/* Add Lock */}
                      <button
                        onClick={() => { addToast({ message: 'Lock coming soon' }); setShowMenu(false) }}
                        className="w-full px-3 py-2.5 flex items-center gap-3 text-white hover:bg-[#2A2A2C] border-b border-[#3A3A3C]"
                      >
                        <Lock set="broken" size={18} stroke="regular" primaryColor="#8E8E93" />
                        <span className="text-[15px]">Add Lock</span>
                      </button>

                      {/* Show Resolved Comments */}
                      <button
                        onClick={() => { addToast({ message: 'Comments coming soon' }); setShowMenu(false) }}
                        className="w-full px-3 py-2.5 flex items-center gap-3 text-white hover:bg-[#2A2A2C] border-b border-[#3A3A3C]"
                      >
                        <Message set="broken" size={18} stroke="regular" primaryColor="#8E8E93" />
                        <span className="text-[15px] flex-1 text-left">Show Resolved Comments</span>
                        <div className="w-10 h-6 bg-[#3A3A3C] rounded-full relative flex-shrink-0">
                          <div className="absolute left-0.5 top-0.5 w-5 h-5 bg-white rounded-full shadow" />
                        </div>
                      </button>

                      {/* Scrolling Direction */}
                      <button
                        onClick={() => { addToast({ message: 'Scroll direction coming soon' }); setShowMenu(false) }}
                        className="w-full px-3 py-2.5 flex items-center gap-3 text-white hover:bg-[#2A2A2C] border-b border-[#3A3A3C]"
                      >
                        <MoveHorizontal size={18} className="text-[#8E8E93]" />
                        <span className="text-[15px] flex-1 text-left">Scrolling Direction</span>
                        <span className="text-[13px] text-[#8E8E93]">Vertical</span>
                      </button>

                      {/* Sidebar */}
                      <button
                        onClick={() => { addToast({ message: 'Sidebar coming soon' }); setShowMenu(false) }}
                        className="w-full px-3 py-2.5 flex items-center gap-3 text-white hover:bg-[#2A2A2C] border-b border-[#3A3A3C]"
                      >
                        <PanelLeft size={18} className="text-[#8E8E93]" />
                        <span className="text-[15px] flex-1 text-left">Sidebar</span>
                        <span className="text-[13px] text-[#8E8E93]">Left</span>
                      </button>

                      {/* Stylus & Palm Rejection */}
                      <button
                        onClick={() => { addToast({ message: 'Stylus settings coming soon' }); setShowMenu(false) }}
                        className="w-full px-3 py-2.5 flex items-center gap-3 text-white hover:bg-[#2A2A2C] border-b border-[#3A3A3C]"
                      >
                        <Edit set="broken" size={18} stroke="regular" primaryColor="#8E8E93" />
                        <span className="text-[15px]">Stylus & Palm Rejection</span>
                      </button>

                      {/* Document Editing */}
                      <button
                        onClick={() => { addToast({ message: 'Document editing coming soon' }); setShowMenu(false) }}
                        className="w-full px-3 py-2.5 flex items-center gap-3 text-white hover:bg-[#2A2A2C]"
                      >
                        <SlidersHorizontal size={18} className="text-[#8E8E93]" />
                        <span className="text-[15px]">Document Editing</span>
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
