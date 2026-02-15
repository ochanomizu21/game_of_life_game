import { useState } from 'react'

function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="app">
      <h1>Conway's Game of Life</h1>
      <div className="card">
        <button onClick={() => setCount((count) => count + 1)}>Count is {count}</button>
      </div>
    </div>
  )
}

export default App
