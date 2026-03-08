import { useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
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
      {/* Backdrop when sidebar open on tablet/mobile (below lg) */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden
        />
      )}

      {/* Toggle and back: responsive left spacing (safe area on iPad/mobile) */}
      <div className="fixed top-3 left-4 sm:left-6 ipad:left-[30px] z-50 flex items-center gap-1 safe-area-pt">
        <button
          onClick={toggleSidebar}
          className="p-2 -ml-2 rounded-lg hover:bg-[#3A3A3C] transition-colors touch-target min-w-[44px] min-h-[44px] flex items-center justify-center lg:min-w-0 lg:min-h-0"
          aria-label="Toggle sidebar"
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
            <span className="text-sm font-medium hidden sm:inline">All Notes</span>
          </button>
        )}
      </div>

      {/* Sidebar: overlay on tablet/mobile, in-flow on desktop */}
      <Sidebar />

      {/* Main content - takes remaining space */}
      <div className="flex-1 flex flex-col min-h-0 min-w-0">
        <TopBar />
        <ContentHeader />
        <NotesList />
      </div>

      {/* Note Editor Overlay */}
      <AnimatePresence mode="wait">
        {selectedNoteId && (
          <NoteEditor key={selectedNoteId} onClose={handleCloseEditor} />
        )}
      </AnimatePresence>

      {/* Toast Notifications - responsive position (safe area on iPad/mobile) */}
      <div className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 ipad:bottom-6 ipad:right-6 z-[60] flex flex-col gap-2 pointer-events-none safe-area-pb safe-area-pr">
        <div className="flex flex-col gap-2 pointer-events-auto">
          <AnimatePresence mode="popLayout">
            {toasts.map((toast) => (
              <motion.div
                key={toast.id}
                layout
                initial={{ opacity: 0, x: 24, scale: 0.96 }}
                animate={{ opacity: 1, x: 0, scale: 1 }}
                exit={{ opacity: 0, x: 24, scale: 0.96 }}
                transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              >
                <Toast
                  message={toast.message}
                  action={toast.action}
                  type={toast.type}
                  onClose={() => removeToast(toast.id)}
                />
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
