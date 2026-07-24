import { motion } from 'framer-motion'
import { Zap, ListOrdered, MousePointerClick, History, Smartphone, Sparkles } from 'lucide-react'

const features = [
  {
    icon: Zap,
    title: 'Fast Predictions',
    description: 'Get breed predictions in under a second, powered by a lightweight MobileNetV2 model.',
  },
  {
    icon: ListOrdered,
    title: 'Top-3 Breed Matches',
    description: 'See the top 3 most likely breeds with confidence scores, not just a single guess.',
  },
  {
    icon: MousePointerClick,
    title: 'Drag & Drop Upload',
    description: 'Simply drag a photo onto the page, or click to browse — no forms, no friction.',
  },
  {
    icon: History,
    title: 'Prediction History',
    description: 'Your last 10 predictions are saved locally, so you can revisit past results anytime.',
  },
  {
    icon: Smartphone,
    title: 'Responsive Design',
    description: 'Built with Tailwind CSS to work smoothly across desktop, tablet, and mobile.',
  },
  {
    icon: Sparkles,
    title: 'Modern Full-Stack',
    description: 'React + FastAPI + TensorFlow, connected end-to-end as a real working application.',
  },
]

function Features() {
  return (
    <section id="features" className="relative z-10 w-full max-w-5xl mx-auto px-4 py-20">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="text-center mb-12"
      >
        <p className="font-display text-xs font-semibold tracking-widest text-slate-500 uppercase mb-2">
          Features
        </p>
        <h2 className="font-display text-3xl font-bold text-white">
          Built for speed and clarity
        </h2>
      </motion.div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {features.map((feature, i) => {
          const Icon = feature.icon
          return (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.4, delay: i * 0.08 }}
              className="bg-surface border border-slate-800 rounded-2xl p-6 hover:border-slate-600 transition-colors"
            >
              <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary to-secondary flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-white" />
              </div>
              <h3 className="font-display font-semibold text-white mb-2">{feature.title}</h3>
              <p className="text-sm text-slate-400 leading-relaxed">{feature.description}</p>
            </motion.div>
          )
        })}
      </div>
    </section>
  )
}

export default Features