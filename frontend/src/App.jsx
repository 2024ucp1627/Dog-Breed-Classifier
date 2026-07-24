import { useState } from 'react'
import Navbar from './components/Navbar'
import Features from './components/Features'
import HowItWorks from './components/HowItWorks'

function App() {
  const [selectedImage, setSelectedImage] = useState(null)
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
        const updated = [newEntry, ...prev].slice(0, 10)
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

  const handleFileChange = (event) => handleFile(event.target.files[0])

  const handleDrop = (event) => {
    event.preventDefault()
    setIsDragging(false)
    handleFile(event.dataTransfer.files[0])
  }

  const handleDragOver = (event) => {
    event.preventDefault()
    setIsDragging(true)
  }

  const handleDragLeave = () => setIsDragging(false)

  return (
    <div id="home" className="min-h-screen bg-bg flex flex-col items-center justify-center gap-6 p-4 pt-24 relative overflow-hidden">
      <Navbar />

      {/* Ambient gradient aura */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-gradient-to-br from-primary to-secondary blur-[120px] opacity-30 animate-aura pointer-events-none" />

      <h1 className="font-display text-5xl font-extrabold text-white relative z-10 tracking-tight">
        <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
          Dog Breed
        </span>{' '}
        Classifier
      </h1>
      <p className="text-slate-400 -mt-4 relative z-10">Drop a photo. Let the model guess the breed.</p>

      <label
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`relative z-10 w-96 h-64 flex flex-col items-center justify-center border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 overflow-hidden backdrop-blur-sm
          ${isDragging
            ? 'border-primary bg-surface-light scale-[1.02] shadow-lg shadow-primary/20'
            : 'border-slate-700 bg-surface/60 hover:border-slate-500'}`}
      >
        <input type="file" accept="image/*" onChange={handleFileChange} className="hidden" />

        {selectedImage ? (
          <div className="relative w-full h-full">
            <img src={selectedImage} alt="Preview" className="w-full h-full object-cover" />
            {isLoading && (
              <div className="absolute inset-0 bg-black/20">
                <div className="absolute left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-accent to-transparent animate-scan" />
              </div>
            )}
          </div>
        ) : (
          <div className="text-center px-4">
            <p className="text-slate-300 font-medium">Drag & drop a dog image here</p>
            <p className="text-slate-500 text-sm mt-1">or click to browse</p>
          </div>
        )}
      </label>

      {isLoading && (
        <p className="relative z-10 font-display text-sm font-semibold tracking-wide text-primary animate-pulse">
          ANALYZING IMAGE...
        </p>
      )}

      {error && (
        <div className="relative z-10 w-96 bg-red-950/50 border border-red-800 rounded-xl p-4 text-red-200 text-sm animate-fade-slide-up">
          {error}
        </div>
      )}

      {predictions && (
        <div className="relative z-10 w-96 bg-surface border border-slate-800 rounded-2xl p-5 text-white space-y-3 animate-fade-slide-up">
          <p className="font-display text-xs font-semibold tracking-widest text-slate-500 uppercase">Predictions</p>
          {predictions.map((pred, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between items-baseline">
                <span className={i === 0 ? 'font-display font-bold text-white' : 'text-slate-400 text-sm'}>
                  {pred.breed.replace(/_/g, ' ')}
                </span>
                <span className={i === 0 ? 'font-display font-bold text-accent' : 'text-slate-500 text-sm'}>
                  {pred.confidence.toFixed(1)}%
                </span>
              </div>
              <div className="h-1.5 bg-surface-light rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${i === 0 ? 'bg-gradient-to-r from-primary to-secondary' : 'bg-slate-600'}`}
                  style={{ width: `${pred.confidence}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {history.length > 0 && (
        <div className="relative z-10 w-96 bg-surface border border-slate-800 rounded-2xl p-5 text-white">
          <p className="font-display text-xs font-semibold tracking-widest text-slate-500 uppercase mb-3">
            Recent Predictions
          </p>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {history.map((entry) => (
              <div key={entry.id} className="flex items-center gap-3 bg-surface-light/50 rounded-lg p-2">
                <img src={entry.image} alt={entry.topBreed} className="w-10 h-10 object-cover rounded-md" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm truncate">{entry.topBreed}</p>
                  <p className="text-xs text-slate-500">{entry.timestamp}</p>
                </div>
                <span className="text-xs text-accent font-semibold">{entry.confidence.toFixed(1)}%</span>
              </div>
            ))}
          </div>
        </div>
      )}

      <Features />
      <HowItWorks />
    </div>
  )
}

export default App