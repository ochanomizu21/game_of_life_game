import { useState } from 'react'
import { Game } from './components/Game'
import { IntroOverlay } from './components/IntroOverlay'
import ErrorBoundary from './components/ErrorBoundary'

function App() {
  const [isIntro, setIsIntro] = useState(true)

  const handleIntroComplete = () => {
    setIsIntro(false)
  }

  return (
    <ErrorBoundary>
      {isIntro && <IntroOverlay onEnter={handleIntroComplete} />}
      {!isIntro && <Game />}
    </ErrorBoundary>
  )
}

export default App
