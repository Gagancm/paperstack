import { Cloud, CloudOff, Loader2 } from 'lucide-react'

export default function SyncIndicator({ status }) {
  const config = {
    saved: {
      icon: <Cloud size={18} />,
      color: 'text-ios-green',
      bg: 'bg-ios-green/20',
      label: 'Saved',
    },
    saving: {
      icon: <Loader2 size={18} className="animate-spin" />,
      color: 'text-ios-yellow',
      bg: 'bg-ios-yellow/20',
      label: 'Saving...',
    },
    offline: {
      icon: <CloudOff size={18} />,
      color: 'text-ios-red',
      bg: 'bg-ios-red/20',
      label: 'Offline',
    },
    error: {
      icon: <CloudOff size={18} />,
      color: 'text-ios-red',
      bg: 'bg-ios-red/20',
      label: 'Sync Error',
    },
  }

  const { icon, color, bg, label } = config[status] || config.saved

  return (
    <div
      className={`flex items-center gap-2 px-3 py-1.5 rounded-full ${bg} ${color}`}
      title={label}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </div>
  )
}
