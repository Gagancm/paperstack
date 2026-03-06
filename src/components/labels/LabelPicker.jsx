import { useState } from 'react'
import { Plus, Check, X } from 'lucide-react'
import { useAppStore, LABEL_COLORS } from '../../store/appStore'

export default function LabelPicker({ noteId, selectedLabels, onClose }) {
  const { labels, addLabelToNote, removeLabelFromNote, createLabel } = useAppStore()
  const [showCreate, setShowCreate] = useState(false)
  const [newLabelName, setNewLabelName] = useState('')
  const [newLabelColor, setNewLabelColor] = useState('blue')

  const handleToggleLabel = (labelId) => {
    if (selectedLabels.includes(labelId)) {
      removeLabelFromNote(noteId, labelId)
    } else {
      addLabelToNote(noteId, labelId)
    }
  }

  const handleCreateLabel = () => {
    if (!newLabelName.trim()) return
    const id = createLabel(newLabelName.trim(), newLabelColor)
    addLabelToNote(noteId, id)
    setNewLabelName('')
    setShowCreate(false)
  }

  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onClose} />
      
      <div className="absolute right-4 top-0 z-50 w-64 bg-[#2C2C2E] rounded-lg shadow-xl border border-[#3A3A3C]">
        <div className="p-3 border-b border-[#3A3A3C] flex items-center justify-between">
          <span className="font-medium text-white">Labels</span>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-[#3A3A3C]">
            <X size={18} className="text-[#8E8E93]" />
          </button>
        </div>

        <div className="max-h-64 overflow-y-auto">
          {labels.map((label) => (
            <button
              key={label.id}
              onClick={() => handleToggleLabel(label.id)}
              className="w-full px-4 py-3 flex items-center gap-3 hover:bg-[#3A3A3C]"
            >
              <div
                className="w-4 h-4 rounded-full shrink-0"
                style={{ backgroundColor: LABEL_COLORS[label.color] }}
              />
              <span className="flex-1 text-left text-white">{label.name}</span>
              {selectedLabels.includes(label.id) && (
                <Check size={18} className="text-[#0A84FF]" />
              )}
            </button>
          ))}
        </div>

        {showCreate ? (
          <div className="p-3 border-t border-[#3A3A3C]">
            <input
              type="text"
              value={newLabelName}
              onChange={(e) => setNewLabelName(e.target.value)}
              placeholder="Label name"
              className="w-full bg-[#1C1C1E] text-white px-3 py-2 rounded-lg mb-3 outline-none focus:ring-2 focus:ring-[#0A84FF]"
              maxLength={30}
              autoFocus
              onKeyDown={(e) => e.key === 'Enter' && handleCreateLabel()}
            />
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              {Object.entries(LABEL_COLORS).map(([name, hex]) => (
                <button
                  key={name}
                  onClick={() => setNewLabelColor(name)}
                  className={`w-6 h-6 rounded-full transition-transform ${
                    newLabelColor === name ? 'ring-2 ring-[#0A84FF] scale-110' : ''
                  }`}
                  style={{ backgroundColor: hex }}
                />
              ))}
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => setShowCreate(false)}
                className="flex-1 py-2 rounded-lg bg-[#3A3A3C] text-white text-sm hover:bg-[#48484A]"
              >
                Cancel
              </button>
              <button
                onClick={handleCreateLabel}
                disabled={!newLabelName.trim()}
                className="flex-1 py-2 rounded-lg bg-[#0A84FF] text-white text-sm disabled:opacity-50"
              >
                Create
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => setShowCreate(true)}
            className="w-full px-4 py-3 flex items-center gap-3 text-[#0A84FF] border-t border-[#3A3A3C] hover:bg-[#3A3A3C]"
          >
            <Plus size={18} />
            <span>Create new label</span>
          </button>
        )}
      </div>
    </>
  )
}
