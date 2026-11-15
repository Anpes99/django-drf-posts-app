import { useState } from 'react'
import api, { getErrorMessage } from '../../api.js'
import Modal from './Modal.jsx'

export default function LoginModal({ open, onClose, onSwitchToSignup, onSuccess }) {
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleClose = () => {
    setError('')
    onClose()
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    const form = e.currentTarget
    const { username, password } = Object.fromEntries(new FormData(form))

    setError('')
    setLoading(true)
    try {
      await api.post('/auth/login/', { username, password })
      form.reset()
      onSuccess?.()
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Log in">
      <form className="modal-form" onSubmit={handleSubmit}>
        {error && (
          <p className="form-error" role="alert">
            {error}
          </p>
        )}
        <label>
          Username
          <input type="text" name="username" autoComplete="username" required />
        </label>
        <label>
          Password
          <input type="password" name="password" autoComplete="current-password" required />
        </label>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Logging in…' : 'Log in'}
        </button>
      </form>
      <p className="modal-switch">
        Don&apos;t have an account?{' '}
        <button type="button" className="link-btn" onClick={onSwitchToSignup}>
          Sign up
        </button>
      </p>
    </Modal>
  )
}
