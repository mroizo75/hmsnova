import { startWorkers, stopWorkers } from './index';

// Flagg for å sjekke om arbeidere allerede er startet
let workersStarted = false;

// Start arbeidere hvis de ikke allerede er startet
export function ensureWorkersStarted() {
  if (!workersStarted) {
    startWorkers();
    workersStarted = true;
    
    // Håndter ryddig avslutning
    process.on('SIGTERM', async () => {
      console.log('SIGTERM mottatt, stopper arbeidere...');
      await stopWorkers();
      process.exit(0);
    });
    
    process.on('SIGINT', async () => {
      console.log('SIGINT mottatt, stopper arbeidere...');
      await stopWorkers();
      process.exit(0);
    });
    
    return true;
  }
  
  return false;
}

// Stopp arbeidere hvis de er startet
export async function ensureWorkersStopped() {
  if (workersStarted) {
    await stopWorkers();
    workersStarted = false;
    return true;
  }
  
  return false;
}

// Hvis denne filen kjøres direkte (f.eks. med node src/lib/queue/worker-setup.js)
if (require.main === module) {
  console.log('Starter arbeiderprosess...');
  ensureWorkersStarted();
  console.log('Arbeiderprosess aktiv. Trykk Ctrl+C for å avslutte.');
} 