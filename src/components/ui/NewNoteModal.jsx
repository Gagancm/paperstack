import { useState } from 'react'
import { Check, Plus, X } from 'lucide-react'
import { useAppStore, LABEL_COLORS } from '../../store/appStore'

const COVER_DESIGNS = [
  { id: 'coral-geometric', name: 'Coral', color: '#E8A5A5' },
  { id: 'blue-waves', name: 'Ocean', color: '#5B9BD5' },
  { id: 'purple-blocks', name: 'Violet', color: '#9B7ED9' },
  { id: 'green-layers', name: 'Forest', color: '#58D68D' },
  { id: 'orange-sunset', name: 'Sunset', color: '#F5A962' },
  { id: 'pink-abstract', name: 'Blossom', color: '#F1948A' },
  { id: 'teal-minimal', name: 'Teal', color: '#48C9B0' },
  { id: 'yellow-bright', name: 'Sunny', color: '#F4D03F' },
]

export default function NewNoteModal({ isOpen, onClose }) {
  const { createNote, updateNote, selectNote, labels, createLabel, folders } = useAppStore()
  
  const [name, setName] = useState('Untitled Notebook')
  const [selectedCover, setSelectedCover] = useState(0)
  const [selectedFolder, setSelectedFolder] = useState(null)

  if (!isOpen) return null

  const handleCreate = () => {
    const noteId = createNote()
    const cover = COVER_DESIGNS[selectedCover]
    
    updateNote(noteId, {
      title: name || 'Untitled Notebook',
      coverColor: cover?.color,
      coverDesignId: cover?.id,
      folderId: selectedFolder,
    })
    selectNote(noteId)
    onClose()
    setName('Untitled Notebook')
    setSelectedCover(0)
    setSelectedFolder(null)
  }

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

            {/* Cover */}
            <div>
              <label className="text-[#8E8E93] text-xs uppercase tracking-wide mb-3 block">Cover Design</label>
              <div className="grid grid-cols-4 gap-3">
                {COVER_DESIGNS.map((cover, index) => (
                  <button
                    key={cover.id}
                    onClick={() => setSelectedCover(index)}
                    className={`aspect-[3/4] rounded-xl transition-all ${
                      selectedCover === index ? 'ring-2 ring-[#0A84FF] scale-105' : ''
                    }`}
                    style={{ backgroundColor: cover.color }}
                  >
                    {selectedCover === index && (
                      <div className="w-full h-full flex items-center justify-center">
                        <div className="w-6 h-6 bg-white rounded-full flex items-center justify-center">
                          <Check size={14} className="text-[#0A84FF]" />
                        </div>
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}
