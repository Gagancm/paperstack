import { useAppStore } from '../store/appStore'

export default function LoginPage() {
  const { setAuthenticated, setUser } = useAppStore()

  const handleDemoLogin = () => {
    setUser({
      name: 'Demo User',
      email: 'demo@example.com',
      avatar: null,
    })
    setAuthenticated(true)
  }

  return (
    <div className="min-h-screen w-full bg-[#1C1C1E] flex flex-col items-center justify-center p-6">
      {/* Logo */}
      <div className="mb-8 text-center">
        <div className="w-20 h-20 rounded-2xl bg-[#0A84FF] flex items-center justify-center mx-auto mb-4">
          <span className="text-4xl">📝</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">PaperStack</h1>
        <p className="text-[#8E8E93]">Your personal notes, everywhere</p>
      </div>

      {/* Login Card */}
      <div className="w-full max-w-sm bg-[#2C2C2E] rounded-2xl p-6">
        <h2 className="text-xl font-semibold text-white mb-2 text-center">Welcome</h2>
        <p className="text-[#8E8E93] text-center mb-6">Sign in to sync your notes</p>

        <button
          onClick={handleDemoLogin}
          className="w-full py-3 px-4 bg-[#3A3A3C] hover:bg-[#48484A] rounded-xl flex items-center justify-center gap-3 transition-colors mb-3"
        >
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
            <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
            <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
            <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
          </svg>
          <span className="font-medium text-white">Continue with Google</span>
        </button>

        <button
          onClick={handleDemoLogin}
          className="w-full py-3 px-4 bg-[#0A84FF] hover:bg-[#0A84FF]/80 rounded-xl font-medium text-white transition-colors"
        >
          Try Demo Mode
        </button>

        <p className="text-[#8E8E93] text-xs text-center mt-6">
          We only access the files this app creates.
        </p>
      </div>

      {/* Features */}
      <div className="mt-8 grid grid-cols-3 gap-4 max-w-sm">
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-[#2C2C2E] mx-auto mb-2 flex items-center justify-center text-xl">✏️</div>
          <p className="text-[#8E8E93] text-xs">Type & Draw</p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-[#2C2C2E] mx-auto mb-2 flex items-center justify-center text-xl">🔄</div>
          <p className="text-[#8E8E93] text-xs">Auto Sync</p>
        </div>
        <div className="text-center">
          <div className="w-12 h-12 rounded-xl bg-[#2C2C2E] mx-auto mb-2 flex items-center justify-center text-xl">📱</div>
          <p className="text-[#8E8E93] text-xs">Works Offline</p>
        </div>
      </div>
    </div>
  )
}
