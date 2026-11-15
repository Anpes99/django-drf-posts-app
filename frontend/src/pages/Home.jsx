import { useEffect, useState } from 'react'

export default function Home() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    fetch('/api/hello/')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage('Could not reach the backend. Is Django running?'))
  }, [])

  return (
    <section>
      <h1>Home</h1>
      <p>Welcome! This page is served by React Router.</p>
      <p className="api-message">
        <strong>Backend says:</strong> {message}
      </p>
    </section>
  )
}
