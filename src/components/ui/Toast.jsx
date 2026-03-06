import { X } from 'lucide-react'

export default function Toast({ message, action, onClose }) {
  return (
    <div className="bg-[#2C2C2E] rounded-xl px-4 py-3 flex items-center gap-3 min-w-[280px] shadow-xl border border-[#3A3A3C]">
      <span className="flex-1 text-white">{message}</span>
      {action && (
        <button
          onClick={() => {
            action.onClick()
            onClose()
          }}
          className="text-[#0A84FF] font-medium hover:opacity-80 transition-colors"
        >
          {action.label}
        </button>
      )}
      <button
        onClick={onClose}
        className="p-1 hover:bg-[#3A3A3C] rounded-lg transition-colors"
      >
        <X size={16} className="text-[#8E8E93]" />
      </button>
    </div>
  )
}
