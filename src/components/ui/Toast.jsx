import { useState, useEffect } from 'react'
import { X, CheckCircle, AlertCircle, Info, Trash2 } from 'lucide-react'

// Get icon based on toast type
const ToastIcon = ({ type }) => {
  switch (type) {
    case 'success':
      return <CheckCircle size={18} className="text-[#30D158]" />
    case 'error':
      return <AlertCircle size={18} className="text-[#FF453A]" />
    case 'warning':
      return <AlertCircle size={18} className="text-[#FF9500]" />
    case 'delete':
      return <Trash2 size={18} className="text-[#FF453A]" />
    default:
      return <Info size={18} className="text-[#0A84FF]" />
  }
}

export default function Toast({ message, action, type = 'info', onClose }) {
  const [isVisible, setIsVisible] = useState(false)
  const [isLeaving, setIsLeaving] = useState(false)

  useEffect(() => {
    // Trigger enter animation
    requestAnimationFrame(() => {
      setIsVisible(true)
    })
  }, [])

  const handleClose = () => {
    setIsLeaving(true)
    setTimeout(() => {
      onClose()
    }, 200)
  }

  const handleAction = () => {
    if (action?.onClick) {
      action.onClick()
    }
    handleClose()
  }

  return (
    <div 
      className={`
        bg-[#2C2C2E] rounded-xl px-4 py-3 flex items-center gap-3 min-w-[280px] max-w-[400px]
        shadow-2xl border border-[#3A3A3C]
        transform transition-all duration-200 ease-out
        ${isVisible && !isLeaving ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-2 scale-95'}
      `}
    >
      {/* Icon */}
      <div className="shrink-0">
        <ToastIcon type={type} />
      </div>
      
      {/* Message */}
      <span className="flex-1 text-white text-[14px] leading-tight">{message}</span>
      
      {/* Action Button */}
      {action && (
        <button
          onClick={handleAction}
          className="text-[#0A84FF] font-medium text-[14px] hover:opacity-80 transition-colors shrink-0"
        >
          {action.label}
        </button>
      )}
      
      {/* Close Button */}
      <button
        onClick={handleClose}
        className="p-1 hover:bg-[#3A3A3C] rounded-lg transition-colors shrink-0"
      >
        <X size={16} className="text-[#8E8E93]" />
      </button>
    </div>
  )
}
