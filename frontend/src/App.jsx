import { useState } from 'react'

function App() {
  const [selectedImage, setSelectedImage] = useState(null)
  const [isDragging, setIsDragging] = useState(false)

  const handleFile = (file) => {
    if (file && file.type.startsWith('image/')) {
      setSelectedImage(URL.createObjectURL(file))
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

      {selectedImage && (
        <div className="w-96 bg-gray-800 rounded-xl p-4 text-white">
          <p className="text-sm text-gray-400">Prediction results will appear here</p>
        </div>
      )}
    </div>
  )
}

export default App