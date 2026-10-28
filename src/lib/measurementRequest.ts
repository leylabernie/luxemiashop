export interface MeasurementDraft {
  choice: 'later' | 'now';
  units: '' | 'inches' | 'cm';
  basis: '' | 'body' | 'garment';
  rows: Array<{ label: string; value: string }>;
  notes: string;
  acknowledged: boolean;
}

export const emptyMeasurementDraft = (): MeasurementDraft => ({
  choice: 'later', units: '', basis: '', rows: [], notes: '', acknowledged: false,
});

const hasControls = (text: string) => Array.from(text).some(character => {
  const code = character.charCodeAt(0);
  return code < 32 || (code >= 127 && code <= 159);
});

/** Validate format only; customer labels are not a garment-specific measurement chart. */
export function measurementError(draft: MeasurementDraft): string | null {
  if (draft.choice === 'later') return null;
  if (draft.choice !== 'now') return 'Choose whether to provide details now or after ordering.';
  if (!['inches', 'cm'].includes(draft.units)) return 'Choose inches or centimetres.';
  if (!['body', 'garment'].includes(draft.basis)) return 'Choose whether you measured your body or an existing garment.';
  if (!draft.rows.length || draft.rows.length > 8) return 'Add between one and eight measurements for review.';
  const labels = new Set<string>();
  for (const row of draft.rows) {
    const label = row.label.trim();
    if (!label || row.label.length > 40 || hasControls(row.label)) return 'Use a measurement name of up to 40 characters, without control characters.';
    if (labels.has(label.toLowerCase())) return 'Use a different name for each measurement.';
    labels.add(label.toLowerCase());
    if (row.value.length > 12 || hasControls(row.value) || !/^\d+(?:\.\d+)?$/.test(row.value.trim()) || Number(row.value) <= 0) {
      return 'Enter a positive number for each value, without units or other text.';
    }
  }
  if (draft.notes.length > 240 || hasControls(draft.notes)) return 'Keep notes to 240 characters on one line.';
  if (!draft.acknowledged) return 'Acknowledge that LuxeMia must review these details before alterations.';
  return null;
}

export function measurementAttributes(draft: MeasurementDraft): Array<{ key: string; value: string }> {
  const error = measurementError(draft);
  if (error) throw new Error(error);
  if (draft.choice === 'later') return [{ key: 'Measurement submission', value: 'Provide after order — review required before alterations' }];
  return [
    { key: 'Measurement submission', value: 'Customer supplied — review required' },
    { key: 'Measurement units', value: draft.units },
    { key: 'Measurement basis', value: draft.basis === 'body' ? 'Body' : 'Existing garment' },
    ...draft.rows.map((row, i) => ({ key: `Provided measurement ${i + 1}`, value: `${row.label.trim()}: ${row.value.trim()} ${draft.units}` })),
    ...(draft.notes.trim() ? [{ key: 'Measurement notes', value: draft.notes.trim() }] : []),
  ];
}

const PENDING_MEASUREMENTS = 'Re-enter measurement details after reload';
export function hasPendingMeasurementAttributes(attributes?: Array<{ key: string; value: string }>): boolean {
  return Boolean(attributes?.some(attribute => attribute.key === 'Measurement submission' && attribute.value === PENDING_MEASUREMENTS));
}
/** Persist shopping identity, never customer-supplied measurement details. */
export function redactMeasurementAttributes(attributes?: Array<{ key: string; value: string }>): Array<{ key: string; value: string }> | undefined {
  if (!attributes) return attributes;
  const isPersonal = (key: string) => /^Provided measurement \d+$/.test(key)
    || ['Measurement units', 'Measurement basis', 'Measurement notes'].includes(key);
  const provided = attributes.some(attribute => isPersonal(attribute.key) || (attribute.key === 'Measurement submission'
    && ['Customer supplied — review required', PENDING_MEASUREMENTS].includes(attribute.value)));
  if (!provided) return attributes.map(attribute => ({ ...attribute }));
  const redacted = attributes.filter(attribute => !isPersonal(attribute.key))
    .map(attribute => attribute.key === 'Measurement submission' ? { ...attribute, value: PENDING_MEASUREMENTS } : { ...attribute });
  if (!redacted.some(attribute => attribute.key === 'Measurement submission')) redacted.push({ key: 'Measurement submission', value: PENDING_MEASUREMENTS });
  return redacted;
}
