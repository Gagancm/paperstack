import { useEffect } from 'react'
import { useAppStore } from '../store/appStore'
import Sidebar from '../components/layout/Sidebar'
import TopBar from '../components/layout/TopBar'
import ContentHeader from '../components/layout/ContentHeader'
import NotesList from '../components/notes/NotesList'
import NoteEditor from '../components/editor/NoteEditor'
import Toast from '../components/ui/Toast'
import { PanelLeft, ChevronLeft } from 'lucide-react'

export default function AppPage() {
  const { 
    sidebarOpen, 
    setSidebarOpen,
    toggleSidebar, 
    selectedNoteId,
    selectedFolderId,
    clearSelectedFolder,
    selectNote,
    toasts,
    removeToast,
  } = useAppStore()

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && sidebarOpen) {
        setSidebarOpen(false)
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [sidebarOpen, setSidebarOpen])

  const handleCloseEditor = () => {
    selectNote(null)
  }

  return (
    <div className="h-screen w-full bg-[#1C1C1E] text-white flex overflow-hidden">
      {/* Fixed toggle button and back button - always in same position, 30px from left */}
      <div className="fixed top-3 left-[30px] z-50 flex items-center gap-1">
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 rounded-lg hover:bg-[#3A3A3C] transition-colors"
        >
          <PanelLeft size={20} className="text-[#8E8E93]" />
        </button>
        
        {/* Back to All Notes button - only show when inside a folder */}
        {selectedFolderId && (
          <button
            onClick={clearSelectedFolder}
            className="flex items-center gap-0.5 px-2 py-1.5 rounded-lg hover:bg-[#3A3A3C] transition-colors text-[#0A84FF]"
          >
            <ChevronLeft size={18} />
            <span className="text-sm font-medium">All Notes</span>
          </button>
        )}
      </div>

      {/* Sidebar - always in the document flow when open */}
      <Sidebar />

      {/* Main content - takes remaining space */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <TopBar />
        <ContentHeader />
        <NotesList />
      </div>

      {/* Note Editor Overlay */}
      {selectedNoteId && (
        <NoteEditor onClose={handleCloseEditor} />
      )}

      {/* Toast Notifications */}
      <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-[60] flex flex-col gap-2 pointer-events-none">
        <div className="flex flex-col gap-2 pointer-events-auto">
          {toasts.map((toast) => (
            <Toast
              key={toast.id}
              message={toast.message}
              action={toast.action}
              onClose={() => removeToast(toast.id)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}
