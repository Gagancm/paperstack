import { useState, useEffect, useRef } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { X, Trash2, Check, Bell, FileText, Folder, Tag, Clock } from 'lucide-react'
import { useAppStore } from '../../store/appStore'

// Notification type icons
const NotificationIcon = ({ type }) => {
  switch (type) {
    case 'note_deleted':
      return <Trash2 size={16} className="text-[#FF453A]" />
    case 'note_created':
      return <FileText size={16} className="text-[#30D158]" />
    case 'folder_created':
      return <Folder size={16} className="text-[#0A84FF]" />
    case 'label_added':
      return <Tag size={16} className="text-[#BF5AF2]" />
    case 'sync':
      return <Clock size={16} className="text-[#FF9500]" />
    default:
      return <Bell size={16} className="text-[#8E8E93]" />
  }
}

// Time ago helper
const timeAgo = (date) => {
  const now = new Date()
  const diff = now - new Date(date)
  const minutes = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  
  if (minutes < 1) return 'Just now'
  if (minutes < 60) return `${minutes}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}

export default function NotificationPanel({ isOpen, onClose }) {
  const panelRef = useRef(null)
  const { notifications, markNotificationRead, markAllNotificationsRead, clearAllNotifications } = useAppStore()
  
  const unreadCount = notifications.filter(n => !n.read).length

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        onClose()
      }
    }
    
    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen, onClose])

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape') onClose()
    }
    
    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
    }
    
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          ref={panelRef}
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="absolute top-full right-0 mt-2 w-80 bg-[#2C2C2E] rounded-2xl border border-[#3A3A3C] shadow-2xl overflow-hidden z-50"
        >
      {/* Header */}
      <div className="px-4 py-3 border-b border-[#3A3A3C] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-white font-medium">Notifications</span>
          {unreadCount > 0 && (
            <span className="px-1.5 py-0.5 bg-[#0A84FF] text-white text-[11px] font-medium rounded-full min-w-[18px] text-center">
              {unreadCount}
            </span>
          )}
        </div>
        <div className="flex items-center gap-1">
          {notifications.length > 0 && (
            <>
              <button
                onClick={markAllNotificationsRead}
                className="p-1.5 rounded-lg hover:bg-[#3A3A3C] transition-colors text-[#8E8E93] hover:text-white"
                title="Mark all as read"
              >
                <Check size={16} />
              </button>
              <button
                onClick={clearAllNotifications}
                className="p-1.5 rounded-lg hover:bg-[#3A3A3C] transition-colors text-[#8E8E93] hover:text-[#FF453A]"
                title="Clear all"
              >
                <Trash2 size={16} />
              </button>
            </>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-[#3A3A3C] transition-colors text-[#8E8E93]"
          >
            <X size={16} />
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="max-h-[400px] overflow-y-auto">
        {notifications.length === 0 ? (
          <div className="px-4 py-8 text-center">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#3A3A3C] flex items-center justify-center">
              <Bell size={24} className="text-[#6E6E73]" />
            </div>
            <p className="text-[#8E8E93] text-sm">No notifications yet</p>
            <p className="text-[#6E6E73] text-xs mt-1">Actions you take will appear here</p>
          </div>
        ) : (
          <div className="py-1">
            {notifications.map((notification) => (
              <button
                key={notification.id}
                onClick={() => markNotificationRead(notification.id)}
                className={`w-full px-4 py-3 flex items-start gap-3 hover:bg-[#3A3A3C] transition-colors text-left ${
                  !notification.read ? 'bg-[#3A3A3C]/50' : ''
                }`}
              >
                {/* Icon */}
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                  !notification.read ? 'bg-[#0A84FF]/20' : 'bg-[#3A3A3C]'
                }`}>
                  <NotificationIcon type={notification.type} />
                </div>
                
                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className={`text-[14px] leading-tight ${!notification.read ? 'text-white' : 'text-[#EBEBF5]'}`}>
                    {notification.message}
                  </p>
                  <p className="text-[#6E6E73] text-[12px] mt-1">
                    {timeAgo(notification.createdAt)}
                  </p>
                </div>
                
                {/* Unread indicator */}
                {!notification.read && (
                  <div className="w-2 h-2 rounded-full bg-[#0A84FF] shrink-0 mt-1.5" />
                )}
              </button>
            ))}
          </div>
        )}
      </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
