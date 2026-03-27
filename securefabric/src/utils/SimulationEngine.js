export class SimulationEngine {
  constructor(baselineData = []) {
    this.baselineData = baselineData;
    this.history = [];
  }

  /**
   * Z-Score Anomaly Detection
   * Determines if a new telemetry event is anomalous based on standard deviations from the mean.
   */
  calculateZScore(value, threshold = 2.5) {
    if (this.baselineData.length < 2) return { isAnomaly: false, zScore: 0 };
    
    const mean = this.baselineData.reduce((a, b) => a + b, 0) / this.baselineData.length;
    const variance = this.baselineData.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / this.baselineData.length;
    const stdDev = Math.sqrt(variance);
    
    if (stdDev === 0) return { isAnomaly: false, zScore: 0 };
    
    const zScore = (value - mean) / stdDev;
    return {
      isAnomaly: Math.abs(zScore) > threshold,
      zScore,
      mean,
      stdDev
    };
  }

  /**
   * Monte Carlo Simulation for Risk Prediction
   * Runs N simulations to predict future risk scores using a random walk with drift.
   */
  runMonteCarloRisk(currentRisk, volatility = 5, drift = 0.5, steps = 10, iterations = 1000) {
    let results = [];
    let endRisks = [];

    for (let i = 0; i < iterations; i++) {
      let run = [currentRisk];
      let r = currentRisk;
      for (let s = 0; s < steps; s++) {
        const randomShock = (Math.random() - 0.5) * 2 * volatility;
        r = Math.max(0, Math.min(100, r + drift + randomShock));
        run.push(r);
      }
      results.push(run);
      endRisks.push(r);
    }

    const avgEndRisk = endRisks.reduce((a, b) => a + b, 0) / iterations;
    const sortedEnds = [...endRisks].sort((a, b) => a - b);
    const p95 = sortedEnds[Math.floor(iterations * 0.95)];

    return {
      averagePredictedRisk: avgEndRisk,
      p95Risk: p95,
      samplePaths: results.slice(0, 5) // Return a few paths for visualization
    };
  }

  /**
   * KKT Optimization Test (Resource Allocation)
   * Simulated optimization of processing power (energy vs latency).
   * min L(x) + gamma*E(x)
   */
  optimizeResourcesKKT(latencyWeight, energyWeight, totalBudget) {
    // Simplified solver for x_latency + x_energy = totalBudget
    // Minimizing: latencyWeight/x_latency + energyWeight/x_energy
    
    // Using Lagrange multipliers:
    // x_latency = totalBudget * sqrt(latencyWeight) / (sqrt(latencyWeight) + sqrt(energyWeight))
    
    const sqrtL = Math.sqrt(latencyWeight);
    const sqrtE = Math.sqrt(energyWeight);
    const sumSqrt = sqrtL + sqrtE;
    
    const optLatency = totalBudget * (sqrtL / sumSqrt);
    const optEnergy = totalBudget * (sqrtE / sumSqrt);
    
    const cost = (latencyWeight / optLatency) + (energyWeight / optEnergy);
    
    return {
      optimalLatencyAllocation: optLatency,
      optimalEnergyAllocation: optEnergy,
      minimizedCost: cost,
      equilibriumReached: true
    };
  }

  /**
   * Poisson Probability of N attacks in T interval
   * P(X >= k) = 1 - sum(i=0..k-1) [lambda^i * e^(-lambda) / i!]
   * Uses log-space computation for numerical stability with large k or lambda.
   */
  calculateAttackProbability(historicalRate, targetEvents) {
    const lambda = historicalRate;
    
    // Input validation
    if (!Number.isFinite(lambda) || lambda < 0) return 0;
    if (!Number.isFinite(targetEvents) || targetEvents < 0) return 0;
    if (targetEvents === 0) return 1; // P(X >= 0) is always 1
    if (lambda === 0) return 0; // No events expected means P(X >= k) = 0 for k > 0
    
    // Log-space Poisson PMF: log P(X=k) = k*ln(lambda) - lambda - ln(k!)
    // Using log-gamma for factorial: ln(k!) = lnGamma(k+1)
    const logFactorial = (n) => {
      if (n <= 1) return 0;
      // Stirling's approximation for large n, exact for small n
      if (n <= 20) {
        let result = 0;
        for (let i = 2; i <= n; i++) result += Math.log(i);
        return result;
      }
      // Stirling: ln(n!) ≈ n*ln(n) - n + 0.5*ln(2*pi*n)
      return n * Math.log(n) - n + 0.5 * Math.log(2 * Math.PI * n);
    };
    
    let cumulativeProb = 0;
    for (let k = 0; k < targetEvents; k++) {
      const logPMF = k * Math.log(lambda) - lambda - logFactorial(k);
      cumulativeProb += Math.exp(logPMF);
    }
    
    return Math.max(0, Math.min(1, 1 - cumulativeProb));
  }
}
