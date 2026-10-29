import { useId } from 'react';
import { emptyMeasurementDraft, type MeasurementDraft } from '@/lib/measurementRequest';

interface Props {
  value: MeasurementDraft;
  onChange: (draft: MeasurementDraft) => void;
  error?: string;
}

/** Controlled by the selected product/variant/service context in the purchase flow. */
export function MeasurementRequestForm({ value, onChange, error }: Props) {
  const id = useId();
  const update = (patch: Partial<MeasurementDraft>) => onChange({ ...value, ...patch, acknowledged: false });
  return <section className="space-y-3 rounded-lg border p-4" aria-labelledby={`${id}-title`}>
    <h3 id={`${id}-title`} className="font-medium">Optional measurement details</h3>
    <p className="text-sm">Share details now or provide them after ordering. LuxeMia must review the measurements and alteration scope before work begins; these details do not confirm fit or availability. Changing the product, size or service clears these unsaved details.</p>
    <label className="block text-sm">When would you like to provide details?
      <select className="mt-1 block w-full rounded border p-2" value={value.choice} onChange={event => onChange({ ...emptyMeasurementDraft(), choice: event.target.value as MeasurementDraft['choice'] })}>
        <option value="later">Provide after ordering</option>
        <option value="now">Provide now for review</option>
      </select>
    </label>
    {value.choice === 'now' && <>
      <label className="block text-sm">Units
        <select className="mt-1 block w-full rounded border p-2" value={value.units} onChange={event => update({ units: event.target.value as MeasurementDraft['units'] })}>
          <option value="">Choose units</option><option value="inches">Inches</option><option value="cm">Centimetres</option>
        </select>
      </label>
      <label className="block text-sm">What did you measure?
        <select className="mt-1 block w-full rounded border p-2" value={value.basis} onChange={event => update({ basis: event.target.value as MeasurementDraft['basis'] })}>
          <option value="">Choose measurement basis</option><option value="body">My body</option><option value="garment">An existing garment</option>
        </select>
      </label>
      <p className="text-sm">Name the measurements you want reviewed. This is not a list of required measurements for this garment.</p>
      {value.rows.map((row, index) => <fieldset key={index} className="space-y-2 rounded border p-2">
        <legend className="text-sm">Measurement {index + 1}</legend>
        <label className="block text-sm">Name<input className="mt-1 block w-full rounded border p-2" maxLength={40} value={row.label} onChange={event => update({ rows: value.rows.map((entry, i) => i === index ? { ...entry, label: event.target.value } : entry) })} /></label>
        <label className="block text-sm">Value<input className="mt-1 block w-full rounded border p-2" inputMode="decimal" maxLength={12} value={row.value} onChange={event => update({ rows: value.rows.map((entry, i) => i === index ? { ...entry, value: event.target.value } : entry) })} /></label>
        <button type="button" className="text-sm underline" aria-label={`Remove measurement ${index + 1}`} onClick={() => update({ rows: value.rows.filter((_, i) => i !== index) })}>Remove</button>
      </fieldset>)}
      <button type="button" className="rounded border px-3 py-2 text-sm" disabled={value.rows.length >= 8} onClick={() => update({ rows: [...value.rows, { label: '', value: '' }] })}>Add measurement</button>
      <label className="block text-sm">Optional notes<input className="mt-1 block w-full rounded border p-2" maxLength={240} value={value.notes} onChange={event => update({ notes: event.target.value })} /></label>
      <div className="text-sm" aria-label="Measurement details for review">
        <p className="font-medium">Current details — LuxeMia review required</p>
        <p>Units: {value.units || 'Not selected'}. Basis: {value.basis === 'garment' ? 'Existing garment' : value.basis === 'body' ? 'Body' : 'Not selected'}.</p>
        <ul>{value.rows.map((row, i) => <li key={i}>{row.label || 'Unnamed measurement'}: {row.value || 'No value'} {value.units}</li>)}</ul>
        {value.notes && <p>Notes: {value.notes}</p>}
      </div>
      <label className="flex items-start gap-2 text-sm"><input type="checkbox" checked={value.acknowledged} onChange={event => onChange({ ...value, acknowledged: event.target.checked })} />I understand these details need LuxeMia review and do not confirm fit or alteration availability.</label>
    </>}
    {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
    <p className="text-xs text-muted-foreground">Your added measurement details stay only in this browsing session’s in-memory bag until checkout sends them to LuxeMia through Shopify. Reloading or closing this browser tab clears the details; your bag will ask you to remove that item and re-add it with new details or explicitly choose to provide them after ordering. Do not include contact, payment or health information.</p>
  </section>;
}
