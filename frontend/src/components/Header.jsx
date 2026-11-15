import { useState } from 'react'
import { Link } from 'react-router'
import LoginModal from './Modals/LoginModal.jsx'
import SignupModal from './Modals/SignupModal.jsx'

export default function Header() {
  // 'login' | 'signup' | null
  const [activeModal, setActiveModal] = useState(null)
  const closeModal = () => setActiveModal(null)

  return (
    <header className="header">
      <Link to="/" className="brand">
        Django DRF + React
      </Link>
      <nav>
        <Link to="/">Home</Link>
        <button type="button" className="btn btn-outline" onClick={() => setActiveModal('login')}>
          Log in
        </button>
        <button type="button" className="btn btn-primary" onClick={() => setActiveModal('signup')}>
          Sign up
        </button>
      </nav>

      <LoginModal
        open={activeModal === 'login'}
        onClose={closeModal}
        onSwitchToSignup={() => setActiveModal('signup')}
      />
      <SignupModal
        open={activeModal === 'signup'}
        onClose={closeModal}
        onSwitchToLogin={() => setActiveModal('login')}
      />
    </header>
  )
}
