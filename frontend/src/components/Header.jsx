import { Link } from 'react-router'

export default function Header() {
  return (
    <header className="header">
      <Link to="/" className="brand">
        Django DRF + React
      </Link>
      <nav>
        <Link to="/">Home</Link>
        <button type="button" className="btn btn-outline">
          Log in
        </button>
        <button type="button" className="btn btn-primary">
          Sign up
        </button>
      </nav>
    </header>
  )
}
