import { useState, useRef, useEffect } from 'react'
import { FileText, Folder, Plus, ChevronDown } from 'lucide-react'

export default function NewDropdown({ onNewNote, onNewFolder }) {
  const [isOpen, setIsOpen] = useState(false)
  const dropdownRef = useRef(null)

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setIsOpen(false)
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  const handleNewNote = () => {
    setIsOpen(false)
    onNewNote()
  }

  const handleNewFolder = () => {
    setIsOpen(false)
    onNewFolder()
  }

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="btn-raised h-9 px-4 rounded-xl flex items-center gap-2 shrink-0"
        aria-label="New"
        aria-expanded={isOpen}
      >
        <Plus size={18} className="text-text-primary" />
        <span className="text-text-primary text-sm font-medium">New</span>
        <ChevronDown 
          size={14} 
          className={`text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`} 
        />
      </button>

      {isOpen && (
        <>
          {/* Backdrop for mobile */}
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsOpen(false)} />
          
          {/* Dropdown Menu */}
          <div className="dropdown-menu absolute right-0 top-full mt-2 w-48 z-50 overflow-hidden py-1.5 animate-fade-in">
            <button
              onClick={handleNewNote}
              className="dropdown-item w-full px-4 py-3 flex items-center gap-3 text-left"
            >
              <FileText size={18} className="text-text-secondary shrink-0" />
              <span className="text-text-primary text-sm">New Note</span>
            </button>
            
            <div className="dropdown-divider" />
            
            <button
              onClick={handleNewFolder}
              className="dropdown-item w-full px-4 py-3 flex items-center gap-3 text-left"
            >
              <Folder size={18} className="text-text-secondary shrink-0" />
              <span className="text-text-primary text-sm">New Folder</span>
            </button>
          </div>
        </>
      )}
    </div>
  )
}
