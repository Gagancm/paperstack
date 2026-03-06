import { useState } from 'react'
import { Search, Notification, User } from 'react-iconly'
import { useAppStore } from '../../store/appStore'
import SearchOverlay from '../ui/SearchOverlay'

export default function TopBar() {
  const [searchOpen, setSearchOpen] = useState(false)
  const { user } = useAppStore()

  return (
    <>
      <header className="flex items-center gap-4 px-[30px] py-3 bg-[#1C1C1E]">
        {/* Left: Spacer for toggle button */}
        <div className="w-10 shrink-0" />

        {/* Center: Search trigger - always centered */}
        <div className="flex-1 flex justify-center">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full max-w-md flex items-center gap-3 bg-[#2C2C2E] text-[#6E6E73] rounded-full py-2.5 px-4 hover:bg-[#3A3A3C] transition-colors text-sm text-left"
          >
            <Search set="broken" size={16} stroke="regular" />
            <span>Find your brilliant ideas...</span>
          </button>
        </div>

        {/* Right: Actions - fixed width to balance left side */}
        <div className="flex items-center gap-2 shrink-0">
          <button className="p-2 rounded-lg hover:bg-[#3A3A3C] transition-colors text-[#8E8E93]">
            <Notification set="broken" size={22} stroke="regular" />
          </button>
          <button className="w-8 h-8 rounded-full bg-[#3A3A3C] flex items-center justify-center">
            {user?.avatar ? (
              <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
            ) : (
              <div className="text-[#8E8E93]">
                <User set="broken" size={18} stroke="regular" />
              </div>
            )}
          </button>
        </div>
      </header>

      {/* Search Overlay */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
