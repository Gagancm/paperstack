import { useState, useRef, useEffect } from 'react'
import { Paper, Folder, Plus, ChevronDown } from 'react-iconly'

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
        <Plus set="broken" size={18} stroke="regular" primaryColor="currentColor" />
        <span className="text-text-primary text-sm font-medium">New</span>
        <div className={`text-text-secondary transition-transform ${isOpen ? 'rotate-180' : ''}`}>
          <ChevronDown set="broken" size={14} stroke="regular" />
        </div>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div className="fixed inset-0 z-40" onClick={() => setIsOpen(false)} />
          
          {/* Dropdown Menu */}
          <div className="absolute right-0 top-full mt-1 w-48 z-50 bg-[#2C2C2E] rounded-xl shadow-xl border border-[#3A3A3C] overflow-hidden">
            {/* Header */}
            <div className="py-2 text-center border-b border-[#3A3A3C]">
              <span className="text-white font-medium text-[15px]">Create New</span>
            </div>

            {/* Options */}
            <div className="p-1.5">
              <div className="bg-[#1C1C1E] rounded-lg overflow-hidden">
                <button
                  onClick={handleNewNote}
                  className="w-full px-3 py-2.5 flex items-center gap-3 text-white hover:bg-[#2A2A2C] border-b border-[#3A3A3C]"
                >
                  <Paper set="broken" size={18} stroke="regular" primaryColor="#8E8E93" />
                  <span className="text-[15px]">New Note</span>
                </button>
                
                <button
                  onClick={handleNewFolder}
                  className="w-full px-3 py-2.5 flex items-center gap-3 text-white hover:bg-[#2A2A2C]"
                >
                  <Folder set="broken" size={18} stroke="regular" primaryColor="#8E8E93" />
                  <span className="text-[15px]">New Folder</span>
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
