import { Search, Notification, User } from 'react-iconly'
import { useAppStore } from '../../store/appStore'

export default function TopBar() {
  const {
    searchQuery,
    setSearchQuery,
    user,
  } = useAppStore()

  return (
    <header className="flex items-center gap-4 px-[30px] py-3 bg-[#1C1C1E]">
      {/* Left: Spacer for toggle button */}
      <div className="w-10 shrink-0" />

      {/* Center: Search - always centered */}
      <div className="flex-1 flex justify-center">
        <div className="relative w-full max-w-md">
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6E6E73]">
            <Search set="broken" size={16} stroke="regular" />
          </div>
          <input
            type="search"
            placeholder="Search on Web..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-[#2C2C2E] text-white placeholder-[#6E6E73] rounded-full py-2.5 pl-11 pr-4 outline-none border border-transparent focus:border-[#3A3A3C] text-sm"
          />
        </div>
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
  )
}
