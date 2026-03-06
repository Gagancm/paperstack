import { useState } from 'react'
import { TickSquare } from 'react-iconly'
import { useAppStore } from '../../store/appStore'
import { FOLDER_COLORS } from '../notes/FolderCard'

const COLOR_OPTIONS = Object.keys(FOLDER_COLORS)

export default function NewFolderModal({ isOpen, onClose }) {
  const { createFolder, updateFolder } = useAppStore()
  
  const [name, setName] = useState('New Folder')
  const [selectedColor, setSelectedColor] = useState('blue')

  if (!isOpen) return null

  const handleCreate = () => {
    const folderId = createFolder(name || 'New Folder')
    
    updateFolder(folderId, {
      colorKey: selectedColor,
    })
    
    onClose()
    setName('New Folder')
    setSelectedColor('blue')
  }

  const colors = FOLDER_COLORS[selectedColor]

  return (
    <>
      <div className="fixed inset-0 bg-black/50 z-50" onClick={onClose} />
      
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div className="bg-[#2C2C2E] w-full max-w-sm rounded-xl pointer-events-auto max-h-[85vh] overflow-y-auto border border-[#3A3A3C]">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-[#3A3A3C]">
            <button onClick={onClose} className="text-[#0A84FF] text-[15px]">Cancel</button>
            <span className="text-white font-medium text-[15px]">New Folder</span>
            <button onClick={handleCreate} className="text-[#0A84FF] font-medium text-[15px]">Create</button>
          </div>

          {/* Preview */}
          <div className="flex justify-center py-5 border-b border-[#3A3A3C]">
            <div className="relative w-[80px] h-[68px]">
              <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] h-[5px] rounded-[50%] bg-black/25 blur-[2px]" />
              <div 
                className="absolute bottom-[3px] left-1/2 -translate-x-1/2 w-[95%] h-[52px] rounded-md"
                style={{ backgroundColor: colors.dark }}
              />
              <div 
                className="absolute top-0 left-[5px] w-[38%] h-[11px] rounded-t-md"
                style={{ backgroundColor: colors.main }}
              />
              <div 
                className="absolute bottom-[3px] left-1/2 -translate-x-1/2 w-[95%] h-[46px] rounded-md"
                style={{ 
                  background: `linear-gradient(180deg, ${colors.light} 0%, ${colors.main} 100%)`,
                }}
              >
                <div 
                  className="absolute top-0 left-0 right-0 h-[2px] rounded-t-md"
                  style={{ backgroundColor: colors.light, opacity: 0.8 }}
                />
              </div>
            </div>
          </div>

          {/* Name Input */}
          <div className="p-1.5">
            <p className="text-[11px] text-[#8E8E93] uppercase tracking-wide px-2 py-1.5">Folder Name</p>
            <div className="bg-[#1C1C1E] rounded-lg overflow-hidden">
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="New Folder"
                className="w-full bg-transparent text-white text-[15px] px-3 py-2.5 outline-none"
                autoFocus
              />
            </div>
          </div>

          {/* Color Selection */}
          <div className="px-1.5 pb-1.5">
            <p className="text-[11px] text-[#8E8E93] uppercase tracking-wide px-2 py-1.5">Folder Color</p>
            <div className="bg-[#1C1C1E] rounded-lg p-3">
              <div className="flex flex-wrap gap-2.5">
                {COLOR_OPTIONS.map((colorKey) => {
                  const color = FOLDER_COLORS[colorKey]
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
