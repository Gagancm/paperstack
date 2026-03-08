import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Folder, Document } from 'react-iconly'
import { FileText, Layout, Star, Trash2 } from 'lucide-react'
import { useAppStore, LABEL_COLORS } from '../../store/appStore'

// When user has more than this many labels, show only labels with notes, sorted by count, limited by screen
const LABEL_SIDEBAR_THRESHOLD = 6

// Max labels to show in sidebar when above threshold (based on viewport height)
function getMaxLabelsFromHeight() {
  const h = typeof window !== 'undefined' ? window.innerHeight : 800
  if (h < 600) return 3
  if (h < 768) return 5
  if (h < 1024) return 8
  return 12
}

export default function Sidebar() {
  const { 
    sidebarOpen, 
    activeFilter,
    setActiveFilter,
    activeDocumentType,
    setActiveDocumentType,
    labels,
    notes,
    getNotesCountByDocumentType,
    getNotesCountByLabel,
  } = useAppStore()

  const [maxLabels, setMaxLabels] = useState(getMaxLabelsFromHeight)
  useEffect(() => {
    const onResize = () => setMaxLabels(getMaxLabelsFromHeight())
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const notebooksCount = getNotesCountByDocumentType('notebook')
  const whiteboardCount = getNotesCountByDocumentType('whiteboard')
  const tasksCount = getNotesCountByDocumentType('task')
  const favoritesCount = notes.filter(n => n.pinned && !n.inTrash).length
  const trashCount = notes.filter(n => n.inTrash).length

  // Check if a document type is active
  const isDocTypeActive = (type) => activeDocumentType === type && activeFilter === 'all'

  const handleDocTypeClick = (type) => {
    setActiveDocumentType(type)
    setActiveFilter('all')
  }

  return (
    <motion.aside
      animate={{
        width: sidebarOpen ? 250 : 0,
      }}
      transition={{ type: 'spring', damping: 28, stiffness: 300 }}
      className="h-full bg-[#131313] flex flex-col shrink-0 overflow-hidden"
      style={{ minWidth: 0, pointerEvents: sidebarOpen ? 'auto' : 'none' }}
    >
      <div className="flex flex-col h-full px-[30px] min-w-[250px]">
      {/* Spacer for TopBar - matches TopBar height (py-3 = 12px top/bottom + content) */}
      <div className="py-3">
        {/* Empty space where toggle button appears via fixed positioning */}
        <div className="h-[36px]" />
      </div>

      {/* App Title - aligns with "Notes" title (py-4) */}
      <div className="py-4">
        <h2 className="text-2xl font-bold text-white">PaperStack</h2>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto -mx-2">
        {/* All Notebooks */}
        <button
          onClick={() => handleDocTypeClick('notebook')}
          className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors mb-1 ${
            isDocTypeActive('notebook')
              ? 'bg-[#2C2C2E] text-white' 
              : 'text-[#EBEBF5] hover:bg-[#2C2C2E]'
          }`}
        >
          <Document set="broken" size={18} stroke="regular" />
          <span className="text-[15px]">Notebooks</span>
          {notebooksCount > 0 && (
            <span className="ml-auto text-xs text-[#8E8E93]">{notebooksCount}</span>
          )}
        </button>

        {/* Whiteboard */}
        <button
          onClick={() => handleDocTypeClick('whiteboard')}
          className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors mb-1 ${
            isDocTypeActive('whiteboard')
              ? 'bg-[#2C2C2E] text-white' 
              : 'text-[#EBEBF5] hover:bg-[#2C2C2E]'
          }`}
        >
          <Layout size={18} strokeWidth={1.5} />
          <span className="text-[15px]">Whiteboard</span>
          {whiteboardCount > 0 && (
            <span className="ml-auto text-xs text-[#8E8E93]">{whiteboardCount}</span>
          )}
        </button>

        {/* Tasks */}
        <button
          onClick={() => handleDocTypeClick('task')}
          className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors mb-1 ${
            isDocTypeActive('task')
              ? 'bg-[#2C2C2E] text-white' 
              : 'text-[#EBEBF5] hover:bg-[#2C2C2E]'
          }`}
        >
          <FileText size={18} strokeWidth={1.5} />
          <span className="text-[15px]">Tasks</span>
          {tasksCount > 0 && (
            <span className="ml-auto text-xs text-[#8E8E93]">{tasksCount}</span>
          )}
        </button>

        {/* Divider */}
        <div className="h-px bg-[#3A3A3C] my-3" />

        {/* Favorites - solid yellow star */}
        <button
          onClick={() => setActiveFilter('favorites')}
          className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors mb-1 ${
            activeFilter === 'favorites' 
              ? 'bg-[#2C2C2E] text-white' 
              : 'text-[#EBEBF5] hover:bg-[#2C2C2E]'
          }`}
        >
          <Star size={18} className="text-[#FFD60A] shrink-0" fill="#FFD60A" strokeWidth={0} />
          <span className="text-[15px]">Favorites</span>
          {favoritesCount > 0 && (
            <span className="ml-auto text-xs text-[#8E8E93]">{favoritesCount}</span>
          )}
        </button>

        {/* Trash - red outline */}
        <button
          onClick={() => setActiveFilter('trash')}
          className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors ${
            activeFilter === 'trash' 
              ? 'bg-[#2C2C2E] text-white' 
              : 'text-[#EBEBF5] hover:bg-[#2C2C2E]'
          }`}
        >
          <Trash2 size={18} className="text-[#FF453A] shrink-0" strokeWidth={1.5} />
          <span className="text-[15px]">Trash</span>
          {trashCount > 0 && (
            <span className="ml-auto text-xs text-[#8E8E93]">{trashCount}</span>
          )}
        </button>

        {/* Divider between Trash and Labels */}
        <div className="h-px bg-[#3A3A3C] my-3" />

        {/* Labels Section - by default show all; when many labels, show only with notes, sorted by count, limited by screen */}
        {labels.length > 0 && (() => {
          const showAll = labels.length <= LABEL_SIDEBAR_THRESHOLD
          const labelsWithCount = labels
            .map((label) => ({ label, count: getNotesCountByLabel(label.id) }))
          const toShow = showAll
            ? labelsWithCount
            : labelsWithCount
                .filter(({ count }) => count > 0)
                .sort((a, b) => b.count - a.count)
                .slice(0, maxLabels)
          if (toShow.length === 0) return null
          return (
            <div className="mt-2">
              <h3 className="px-2 mb-2 text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">
                Labels
              </h3>
              {toShow.map(({ label }) => (
                <button
                  key={label.id}
                  onClick={() => setActiveFilter(label.id)}
                  className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors mb-1 ${
                    activeFilter === label.id 
                      ? 'bg-[#2C2C2E] text-white' 
                      : 'text-[#EBEBF5] hover:bg-[#2C2C2E]'
                  }`}
                >
                  <div 
                    className="w-2.5 h-2.5 rounded-full shrink-0"
                    style={{ backgroundColor: LABEL_COLORS[label.color] }}
                  />
                  <span className="text-[15px] truncate">{label.name}</span>
                  <span className="ml-auto text-xs text-[#8E8E93] shrink-0">
                    {getNotesCountByLabel(label.id)}
                  </span>
                </button>
              ))}
            </div>
          )
        })()}
      </nav>
      </div>
    </motion.aside>
  )
}
