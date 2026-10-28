// Clam Work (W7), from IdleonToolbox parsers/world-7/clamWork.ts.
// snapshot.clamWorkerClass = OptLacc[464]. Bonus i is on (1) once the worker class is above i.

export function getClamWorkBonus(snapshot, index) {
  return (snapshot?.clamWorkerClass ?? 0) > index ? 1 : 0
}
