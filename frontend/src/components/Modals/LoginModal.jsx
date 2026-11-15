import Modal from './Modal.jsx'

export default function LoginModal({ open, onClose, onSwitchToSignup }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: connect to backend login
  }

  return (
    <Modal open={open} onClose={onClose} title="Log in">
      <form className="modal-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input type="email" name="email" autoComplete="email" required />
        </label>
        <label>
          Password
          <input type="password" name="password" autoComplete="current-password" required />
        </label>
        <button type="submit" className="btn btn-primary">
          Log in
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
