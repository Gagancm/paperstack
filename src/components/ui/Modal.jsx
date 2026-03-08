import { AnimatePresence, motion } from 'framer-motion'

export default function Modal({ isOpen, onClose, title, children }) {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            key="modal-backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="modal-backdrop fixed inset-0 z-50 bg-black/50"
            onClick={onClose}
          />
          
          {/* Modal - responsive padding and safe area for iPad/mobile */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 pointer-events-none safe-area-pb safe-area-pt">
            <motion.div
              key="modal-panel"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="modal-panel w-full max-w-md max-h-[90vh] overflow-y-auto pointer-events-auto bg-[#2C2C2E] rounded-2xl shadow-xl border border-[#3A3A3C] overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Header */}
              {title && (
                <div className="px-6 py-4 border-b border-[#3A3A3C] relative z-10">
                  <h2 className="text-lg font-semibold text-white">{title}</h2>
                </div>
              )}

              {/* Content */}
              <div className="p-6 relative z-10">{children}</div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  )
}
