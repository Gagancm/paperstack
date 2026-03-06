import { useState } from 'react'
import { Plus, TickSquare, CloseSquare } from 'react-iconly'
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
      
      <div className="absolute right-4 top-0 z-50 w-64 bg-[#2C2C2E] rounded-xl shadow-xl border border-[#3A3A3C] overflow-hidden">
        {/* Header */}
        <div className="py-2 text-center border-b border-[#3A3A3C]">
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
                    onClick={() => handleToggleLabel(label.id)}
                    className={`w-full px-3 py-2.5 flex items-center gap-3 hover:bg-[#2A2A2C] ${
                      index < labels.length - 1 ? 'border-b border-[#3A3A3C]' : ''
                    }`}
                  >
                    <div
                      className="w-4 h-4 rounded-full shrink-0"
                      style={{ backgroundColor: LABEL_COLORS[label.color] }}
                    />
                    <span className="flex-1 text-left text-[15px] text-white">{label.name}</span>
                    {selectedLabels.includes(label.id) && (
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

        {/* Create Section */}
        <div className="px-1.5 pb-1.5">
          {showCreate ? (
            <div className="bg-[#1C1C1E] rounded-lg p-3">
              <input
                type="text"
                value={newLabelName}
                onChange={(e) => setNewLabelName(e.target.value)}
                placeholder="Label name"
                className="w-full bg-[#2C2C2E] text-white text-[15px] px-3 py-2 rounded-lg mb-3 outline-none focus:ring-1 focus:ring-[#0A84FF]"
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
                  className="flex-1 py-2 rounded-lg bg-[#3A3A3C] text-white text-[13px] hover:bg-[#48484A]"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateLabel}
                  disabled={!newLabelName.trim()}
                  className="flex-1 py-2 rounded-lg bg-[#0A84FF] text-white text-[13px] disabled:opacity-50"
                >
                  Create
                </button>
              </div>
            </div>
          ) : (
            <div className="bg-[#1C1C1E] rounded-lg overflow-hidden">
              <button
                onClick={() => setShowCreate(true)}
                className="w-full px-3 py-2.5 flex items-center gap-3 text-[#0A84FF] hover:bg-[#2A2A2C]"
              >
                <Plus set="broken" size={18} stroke="regular" />
                <span className="text-[15px]">Create new label</span>
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  )
}
