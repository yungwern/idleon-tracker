// Runs the Spice Optimizer off the main thread (used by Breeding/SpiceOptimizer.jsx)
import { optimizeFormations } from './spiceOptimizer'

self.onmessage = event => {
  self.postMessage(optimizeFormations(event.data))
}
