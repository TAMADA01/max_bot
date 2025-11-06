import { useState, useEffect } from 'react'
import axios from 'axios'
import './App.css'

function App() {
  const [data, setData] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await axios.get('http://localhost:3000/api/data')
        setData(response.data)
      } catch (error) {
        console.error('Error fetching data:', error)
        setData({ message: 'Error connecting to API' })
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  if (loading) return <div>Loading...</div>

  return (
    <div className="App">
      <h1>React Web App</h1>
      <p>{data?.message}</p>
      <p>Timestamp: {data?.timestamp}</p>
    </div>
  )
}

export default App