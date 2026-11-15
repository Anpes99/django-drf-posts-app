import { useCallback, useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { Link } from 'react-router'
import api from '../api.js'
import {  setUser } from '../store/appSlice.js'
import LoginModal from './Modals/LoginModal.jsx'
import SignupModal from './Modals/SignupModal.jsx'

export default function Header() {
  const dispatch = useDispatch()
  const user = useSelector(state=>state.app.user)
  const authChecked = useSelector(state=>state.app.authChecked)

  const [activeModal, setActiveModal] = useState(null)
  const closeModal = () => setActiveModal(null)

  const loadUser = useCallback(() => {
    api
      .get('/auth/me/')
      .then((res) => dispatch(setUser(res.data)))
      .catch(() => dispatch(setUser(null)))
  }, [dispatch])

  useEffect(() => {
    loadUser()
  }, [loadUser])

  const handleAuthSuccess = () => {
    closeModal()
    loadUser()
  }

  const handleLogout = async () => {
    try {
      await api.post('/auth/logout/')
    } finally {
      dispatch(setUser(null))
    }
  }

  return (
    <header className="header">
      <Link to="/" className="brand">
        Django DRF + React
      </Link>
      <nav>
        <Link to="/">Home</Link>
        {!authChecked ? null : user ? (
          <>
            <span className="header-user">{user.username}</span>
            <button type="button" className="btn btn-outline" onClick={handleLogout}>
              Log out
            </button>
          </>
        ) : (
          <>
            <button
              type="button"
              className="btn btn-outline"
              onClick={() => setActiveModal('login')}
            >
              Log in
            </button>
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => setActiveModal('signup')}
            >
              Sign up
            </button>
          </>
        )}
      </nav>

      <LoginModal
        open={activeModal === 'login'}
        onClose={closeModal}
        onSwitchToSignup={() => setActiveModal('signup')}
        onSuccess={handleAuthSuccess}
      />
      <SignupModal
        open={activeModal === 'signup'}
        onClose={closeModal}
        onSwitchToLogin={() => setActiveModal('login')}
        onSuccess={handleAuthSuccess}
      />
    </header>
  )
}
