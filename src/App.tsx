import { useState } from 'react'
import { Game } from './components/Game'
import { IntroOverlay } from './components/IntroOverlay'

function App() {
  const [isIntro, setIsIntro] = useState(true)

  const handleIntroComplete = () => {
    setIsIntro(false)
  }

  return (
    <>
      {isIntro && <IntroOverlay onEnter={handleIntroComplete} />}
      {!isIntro && <Game />}
    </>
  )
}

export default App
