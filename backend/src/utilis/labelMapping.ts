export const LABEL_MAPPING: Record<string, number> = {
  'Poor': 1,
  'Fair': 2,
  'Good': 3,
  'Very Good': 4,
  'Excellent': 5,
};

export function toNumericScore(label: string): number {
  // Try to get from label mapping first
  if (LABEL_MAPPING[label]) {
    return LABEL_MAPPING[label];
  }
  
  // Try to parse as number
  const numericValue = parseFloat(label);
  if (!isNaN(numericValue) && numericValue >= 0) {
    return numericValue;
  }
  
  // Return 0 for invalid values
  return 0;
}