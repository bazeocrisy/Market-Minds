// Grade bands. 'explorer' = Grades 3–5 (Market Explorer), 'analyst' = Grades 6–8 (Market Analyst).
export const BANDS = {
  explorer: { id: 'explorer', label: 'Grades 3–5', name: 'Market Explorer' },
  analyst: { id: 'analyst', label: 'Grades 6–8', name: 'Market Analyst' }
};

/** Band text/value: either shared (anything that isn't {explorer, analyst}) or one value per band. */
export function pick(value, band = 'explorer') {
  if (value && typeof value === 'object' && !Array.isArray(value) && ('explorer' in value || 'analyst' in value)) {
    return value[band] ?? value.explorer ?? value.analyst;
  }
  return value;
}
