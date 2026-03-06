import { useState } from 'react'
import { TickSquare } from 'react-iconly'
import { useAppStore } from '../../store/appStore'
import { NOTEBOOK_COLORS } from '../notes/NoteCard'

const COLOR_OPTIONS = Object.keys(NOTEBOOK_COLORS)

export default function NewNoteModal({ isOpen, onClose }) {
  const { createNote, updateNote, selectNote, folders } = useAppStore()
  
  const [name, setName] = useState('Untitled Notebook')
  const [selectedColor, setSelectedColor] = useState('blue')
  const [selectedFolder, setSelectedFolder] = useState(null)

  if (!isOpen) return null

  const handleCreate = () => {
    const noteId = createNote()
    
    updateNote(noteId, {
      title: name || 'Untitled Notebook',
      colorKey: selectedColor,
      folderId: selectedFolder,
    })
    selectNote(noteId)
    onClose()
    setName('Untitled Notebook')
    setSelectedColor('blue')
    setSelectedFolder(null)
  }

  const colors = NOTEBOOK_COLORS[selectedColor]

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-[#2C2C2E] w-full max-w-md rounded-2xl pointer-events-auto max-h-[90vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#3A3A3C]">
            <button onClick={onClose} className="text-[#0A84FF] font-medium">Cancel</button>
            <h2 className="text-lg font-semibold text-white">New Notebook</h2>
            <button onClick={handleCreate} className="text-[#0A84FF] font-semibold">Create</button>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Preview - taller notebook style */}
            <div className="flex justify-center mb-6">
              <div className="relative w-[70px] h-[90px]">
                {/* Shadow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[5px] rounded-[50%] bg-black/30 blur-[2px]" />
                
                {/* Notebook body */}
                <div 
                  className="absolute bottom-[3px] left-0 right-0 h-[82px] rounded-lg overflow-hidden flex"
                  style={{ backgroundColor: colors.main }}
                >
                  {/* Spine */}
                  <div 
                    className="w-[8px] h-full flex-shrink-0"
                    style={{ backgroundColor: colors.spine }}
                  />
                  
                  {/* Inner accent */}
                  <div 
                    className="w-[6px] h-full flex-shrink-0"
                    style={{ backgroundColor: colors.accent }}
                  />
                  
                  {/* Cover */}
                  <div 
                    className="flex-1 h-full relative"
                    style={{ 
                      background: `linear-gradient(145deg, ${colors.cover} 0%, ${colors.main} 60%, ${colors.spine} 100%)`,
                    }}
                  >
                    <div 
                      className="absolute inset-0"
                      style={{
                        background: 'linear-gradient(135deg, rgba(255,255,255,0.2) 0%, rgba(255,255,255,0) 40%, rgba(0,0,0,0.1) 100%)',
                      }}
                    />
                  </div>
                </div>
              </div>
            </div>

            {/* Name */}
            <div className="mb-5">
              <label className="text-[#8E8E93] text-xs uppercase tracking-wide mb-2 block">Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Untitled Notebook"
                className="w-full bg-[#1C1C1E] text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#0A84FF]"
              />
            </div>

            {/* Folder */}
            <div className="mb-5">
              <label className="text-[#8E8E93] text-xs uppercase tracking-wide mb-2 block">Folder</label>
              <select
                value={selectedFolder || ''}
                onChange={(e) => setSelectedFolder(e.target.value || null)}
                className="w-full bg-[#1C1C1E] text-white px-4 py-3 rounded-xl outline-none appearance-none"
              >
                <option value="">No Folder</option>
                {folders.map((folder) => (
                  <option key={folder.id} value={folder.id}>{folder.name}</option>
                ))}
              </select>
            </div>

            {/* Color */}
            <div>
              <label className="text-[#8E8E93] text-xs uppercase tracking-wide mb-3 block">Cover Color</label>
              <div className="flex flex-wrap gap-3">
                {COLOR_OPTIONS.map((colorKey) => {
                  const color = NOTEBOOK_COLORS[colorKey]
                  return (
                    <button
                      key={colorKey}
                      onClick={() => setSelectedColor(colorKey)}
                      className={`w-10 h-10 rounded-full transition-all ${
                        selectedColor === colorKey ? 'ring-2 ring-white ring-offset-2 ring-offset-[#2C2C2E] scale-110' : ''
                      }`}
                      style={{ backgroundColor: color.main }}
                    >
                      {selectedColor === colorKey && (
                        <div className="w-full h-full flex items-center justify-center text-white">
                          <TickSquare set="bold" size={18} />
                        </div>
                      )}
                    </button>
                  )
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
