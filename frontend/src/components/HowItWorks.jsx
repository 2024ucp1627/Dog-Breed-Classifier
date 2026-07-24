import { motion } from 'framer-motion'
import { UploadCloud, ScanSearch, ListChecks } from 'lucide-react'

const steps = [
  {
    icon: UploadCloud,
    step: '01',
    title: 'Upload a Photo',
    description: 'Drag and drop a dog photo, or click to browse from your device.',
  },
  {
    icon: ScanSearch,
    step: '02',
    title: 'Model Analyzes',
    description: 'MobileNetV2 processes the image and runs inference in real time.',
  },
  {
    icon: ListChecks,
    step: '03',
    title: 'Get Top-3 Results',
    description: 'View the three most likely breeds, ranked by confidence score.',
  },
]

function HowItWorks() {
  return (
    <section id="how-it-works" className="relative z-10 w-full max-w-5xl mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <p className="font-display text-xs font-semibold tracking-widest text-slate-500 uppercase mb-2">
          How It Works
        </p>
        <h2 className="font-display text-3xl font-bold text-white">
          Three steps to a breed match
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        {steps.map((item, i) => {
          const Icon = item.icon
          return (
            <motion.div
              key={item.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.12 }}
              className="relative bg-surface border border-slate-800 rounded-2xl p-6 hover:border-slate-600 transition-colors"
            >
              <span className="absolute top-4 right-5 font-display text-4xl font-bold text-slate-800 select-none">
                {item.step}
              </span>
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-display font-semibold text-white mb-2">{item.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{item.description}</p>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

export default HowItWorks
