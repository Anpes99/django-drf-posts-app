import { useState } from 'react'
import api, { getErrorMessage } from '../../api.js'
import Modal from './Modal.jsx'

export default function PostModal({ open, onClose, onSuccess }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleClose = () => {
    setError('')
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const { title, text } = Object.fromEntries(new FormData(form))

    setError('')
    setLoading(true)
    try {
      const res = await api.post('/posts/', { title, text })
      form.reset()
      onSuccess?.(res.data) // the created post: { id, author, title, text, created_at }
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="New post">
      <form className="modal-form" onSubmit={handleSubmit}>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <label>
          Title
          <input type="text" name="title" maxLength={200} required />
        </label>
        <label>
          Text
          <textarea name="text" rows={6} maxLength={10000} required />
        </label>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Publishing…' : 'Publish'}
        </button>
      </form>
    </Modal>
  )
}
