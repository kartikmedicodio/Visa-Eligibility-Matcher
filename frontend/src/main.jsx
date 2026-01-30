import { StrictMode, useState } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import SplashPage from './components/SplashPage.jsx'

function Root() {
  const [showSplash, setShowSplash] = useState(true)

  if (showSplash) {
    return <SplashPage onComplete={() => setShowSplash(false)} />
  }

  return <App />
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <Root />
  </StrictMode>,
)
