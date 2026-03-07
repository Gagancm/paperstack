import { useState } from 'react'
import { TickSquare, ChevronDown, Document } from 'react-iconly'
import { Layout, FileText } from 'lucide-react'
import { useAppStore, DOCUMENT_TYPES } from '../../store/appStore'
import { NOTEBOOK_COLORS } from '../notes/NoteCard'

const COLOR_OPTIONS = Object.keys(NOTEBOOK_COLORS)

const DOCUMENT_TYPE_OPTIONS = [
  { 
    id: 'notebook', 
    label: 'Notebook', 
    icon: <Document set="broken" size={20} stroke="regular" />,
    description: 'Fixed pages with drawing + text'
  },
  { 
    id: 'whiteboard', 
    label: 'Whiteboard', 
    icon: <Layout size={20} strokeWidth={1.5} />,
    description: 'Infinite canvas for mind maps'
  },
  { 
    id: 'document', 
    label: 'Document', 
    icon: <FileText size={20} strokeWidth={1.5} />,
    description: 'Typing-focused text document'
  },
]

export default function NewNoteModal({ isOpen, onClose }) {
  const { createNote, updateNote, selectNote, folders, activeDocumentType } = useAppStore()
  
  const [name, setName] = useState('')
  const [selectedColor, setSelectedColor] = useState('blue')
  const [selectedFolder, setSelectedFolder] = useState(null)
  const [selectedType, setSelectedType] = useState(activeDocumentType || 'notebook')
  const [showFolderDropdown, setShowFolderDropdown] = useState(false)
  const [showTypeDropdown, setShowTypeDropdown] = useState(false)

  // Get default name based on type
  const getDefaultName = (type) => {
    const typeLabels = {
      notebook: 'Untitled Notebook',
      whiteboard: 'Untitled Whiteboard',
      document: 'Untitled Document',
    }
    return typeLabels[type] || 'Untitled'
  }

  if (!isOpen) return null

  const handleCreate = () => {
    const noteId = createNote(selectedType)
    
    updateNote(noteId, {
      title: name || getDefaultName(selectedType),
      colorKey: selectedColor,
      folderId: selectedFolder,
    })
    selectNote(noteId)
    onClose()
    setName('')
    setSelectedColor('blue')
    setSelectedFolder(null)
    setSelectedType(activeDocumentType || 'notebook')
  }

  const colors = NOTEBOOK_COLORS[selectedColor]
  const selectedFolderName = selectedFolder 
    ? folders.find(f => f.id === selectedFolder)?.name 
    : 'No Folder'
  const selectedTypeInfo = DOCUMENT_TYPE_OPTIONS.find(t => t.id === selectedType)

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-[#2C2C2E] w-full max-w-sm rounded-xl pointer-events-auto max-h-[90vh] overflow-y-auto border border-[#3A3A3C]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#3A3A3C]">
            <button onClick={onClose} className="text-[#0A84FF] text-[15px]">Cancel</button>
            <span className="text-white font-medium text-[15px]">New {selectedTypeInfo?.label || 'Note'}</span>
            <button onClick={handleCreate} className="text-[#0A84FF] font-medium text-[15px]">Create</button>
          </div>

          {/* Preview */}
          <div className="flex justify-center py-5 border-b border-[#3A3A3C]">
            {selectedType === 'notebook' ? (
              // Notebook preview
              <div className="relative w-[70px] h-[90px]">
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[80%] h-[5px] rounded-[50%] bg-black/30 blur-[2px]" />
                <div 
                  className="absolute bottom-[3px] left-0 right-0 h-[82px] rounded-lg overflow-hidden flex"
                  style={{ backgroundColor: colors.main }}
                >
                  <div 
                    className="w-[8px] h-full flex-shrink-0"
                    style={{ backgroundColor: colors.spine }}
                  />
                  <div 
                    className="w-[6px] h-full flex-shrink-0"
                    style={{ backgroundColor: colors.accent }}
                  />
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
            ) : selectedType === 'whiteboard' ? (
              // Whiteboard preview
              <div className="relative w-[90px] h-[70px]">
                <div 
                  className="absolute inset-0 rounded-lg border-2 border-dashed flex items-center justify-center"
                  style={{ borderColor: colors.main, backgroundColor: `${colors.main}15` }}
                >
                  <div className="flex flex-col items-center gap-1">
                    <Layout size={24} style={{ color: colors.main }} />
                    <span className="text-[10px]" style={{ color: colors.main }}>∞ Canvas</span>
                  </div>
                </div>
              </div>
            ) : (
              // Document preview
              <div className="relative w-[60px] h-[80px]">
                <div 
                  className="absolute inset-0 rounded-lg bg-white flex flex-col p-2"
                  style={{ boxShadow: '0 2px 8px rgba(0,0,0,0.2)' }}
                >
                  {/* Document lines */}
                  <div className="flex-1 flex flex-col gap-1.5">
                    <div className="h-2 rounded-sm" style={{ backgroundColor: colors.main, width: '70%' }} />
                    <div className="h-1 bg-gray-200 rounded-sm w-full" />
                    <div className="h-1 bg-gray-200 rounded-sm w-full" />
                    <div className="h-1 bg-gray-200 rounded-sm w-4/5" />
                    <div className="h-1 bg-gray-200 rounded-sm w-full" />
                    <div className="h-1 bg-gray-200 rounded-sm w-3/4" />
                  </div>
                </div>
                {/* Color strip on left */}
                <div 
                  className="absolute left-0 top-0 bottom-0 w-1 rounded-l-lg"
                  style={{ backgroundColor: colors.main }}
                />
              </div>
            )}
          </div>

          {/* Document Type Selection */}
          <div className="p-1.5">
            <p className="text-[11px] text-[#8E8E93] uppercase tracking-wide px-2 py-1.5">Type</p>
            <div className="bg-[#1C1C1E] rounded-lg overflow-hidden relative">
              <button
                onClick={() => setShowTypeDropdown(!showTypeDropdown)}
                className="w-full px-3 py-2.5 flex items-center justify-between text-white hover:bg-[#2A2A2C]"
              >
                <div className="flex items-center gap-3">
                  <span className="text-[#8E8E93]">{selectedTypeInfo?.icon}</span>
                  <span className="text-[15px]">{selectedTypeInfo?.label}</span>
                </div>
                <ChevronDown 
                  set="broken" 
                  size={16} 
                  stroke="regular" 
                  primaryColor="#8E8E93" 
                  className={`transition-transform ${showTypeDropdown ? 'rotate-180' : ''}`}
                />
              </button>
              
              {showTypeDropdown && (
                <div className="border-t border-[#3A3A3C]">
                  {DOCUMENT_TYPE_OPTIONS.map((type, index) => (
                    <button
                      key={type.id}
                      onClick={() => { setSelectedType(type.id); setShowTypeDropdown(false) }}
                      className={`w-full px-3 py-3 flex items-center gap-3 hover:bg-[#2A2A2C] ${
                        index < DOCUMENT_TYPE_OPTIONS.length - 1 ? 'border-b border-[#3A3A3C]' : ''
                      } ${selectedType === type.id ? 'text-[#0A84FF]' : 'text-white'}`}
                    >
                      <span className={selectedType === type.id ? 'text-[#0A84FF]' : 'text-[#8E8E93]'}>
                        {type.icon}
                      </span>
                      <div className="flex-1 text-left">
                        <span className="text-[15px] block">{type.label}</span>
                        <span className="text-[12px] text-[#8E8E93]">{type.description}</span>
                      </div>
                      {selectedType === type.id && <div className="w-2 h-2 rounded-full bg-[#0A84FF]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Name Input */}
          <div className="px-1.5">
            <p className="text-[11px] text-[#8E8E93] uppercase tracking-wide px-2 py-1.5">Name</p>
            <div className="bg-[#1C1C1E] rounded-lg overflow-hidden">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={getDefaultName(selectedType)}
                className="w-full bg-transparent text-white text-[15px] px-3 py-2.5 outline-none placeholder-[#8E8E93]"
                autoFocus
              />
            </div>
          </div>

          {/* Folder Selection */}
          <div className="px-1.5">
            <p className="text-[11px] text-[#8E8E93] uppercase tracking-wide px-2 py-1.5">Folder</p>
            <div className="bg-[#1C1C1E] rounded-lg overflow-hidden relative">
              <button
                onClick={() => setShowFolderDropdown(!showFolderDropdown)}
                className="w-full px-3 py-2.5 flex items-center justify-between text-white hover:bg-[#2A2A2C]"
              >
                <span className="text-[15px]">{selectedFolderName}</span>
                <ChevronDown 
                  set="broken" 
                  size={16} 
                  stroke="regular" 
                  primaryColor="#8E8E93" 
                  className={`transition-transform ${showFolderDropdown ? 'rotate-180' : ''}`}
                />
              </button>
              
              {showFolderDropdown && (
                <div className="border-t border-[#3A3A3C]">
                  <button
                    onClick={() => { setSelectedFolder(null); setShowFolderDropdown(false) }}
                    className={`w-full px-3 py-2.5 flex items-center gap-3 hover:bg-[#2A2A2C] border-b border-[#3A3A3C] ${
                      !selectedFolder ? 'text-[#0A84FF]' : 'text-white'
                    }`}
                  >
                    <span className="text-[15px]">No Folder</span>
                    {!selectedFolder && <div className="ml-auto w-2 h-2 rounded-full bg-[#0A84FF]" />}
                  </button>
                  {folders.map((folder, index) => (
                    <button
                      key={folder.id}
                      onClick={() => { setSelectedFolder(folder.id); setShowFolderDropdown(false) }}
                      className={`w-full px-3 py-2.5 flex items-center gap-3 hover:bg-[#2A2A2C] ${
                        index < folders.length - 1 ? 'border-b border-[#3A3A3C]' : ''
                      } ${selectedFolder === folder.id ? 'text-[#0A84FF]' : 'text-white'}`}
                    >
                      <span className="text-[15px]">{folder.name}</span>
                      {selectedFolder === folder.id && <div className="ml-auto w-2 h-2 rounded-full bg-[#0A84FF]" />}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Color Selection */}
          <div className="px-1.5 pb-1.5">
            <p className="text-[11px] text-[#8E8E93] uppercase tracking-wide px-2 py-1.5">Cover Color</p>
            <div className="bg-[#1C1C1E] rounded-lg p-3">
              <div className="flex flex-wrap gap-2.5">
                {COLOR_OPTIONS.map((colorKey) => {
                  const color = NOTEBOOK_COLORS[colorKey]
                  return (
                    <button
                      key={colorKey}
                      onClick={() => setSelectedColor(colorKey)}
                      className={`w-9 h-9 rounded-full transition-all ${
                        selectedColor === colorKey ? 'ring-2 ring-[#0A84FF] scale-110' : ''
                      }`}
                      style={{ backgroundColor: color.main }}
                    >
                      {selectedColor === colorKey && (
                        <div className="w-full h-full flex items-center justify-center text-white">
                          <TickSquare set="bold" size={16} />
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
