import { useEffect, useRef } from 'react'

export default function Modal({ open, onClose, title, children }) {
  const dialogRef = useRef(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  // Close when clicking the backdrop (outside the modal box)
  const handleClick = (e) => {
    if (e.target === dialogRef.current) onClose()
  }

  // Escape key: let React state drive the close
  const handleCancel = (e) => {
    e.preventDefault()
    onClose()
  }

  return (
    <dialog ref={dialogRef} className="modal" onCancel={handleCancel} onClick={handleClick}>
      <div className="modal-box">
        <div className="modal-header">
          <h2>{title}</h2>
          <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
            ×
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
