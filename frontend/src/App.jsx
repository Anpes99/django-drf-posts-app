import { useEffect, useState } from 'react'
import './App.css'

function App() {
  const [message, setMessage] = useState('Loading...')

  useEffect(() => {
    fetch('/api/hello/')
      .then((res) => res.json())
      .then((data) => setMessage(data.message))
      .catch(() => setMessage('Could not reach the backend. Is Django running?'))
  }, [])

  return (
    <main>
      <h1>Django DRF + React</h1>
      <p>{message}</p>
    </main>
  )
}

export default App
