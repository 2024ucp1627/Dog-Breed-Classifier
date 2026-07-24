import { Dog, GitBranch } from 'lucide-react'
function Navbar() {
  return (
    <nav className="fixed top-0 left-0 right-0 z-50 backdrop-blur-md bg-bg/70 border-b border-slate-800">
      <div className="max-w-5xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Dog className="w-6 h-6 text-primary" />
          <span className="font-display font-bold text-white tracking-tight">
            DogVision AI
          </span>
        </div>

        <div className="hidden md:flex items-center gap-8 text-sm text-slate-300">
          <a href="#home" className="hover:text-white transition-colors">Home</a>
          <a href="#how-it-works" className="hover:text-white transition-colors">How It Works</a>
          <a href="#features" className="hover:text-white transition-colors">Features</a>
          <a href="#model" className="hover:text-white transition-colors">Model</a>
        </div>

        <a href="https://github.com/2024ucp1627/Dog-Breed-Classifier" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 bg-surface border border-slate-700 hover:border-slate-500 text-white text-sm font-medium px-4 py-2 rounded-lg transition-colors">
          <GitBranch className="w-4 h-4" />
          GitHub
        </a>
      </div>
    </nav>
  )
}

export default Navbar
