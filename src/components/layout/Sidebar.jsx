import { Folder, Star, Delete, Document } from 'react-iconly'
import { FileText, Layout } from 'lucide-react'
import { useAppStore, LABEL_COLORS } from '../../store/appStore'

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
  } = useAppStore()

  const notebooksCount = getNotesCountByDocumentType('notebook')
  const whiteboardCount = getNotesCountByDocumentType('whiteboard')
  const documentsCount = getNotesCountByDocumentType('document')
  const favoritesCount = notes.filter(n => n.pinned && !n.inTrash).length
  const trashCount = notes.filter(n => n.inTrash).length

  // Don't render if sidebar is closed
  if (!sidebarOpen) return null

  // Check if a document type is active
  const isDocTypeActive = (type) => activeDocumentType === type && activeFilter === 'all'

  const handleDocTypeClick = (type) => {
    setActiveDocumentType(type)
    setActiveFilter('all')
  }

  return (
    <aside className="w-[250px] h-full bg-[#131313] flex flex-col shrink-0 px-[30px]">
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

        {/* Documents */}
        <button
          onClick={() => handleDocTypeClick('document')}
          className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors mb-1 ${
            isDocTypeActive('document')
              ? 'bg-[#2C2C2E] text-white' 
              : 'text-[#EBEBF5] hover:bg-[#2C2C2E]'
          }`}
        >
          <FileText size={18} strokeWidth={1.5} />
          <span className="text-[15px]">Documents</span>
          {documentsCount > 0 && (
            <span className="ml-auto text-xs text-[#8E8E93]">{documentsCount}</span>
          )}
        </button>

        {/* Divider */}
        <div className="h-px bg-[#3A3A3C] my-3" />

        {/* Favorites */}
        <button
          onClick={() => setActiveFilter('favorites')}
          className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors mb-1 ${
            activeFilter === 'favorites' 
              ? 'bg-[#2C2C2E] text-white' 
              : 'text-[#EBEBF5] hover:bg-[#2C2C2E]'
          }`}
        >
          <Star set="broken" size={18} stroke="regular" />
          <span className="text-[15px]">Favorites</span>
          {favoritesCount > 0 && (
            <span className="ml-auto text-xs text-[#8E8E93]">{favoritesCount}</span>
          )}
        </button>

        {/* Trash */}
        <button
          onClick={() => setActiveFilter('trash')}
          className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors ${
            activeFilter === 'trash' 
              ? 'bg-[#2C2C2E] text-white' 
              : 'text-[#EBEBF5] hover:bg-[#2C2C2E]'
          }`}
        >
          <Delete set="broken" size={18} stroke="regular" />
          <span className="text-[15px]">Trash</span>
          {trashCount > 0 && (
            <span className="ml-auto text-xs text-[#8E8E93]">{trashCount}</span>
          )}
        </button>

        {/* Labels Section */}
        {labels.length > 0 && (
          <div className="mt-6">
            <h3 className="px-2 mb-2 text-[11px] font-semibold text-[#8E8E93] uppercase tracking-wider">
              Labels
            </h3>
            {labels.map((label) => (
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
                  className="w-2.5 h-2.5 rounded-full"
                  style={{ backgroundColor: LABEL_COLORS[label.color] }}
                />
                <span className="text-[15px]">{label.name}</span>
              </button>
            ))}
          </div>
        )}
      </nav>
    </aside>
  )
}
