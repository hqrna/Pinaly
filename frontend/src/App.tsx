import { useState, useEffect } from 'react'
import axios from 'axios'

function App() {
  // TypeScriptでは型推論が効くので、このままでOK
  const [status, setStatus] = useState<string>('Connecting to Backend...')

  useEffect(() => {
    axios.get('http://127.0.0.1:8000/')
      .then(res => setStatus(res.data.message))
      .catch(() => setStatus('Error: Cannot connect to Backend'))
  }, [])

  return (
    <div style={{ padding: '20px' }}>
      <h1>📍 Pinaly Setup (TypeScript)</h1>
      <p>Backend Status: <strong>{status}</strong></p>
    </div>
  )
}

export default App