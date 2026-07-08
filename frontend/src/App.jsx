import { useState } from 'react'

function App() {
  const [selectedImage, setSelectedImage] = useState(null)
  const [selectedFile, setSelectedFile] = useState(null)
  const [isDragging, setIsDragging] = useState(false)
  const [predictions, setPredictions] = useState(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [history, setHistory] = useState(() => {
    const saved = localStorage.getItem('predictionHistory')
    return saved ? JSON.parse(saved) : []
  })

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(URL.createObjectURL(file))
      setSelectedFile(file)
      setPredictions(null)
      setError(null)
      sendToBackend(file)
    }
  }

  const sendToBackend = async (file) => {
    setIsLoading(true)
    setError(null)

    const formData = new FormData()
    formData.append('file', file)

    try {
      const response = await fetch('http://localhost:8000/predict', {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error(`Server responded with ${response.status}`)
      }

      const data = await response.json()
      setPredictions(data.predictions)

      const newEntry = {
        id: Date.now(),
        image: URL.createObjectURL(file),
        topBreed: data.predictions[0].breed.replace(/_/g, ' '),
        confidence: data.predictions[0].confidence,
        timestamp: new Date().toLocaleString(),
      }

      setHistory((prev) => {
        const updated = [newEntry, ...prev].slice(0, 10) // keep last 10
        localStorage.setItem('predictionHistory', JSON.stringify(updated))
        return updated
      })
    } catch (err) {
      setError('Could not reach the backend. Is the server running?')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleFileChange = (event) => {
    handleFile(event.target.files[0])
  }

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    handleFile(event.dataTransfer.files[0])
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => {
    setIsDragging(false)
  }

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center gap-6 p-4">
      <h1 className="text-4xl font-bold text-white">
        🐶 Dog Breed Classifier
      </h1>

      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`w-96 h-64 flex flex-col items-center justify-center border-4 border-dashed rounded-2xl cursor-pointer transition-colors
          ${isDragging ? 'border-blue-400 bg-gray-800' : 'border-gray-600 bg-gray-800/50'}`}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
        {selectedImage ? (
          <img
            src={selectedImage}
            alt="Preview"
            className="w-full h-full object-cover rounded-xl"
          />
        ) : (
          <p className="text-gray-400 text-center px-4">
            Drag & drop a dog image here<br />or click to browse
          </p>
        )}
      </label>

      {isLoading && (
        <p className="text-blue-400 animate-pulse">Analyzing image...</p>
      )}

      {error && (
        <div className="w-96 bg-red-900/50 border border-red-700 rounded-xl p-4 text-red-200 text-sm">
          {error}
        </div>
      )}

      {predictions && (
        <div className="w-96 bg-gray-800 rounded-xl p-4 text-white space-y-2">
          <p className="text-sm text-gray-400 mb-2">Predictions</p>
          {predictions.map((pred, i) => (
            <div key={i} className="flex justify-between items-center">
              <span className={i === 0 ? 'font-semibold' : 'text-gray-300'}>
                {pred.breed.replace(/_/g, ' ')}
              </span>
              <span className={i === 0 ? 'text-green-400 font-semibold' : 'text-gray-400'}>
                {pred.confidence.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <div className="w-96 bg-gray-800 rounded-xl p-4 text-white">
          <p className="text-sm text-gray-400 mb-3">Recent Predictions</p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 bg-gray-900/50 rounded-lg p-2">
                <img
                  src={entry.image}
                  alt={entry.topBreed}
                  className="w-10 h-10 object-cover rounded-md"
                />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{entry.topBreed}</p>
                  <p className="text-xs text-gray-500">{entry.timestamp}</p>
                </div>
                <span className="text-xs text-green-400 font-medium">
                  {entry.confidence.toFixed(1)}%
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

export default App