import { Folder, Star, Delete } from 'react-iconly'
import { useAppStore, LABEL_COLORS } from '../../store/appStore'

export default function Sidebar() {
  const { 
    sidebarOpen, 
    activeFilter,
    setActiveFilter,
    labels,
    notes,
  } = useAppStore()

  const favoritesCount = notes.filter(n => n.pinned && !n.inTrash).length
  const trashCount = notes.filter(n => n.inTrash).length

  // Don't render if sidebar is closed
  if (!sidebarOpen) return null

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

      {/* Navigation - aligns with filter row (pb-4) */}
      <nav className="flex-1 overflow-y-auto -mx-2">
        {/* All Notes */}
        <button
          onClick={() => {
            setActiveFilter('all')
          }}
          className={`w-full flex items-center gap-3 px-2 py-2.5 rounded-lg transition-colors mb-1 ${
            activeFilter === 'all' 
              ? 'bg-[#2C2C2E] text-white' 
              : 'text-[#EBEBF5] hover:bg-[#2C2C2E]'
          }`}
        >
          <Folder set="broken" size={18} stroke="regular" />
          <span className="text-[15px]">Notes</span>
        </button>

        {/* Favorites */}
        <button
          onClick={() => {
            setActiveFilter('favorites')
          }}
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
          onClick={() => {
            setActiveFilter('trash')
          }}
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
                onClick={() => {
                  setActiveFilter(label.id)
                }}
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
