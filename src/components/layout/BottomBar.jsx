import { useState } from 'react'
import { Document, Download, Plus, Folder, Setting, Paper } from 'react-iconly'
import { useAppStore } from '../../store/appStore'
import NewNoteModal from '../ui/NewNoteModal'

export default function BottomBar() {
  const { createFolder, addToast, sidebarOpen } = useAppStore()
  const [showNewNoteModal, setShowNewNoteModal] = useState(false)
  const [showQuickMenu, setShowQuickMenu] = useState(false)

  const handleNewFolder = () => {
    createFolder()
    addToast({ message: 'Folder created' })
    setShowQuickMenu(false)
  }

  const handleNewNote = () => {
    setShowQuickMenu(false)
    setShowNewNoteModal(true)
  }

  return (
    <>
      <div
        className={`fixed bottom-0 right-0 flex justify-center px-4 pt-4 bg-app-bg z-40 transition-[left] duration-300 ease-out ${
          sidebarOpen ? 'left-[280px]' : 'left-0'
        }`}
        style={{ paddingBottom: 'max(1rem, calc(1rem + env(safe-area-inset-bottom, 0px)))' }}
      >
        {/* Capsule bar – machined metal pill */}
        <div className="bar-capsule flex items-center justify-center gap-2 md:gap-6 px-4 md:px-6 h-11 w-full max-w-xl min-w-0 overflow-x-auto overflow-y-hidden [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          <BottomBarItem
            icon={<div className="text-accent-amber shrink-0"><Document set="broken" size={20} stroke="regular" /></div>}
            label="Quick Note"
            onClick={handleNewNote}
          />
          <BottomBarItem
            icon={<div className="text-text-secondary shrink-0"><Download set="broken" size={20} stroke="regular" /></div>}
            label="Import PDF"
            onClick={() => {}}
          />

          {/* Central Add – accent raised button with dropdown */}
          <div className="relative">
            <button
              onClick={() => setShowQuickMenu(!showQuickMenu)}
              className="btn-accent flex items-center justify-center w-9 h-9 rounded-full shrink-0 touch-manipulation"
              aria-label="Add"
            >
              <Plus set="broken" size={20} stroke="bold" style={{ transition: 'transform 0.2s', transform: showQuickMenu ? 'rotate(45deg)' : 'none' }} />
            </button>

            {/* Quick Add Menu */}
            {showQuickMenu && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setShowQuickMenu(false)} />
                <div className="dropdown-menu absolute bottom-full mb-3 left-1/2 -translate-x-1/2 w-44 z-50 overflow-hidden py-1.5 animate-fade-in">
                  <button
                    onClick={handleNewNote}
                    className="dropdown-item w-full px-4 py-3 flex items-center gap-3 text-left"
                  >
                    <div className="text-accent-amber shrink-0"><Paper set="broken" size={18} stroke="regular" /></div>
                    <span className="text-text-primary text-sm font-medium">New Note</span>
                  </button>
                  <div className="dropdown-divider" />
                  <button
                    onClick={handleNewFolder}
                    className="dropdown-item w-full px-4 py-3 flex items-center gap-3 text-left"
                  >
                    <div className="text-accent-amber shrink-0"><Folder set="broken" size={18} stroke="regular" /></div>
                    <span className="text-text-primary text-sm font-medium">New Folder</span>
                  </button>
                </div>
              </>
            )}
          </div>

          <BottomBarItem
            icon={<div className="text-text-secondary shrink-0"><Folder set="broken" size={20} stroke="regular" /></div>}
            label="New Folder"
            onClick={handleNewFolder}
          />
          <BottomBarItem
            icon={<div className="text-text-secondary shrink-0"><Setting set="broken" size={20} stroke="regular" /></div>}
            label="Settings"
            onClick={() => {}}
          />
        </div>
      </div>

      {/* New Note Modal */}
      <NewNoteModal
        isOpen={showNewNoteModal}
        onClose={() => setShowNewNoteModal(false)}
      />
    </>
  )
}

function BottomBarItem({ icon, label, onClick }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center justify-center gap-1.5 py-2 px-2.5 rounded-xl text-text-secondary hover:text-text-primary hover:bg-metal-base/80 transition-colors touch-manipulation h-11 shrink-0"
    >
      {icon}
      <span className="text-[11px] md:text-xs font-medium leading-tight whitespace-nowrap">{label}</span>
    </button>
  )
}
