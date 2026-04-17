import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <header className="top-header">
        <div className="brand">
          <span className="brand-name">Market Intelligence Tool</span>
        </div>
      </header>
      <section id="center">
        <div>
          <h1>Product Plant Finder</h1>
          <p>
            Locate and analyze food manufacturing plants.
          </p>
        </div>
        <button
          className="counter"
          onClick={() => setCount((count) => count + 1)}
        >
          Search Queries: {count}
        </button>
      </section>

      <div className="ticks"></div>
    </>
  )
}

export default App
