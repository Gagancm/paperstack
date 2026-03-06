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
        <div className="bg-[#2C2C2E] w-full max-w-sm rounded-2xl pointer-events-auto max-h-[85vh] overflow-y-auto">
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#3A3A3C]">
            <button onClick={onClose} className="text-[#0A84FF] font-medium">Cancel</button>
            <h2 className="text-lg font-semibold text-white">New Folder</h2>
            <button onClick={handleCreate} className="text-[#0A84FF] font-semibold">Create</button>
          </div>

          {/* Content */}
          <div className="p-5">
            {/* Preview - square macOS folder */}
            <div className="flex justify-center mb-6">
              <div className="relative w-[80px] h-[68px]">
                {/* Shadow */}
                <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[85%] h-[5px] rounded-[50%] bg-black/25 blur-[2px]" />
                
                {/* Back of folder */}
                <div 
                  className="absolute bottom-[3px] left-1/2 -translate-x-1/2 w-[95%] h-[52px] rounded-md"
                  style={{ backgroundColor: colors.dark }}
                />
                
                {/* Folder tab */}
                <div 
                  className="absolute top-0 left-[5px] w-[38%] h-[11px] rounded-t-md"
                  style={{ backgroundColor: colors.main }}
                />
                
                {/* Front of folder */}
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

            {/* Name */}
            <div className="mb-5">
              <label className="text-[#8E8E93] text-xs uppercase tracking-wide mb-2 block">Folder Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="New Folder"
                className="w-full bg-[#1C1C1E] text-white px-4 py-3 rounded-xl outline-none focus:ring-2 focus:ring-[#0A84FF]"
                autoFocus
              />
            </div>

            {/* Color */}
            <div>
              <label className="text-[#8E8E93] text-xs uppercase tracking-wide mb-3 block">Folder Color</label>
              <div className="flex flex-wrap gap-3">
                {COLOR_OPTIONS.map((colorKey) => {
                  const color = FOLDER_COLORS[colorKey]
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
