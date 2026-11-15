import Modal from './Modal.jsx'

export default function SignupModal({ open, onClose, onSwitchToLogin }) {
  const handleSubmit = (e) => {
    e.preventDefault()
    // TODO: connect to backend sign up
  }

  return (
    <Modal open={open} onClose={onClose} title="Sign up">
      <form className="modal-form" onSubmit={handleSubmit}>
        <label>
          Username
          <input type="text" name="username" autoComplete="username" required />
        </label>
        <label>
          Email
          <input type="email" name="email" autoComplete="email" required />
        </label>
        <label>
          Password
          <input type="password" name="password" autoComplete="new-password" required />
        </label>
        <label>
          Confirm password
          <input type="password" name="confirmPassword" autoComplete="new-password" required />
        </label>
        <button type="submit" className="btn btn-primary">
          Create account
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
