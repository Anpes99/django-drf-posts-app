import { useState } from 'react'
import api, { getErrorMessage } from '../../api.js'
import Modal from './Modal.jsx'

export default function SignupModal({ open, onClose, onSwitchToLogin, onSuccess }) {
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
      await api.post('/auth/signup/', { username, password })
      form.reset()
      onSuccess?.(username)
    } catch (err) {
      setError(getErrorMessage(err))
    } finally {
      setLoading(false)
    }
  }

  return (
    <Modal open={open} onClose={handleClose} title="Sign up">
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
          <input type="password" name="password" autoComplete="new-password" required />
        </label>
        <button type="submit" className="btn btn-primary" disabled={loading}>
          {loading ? 'Creating account…' : 'Create account'}
        </button>
      </form>
      <p className="modal-switch">
        Already have an account?{' '}
        <button type="button" className="link-btn" onClick={onSwitchToLogin}>
          Log in
        </button>
      </p>
    </Modal>
  )
}
