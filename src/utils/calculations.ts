/**
 * Calculate feeding amount based on fish count and age
 */
export const calculateFeedingAmount = (fishCount: number, fishAgeDays: number): number => {
  // Basic calculation: 2-5% of estimated fish weight
  // Younger fish need more frequent feeding
  const estimatedFishWeight = fishAgeDays * 0.05; // Very rough estimate
  const feedingPercentage = fishAgeDays < 30 ? 0.05 : fishAgeDays < 60 ? 0.04 : 0.03;
  
  return Math.round(fishCount * estimatedFishWeight * feedingPercentage * 100) / 100;
};

/**
 * Calculate pond stocking density
 */
export const calculateStockingDensity = (fishCount: number, pondSizeM2: number): number => {
  return Math.round((fishCount / pondSizeM2) * 100) / 100;
};

/**
 * Calculate estimated harvest time based on fish age and target size
 */
export const calculateHarvestTime = (currentAgeDays: number, targetSizeGrams: number = 500): number => {
  // Rough calculation: lele grows about 5-8g per day under good conditions
  const currentWeight = currentAgeDays * 6; // Estimated current weight
  const remainingGrowth = targetSizeGrams - currentWeight;
  const daysToHarvest = Math.max(0, Math.ceil(remainingGrowth / 6));
  
  return daysToHarvest;
};

/**
 * Calculate pond volume
 */
export const calculatePondVolume = (sizeM2: number, depthM: number): number => {
  return sizeM2 * depthM;
};

/**
 * Calculate optimal pH range status
 */
export const calculatePHStatus = (phLevel: number): 'optimal' | 'warning' | 'danger' => {
  if (phLevel >= 6.5 && phLevel <= 8.5) return 'optimal';
  if (phLevel >= 6.0 && phLevel <= 9.0) return 'warning';
  return 'danger';
};

/**
 * Calculate optimal temperature range status
 */
export const calculateTemperatureStatus = (temperature: number): 'optimal' | 'warning' | 'danger' => {
  if (temperature >= 26 && temperature <= 30) return 'optimal';
  if (temperature >= 24 && temperature <= 32) return 'warning';
  return 'danger';
};

/**
 * Calculate pond efficiency score based on multiple factors
 */
export const calculatePondEfficiency = (params: {
  fishCount: number;
  pondSizeM2: number;
  fishAgeDays: number;
  waterTemperature?: number;
  phLevel?: number;
}): number => {
  let score = 100;
  
  // Stocking density penalty
  const density = calculateStockingDensity(params.fishCount, params.pondSizeM2);
  if (density > 50) score -= 20; // Too crowded
  else if (density < 10) score -= 10; // Under-utilized
  
  // Water quality penalties
  if (params.waterTemperature) {
    const tempStatus = calculateTemperatureStatus(params.waterTemperature);
    if (tempStatus === 'warning') score -= 15;
    if (tempStatus === 'danger') score -= 30;
  }
  
  if (params.phLevel) {
    const phStatus = calculatePHStatus(params.phLevel);
    if (phStatus === 'warning') score -= 10;
    if (phStatus === 'danger') score -= 25;
  }
  
  return Math.max(0, Math.min(100, score));
};

/**
 * Calculate estimated revenue based on current fish data
 */
export const calculateEstimatedRevenue = (
  fishCount: number, 
  fishAgeDays: number, 
  pricePerKg: number = 25000
): number => {
  const estimatedWeightPerFish = fishAgeDays * 6; // grams
  const totalWeightKg = (fishCount * estimatedWeightPerFish) / 1000;
  return Math.round(totalWeightKg * pricePerKg);
};

/**
 * Calculate water quality index
 */
export const calculateWaterQualityIndex = (params: {
  temperature?: number;
  phLevel?: number;
  dissolvedOxygen?: number;
  ammonia?: number;
}): number => {
  let score = 0;
  let factors = 0;
  
  if (params.temperature !== undefined) {
    const tempStatus = calculateTemperatureStatus(params.temperature);
    score += tempStatus === 'optimal' ? 25 : tempStatus === 'warning' ? 15 : 5;
    factors++;
  }
  
  if (params.phLevel !== undefined) {
    const phStatus = calculatePHStatus(params.phLevel);
    score += phStatus === 'optimal' ? 25 : phStatus === 'warning' ? 15 : 5;
    factors++;
  }
  
  if (params.dissolvedOxygen !== undefined) {
    // Optimal DO for catfish: 4-6 ppm
    if (params.dissolvedOxygen >= 4 && params.dissolvedOxygen <= 6) score += 25;
    else if (params.dissolvedOxygen >= 3 && params.dissolvedOxygen <= 7) score += 15;
    else score += 5;
    factors++;
  }
  
  if (params.ammonia !== undefined) {
    // Lower ammonia is better, should be < 0.5 ppm
    if (params.ammonia <= 0.5) score += 25;
    else if (params.ammonia <= 1.0) score += 15;
    else score += 5;
    factors++;
  }
  
  return factors > 0 ? Math.round(score / factors) : 0;
};