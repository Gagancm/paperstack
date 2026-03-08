import { useState, useRef, useEffect } from 'react'
import { Search, Notification, User } from 'react-iconly'
import { useAppStore } from '../../store/appStore'
import SearchOverlay from '../ui/SearchOverlay'
import NotificationPanel from '../ui/NotificationPanel'

const SEARCH_PLACEHOLDERS = [
  'Search notes, folders, labels...',
  "Looking for that one note you swear you wrote...",
  "Searching for meaning (and your notes).",
  "What did I even call that note?",
  "Type something. We'll pretend we know where it is.",
  "Search: the eternal quest for the note you wrote yesterday.",
  "Find it before it finds you.",
  "Search notes. Or search your soul. We don't judge.",
  "The answer is in here. Probably.",
  "Lost a thought? We've got a search bar.",
]

const ROTATE_MS = 60_000 // 1 minute

export default function TopBar() {
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationOpen, setNotificationOpen] = useState(false)
  const [placeholderIndex, setPlaceholderIndex] = useState(0)
  const notificationBtnRef = useRef(null)
  const { user, notifications } = useAppStore()
  
  const unreadCount = notifications.filter(n => !n.read).length

  useEffect(() => {
    const id = setInterval(() => {
      setPlaceholderIndex((i) => (i + 1) % SEARCH_PLACEHOLDERS.length)
    }, ROTATE_MS)
    return () => clearInterval(id)
  }, [])

  return (
    <>
      <header className="flex items-center gap-4 py-3 bg-[#1C1C1E] pl-[30px] pr-[30px]">
        {/* Left: Spacer for toggle button - matches right icon strip width so padding is balanced */}
        <div className="w-[88px] shrink-0" />

        {/* Center: Search trigger - always centered */}
        <div className="flex-1 flex justify-center min-w-0">
          <button
            onClick={() => setSearchOpen(true)}
            className="w-full max-w-md flex items-center gap-3 bg-[#2C2C2E] text-[#6E6E73] rounded-full py-2.5 px-4 hover:bg-[#3A3A3C] transition-colors text-sm text-left"
          >
            <Search set="broken" size={16} stroke="regular" />
            <span>{SEARCH_PLACEHOLDERS[placeholderIndex]}</span>
          </button>
        </div>

        {/* Right: 2-col icon strip - bell | profile (aligns with grid | cloud in ContentHeader) */}
        <div className="w-[88px] shrink-0 grid grid-cols-2 gap-0 items-center justify-items-center">
          <div className="relative flex items-center justify-center w-10 h-10">
            <button
              ref={notificationBtnRef}
              onClick={() => setNotificationOpen(!notificationOpen)}
              className="p-2 rounded-lg hover:bg-[#3A3A3C] transition-colors text-[#8E8E93] relative"
            >
              <Notification set="broken" size={18} stroke="regular" />
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 bg-[#FF453A] text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </span>
              )}
            </button>
            <NotificationPanel 
              isOpen={notificationOpen} 
              onClose={() => setNotificationOpen(false)} 
            />
          </div>
          <div className="flex items-center justify-center w-10 h-10">
            <button className="rounded-full hover:bg-[#3A3A3C] transition-colors flex items-center justify-center w-9 h-9" title="Profile">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-full h-full rounded-full object-cover" />
              ) : (
                <div className="w-9 h-9 rounded-full bg-[#3A3A3C] flex items-center justify-center text-[#8E8E93]">
                  <User set="broken" size={20} stroke="regular" />
                </div>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Search Overlay */}
      <SearchOverlay isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
