export default function Modal({ isOpen, onClose, title, children }) {
  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div
        className="modal-backdrop fixed inset-0 z-50 animate-fade-in"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 pointer-events-none">
        <div
          className="modal-panel w-full max-w-md pointer-events-auto animate-fade-in"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {title && (
            <div className="px-6 py-4 border-b border-metal-base relative z-10">
              <h2 className="text-lg font-semibold text-text-primary">{title}</h2>
            </div>
          )}

          {/* Content */}
          <div className="p-6 relative z-10">{children}</div>
        </div>
      </div>
    </>
  )
}
