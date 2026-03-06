import { useState } from 'react'
import { Check } from 'lucide-react'
import { useAppStore } from '../../store/appStore'

const FOLDER_COLORS = [
  { id: 'lavender', color: '#d4c4e0', gradient: 'linear-gradient(135deg, #d4c4e0 0%, #c4b3d1 100%)' },
  { id: 'periwinkle', color: '#c5cde8', gradient: 'linear-gradient(135deg, #c5cde8 0%, #b3bcd9 100%)' },
  { id: 'sky', color: '#b8d4e3', gradient: 'linear-gradient(135deg, #b8d4e3 0%, #a5c5d6 100%)' },
  { id: 'mint', color: '#b8dcd0', gradient: 'linear-gradient(135deg, #b8dcd0 0%, #a5cdbf 100%)' },
  { id: 'sage', color: '#c5d9c0', gradient: 'linear-gradient(135deg, #c5d9c0 0%, #b5cab0 100%)' },
  { id: 'cream', color: '#e8dcc8', gradient: 'linear-gradient(135deg, #e8dcc8 0%, #dbcdb8 100%)' },
  { id: 'peach', color: '#e8d0c0', gradient: 'linear-gradient(135deg, #e8d0c0 0%, #dbc0ae 100%)' },
  { id: 'rose', color: '#e0c4c8', gradient: 'linear-gradient(135deg, #e0c4c8 0%, #d3b4b9 100%)' },
]

const FOLDER_ICONS = [
  { id: 'default', icon: null },
  { id: 'star', icon: '⭐' },
  { id: 'heart', icon: '❤️' },
  { id: 'book', icon: '📚' },
  { id: 'work', icon: '💼' },
  { id: 'school', icon: '🎓' },
  { id: 'code', icon: '💻' },
  { id: 'music', icon: '🎵' },
]

export default function NewFolderModal({ isOpen, onClose }) {
  const { createFolder, updateFolder } = useAppStore()
  
  const [name, setName] = useState('New Folder')
  const [selectedColor, setSelectedColor] = useState(0)
  const [selectedIcon, setSelectedIcon] = useState(0)

  if (!isOpen) return null

  const handleCreate = () => {
    const folderId = createFolder(name || 'New Folder')
    const color = FOLDER_COLORS[selectedColor]
    const icon = FOLDER_ICONS[selectedIcon]
    
    updateFolder(folderId, {
      color: color?.color,
      gradient: color?.gradient,
      icon: icon?.icon,
    })
    
    onClose()
    setName('New Folder')
    setSelectedColor(0)
    setSelectedIcon(0)
  }

  const currentColor = FOLDER_COLORS[selectedColor]
  const currentIcon = FOLDER_ICONS[selectedIcon]

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
            {/* Preview */}
            <div className="flex justify-center mb-6">
              <div className="flex flex-col items-center gap-2">
                <div className="relative w-20 h-16">
                  <div 
                    className="absolute bottom-0 left-1/2 -translate-x-1/2 w-full h-[80%] rounded-xl"
                    style={{ background: currentColor?.gradient }}
                  >
                    <div 
                      className="absolute -top-2 left-2 w-[40%] h-3 rounded-t-lg"
                      style={{ background: currentColor?.gradient, filter: 'brightness(1.1)' }}
                    />
                    {currentIcon?.icon && (
                      <div className="absolute inset-0 flex items-center justify-center text-xl mt-1">
                        {currentIcon.icon}
                      </div>
                    )}
                  </div>
                </div>
                <span className="text-white font-medium text-sm">{name || 'New Folder'}</span>
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
            <div className="mb-5">
              <label className="text-[#8E8E93] text-xs uppercase tracking-wide mb-3 block">Color</label>
              <div className="flex flex-wrap gap-3">
                {FOLDER_COLORS.map((color, index) => (
                  <button
                    key={color.id}
                    onClick={() => setSelectedColor(index)}
                    className={`w-9 h-9 rounded-full transition-all ${
                      selectedColor === index ? 'ring-2 ring-[#0A84FF] scale-110' : ''
                    }`}
                    style={{ background: color.gradient }}
                  />
                ))}
              </div>
            </div>

            {/* Icon */}
            <div>
              <label className="text-[#8E8E93] text-xs uppercase tracking-wide mb-3 block">Icon (Optional)</label>
              <div className="flex flex-wrap gap-2">
                {FOLDER_ICONS.map((icon, index) => (
                  <button
                    key={icon.id}
                    onClick={() => setSelectedIcon(index)}
                    className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl transition-all ${
                      selectedIcon === index 
                        ? 'bg-[#0A84FF] text-white' 
                        : 'bg-[#3A3A3C] text-white'
                    }`}
                  >
                    {icon.icon || '📁'}
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
