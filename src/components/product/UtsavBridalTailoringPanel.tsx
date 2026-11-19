import { useState } from 'react';
import { ChevronDown, ChevronUp, Ruler, Scissors, Sparkles, Check } from 'lucide-react';
import {
  BRIDAL_VOL3_SIZE_CHART,
  BRIDAL_VOL3_TAILORING_OPTIONS,
  formatDimension,
  getBridalSizeChartRow,
  type UtsavBridalTailoringState,
} from '@/lib/bridalVol3Products';

interface UtsavBridalTailoringPanelProps {
  selectedSize: string;
  isCustomFit: boolean;
  value: UtsavBridalTailoringState;
  onChange: (next: UtsavBridalTailoringState) => void;
  onSelectSize: (size: string) => void;
}

export function UtsavBridalTailoringPanel({
  selectedSize,
  isCustomFit,
  value,
  onChange,
  onSelectSize,
}: UtsavBridalTailoringPanelProps) {
  const [showChart, setShowChart] = useState(false);
  const [showCustomDetails, setShowCustomDetails] = useState(false);

  const activeRow = getBridalSizeChartRow(selectedSize);
  const unit = value.unit;
  const update = <K extends keyof UtsavBridalTailoringState>(
    key: K,
    nextVal: UtsavBridalTailoringState[K],
  ) => onChange({ ...value, [key]: nextVal });

  const expandedStudio = isCustomFit || showCustomDetails;

  return (
    <section
      aria-label="Bridal sizing and custom tailoring options"
      data-testid="utsav-bridal-tailoring-panel"
      className="space-y-4 rounded-sm border border-[#e3d2c8] bg-[#fffaf6] p-4 sm:p-5"
    >
      {/* Header + Quick Mode Switch (Standard Size vs Custom Tailored) */}
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#eaded6] pb-3">
        <div className="flex items-center gap-2">
          <Scissors className="h-4 w-4 text-[#7a283b]" aria-hidden="true" />
          <span className="text-xs font-semibold uppercase tracking-[0.14em] text-[#291f20]">
            Bridal Fit &amp; Custom Tailoring
          </span>
        </div>
        <div className="inline-flex rounded-sm border border-[#dcc8bc] bg-white p-0.5 text-[11px] font-medium">
          <button
            type="button"
            onClick={() => update('unit', 'in')}
            aria-pressed={unit === 'in'}
            className={`rounded-sm px-2.5 py-1 transition-colors ${
              unit === 'in'
                ? 'bg-[#291f20] text-[#fff9f4]'
                : 'text-[#5b4d4c] hover:text-[#291f20]'
            }`}
          >
            IN
          </button>
          <button
            type="button"
            onClick={() => update('unit', 'cm')}
            aria-pressed={unit === 'cm'}
            className={`rounded-sm px-2.5 py-1 transition-colors ${
              unit === 'cm'
                ? 'bg-[#291f20] text-[#fff9f4]'
                : 'text-[#5b4d4c] hover:text-[#291f20]'
            }`}
          >
            CM
          </button>
        </div>
      </div>

      {/* Mode toggle cards (Utsav-style Standard Size vs Custom Tailored) */}
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
        <button
          type="button"
          onClick={() => {
            if (isCustomFit) onSelectSize('38');
          }}
          aria-pressed={!isCustomFit}
          className={`flex flex-col items-start rounded-sm border p-3 text-left transition-all ${
            !isCustomFit
              ? 'border-[#291f20] bg-[#f8efe7] shadow-sm'
              : 'border-[#e3d2c8] bg-white hover:border-[#b89f93]'
          }`}
        >
          <span className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#291f20]">
            <span>Standard Size (32–42)</span>
            {!isCustomFit && <Check className="h-3.5 w-3.5 text-[#7a283b]" aria-hidden="true" />}
          </span>
          <span className="mt-1 text-xs leading-snug text-[#5f504e]">
            38 readymade base; 32, 34, 36, 40 &amp; 42 altered within 42&quot; margin.
          </span>
        </button>

        <button
          type="button"
          onClick={() => onSelectSize('Custom Fit')}
          aria-pressed={isCustomFit}
          data-testid="select-utsav-custom-fit"
          className={`flex flex-col items-start rounded-sm border p-3 text-left transition-all ${
            isCustomFit
              ? 'border-[#291f20] bg-[#f8efe7] shadow-sm'
              : 'border-[#e3d2c8] bg-white hover:border-[#b89f93]'
          }`}
        >
          <span className="flex w-full items-center justify-between text-xs font-semibold uppercase tracking-wider text-[#291f20]">
            <span>Custom Tailored (MTM)</span>
            {isCustomFit && <Check className="h-3.5 w-3.5 text-[#7a283b]" aria-hidden="true" />}
          </span>
          <span className="mt-1 text-xs leading-snug text-[#5f504e]">
            Made to your bust, waist &amp; length + neckline, sleeve, padding &amp; cancan.
          </span>
        </button>
      </div>

      {/* Live Selected Size Garment Measurement Readout */}
      {activeRow && (
        <div className="rounded-sm border border-[#eaded6] bg-white p-3 text-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="font-semibold text-[#291f20]">
              Selected:{' '}
              {activeRow.size === 'Custom Fit'
                ? 'Custom Fit (Made to Measure)'
                : `Size ${activeRow.size} (${activeRow.alpha} · Ref US ${activeRow.usRef} / UK ${activeRow.ukRef})`}
            </p>
            <button
              type="button"
              onClick={() => setShowChart((prev) => !prev)}
              aria-expanded={showChart}
              data-testid="toggle-bridal-size-chart"
              className="inline-flex items-center gap-1 font-semibold text-link underline underline-offset-4 hover:text-link/80"
            >
              <Ruler className="h-3.5 w-3.5" aria-hidden="true" />
              {showChart ? 'Hide Size Chart' : 'Full Size Chart (32–46)'}
              {showChart ? (
                <ChevronUp className="h-3.5 w-3.5" aria-hidden="true" />
              ) : (
                <ChevronDown className="h-3.5 w-3.5" aria-hidden="true" />
              )}
            </button>
          </div>

          {activeRow.size !== 'Custom Fit' && (
            <dl className="mt-2.5 grid grid-cols-3 gap-2 border-t border-[#f1e7df] pt-2.5 sm:grid-cols-6">
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-[#6e605e]">Bust</dt>
                <dd className="font-semibold text-[#291f20]">{formatDimension(activeRow.bustIn, unit)}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-[#6e605e]">Underbust</dt>
                <dd className="font-semibold text-[#291f20]">{formatDimension(activeRow.underbustIn, unit)}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-[#6e605e]">Skirt Waist</dt>
                <dd className="font-semibold text-[#291f20]">{formatDimension(activeRow.lehengaWaistIn, unit)}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-[#6e605e]">Choli Len</dt>
                <dd className="font-semibold text-[#291f20]">{formatDimension(activeRow.choliLengthIn, unit)}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-[#6e605e]">Skirt Len</dt>
                <dd className="font-semibold text-[#291f20]">{formatDimension(activeRow.lehengaLengthIn, unit)}</dd>
              </div>
              <div>
                <dt className="text-[10px] uppercase tracking-wider text-[#6e605e]">Flare</dt>
                <dd className="font-semibold text-[#291f20]">{activeRow.flareMeters.toFixed(2)} m</dd>
              </div>
            </dl>
          )}
          <p className="mt-2 text-[11px] leading-relaxed text-[#5f504e]">{activeRow.fitNote}</p>
        </div>
      )}

      {/* Interactive Product-Specific Bridal Lehenga Size Chart */}
      {showChart && (
        <div className="overflow-x-auto rounded-sm border border-[#e3d2c8] bg-white p-3">
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-[#291f20]">
            Royal Bridal Silk Vol. 3 — Garment Measurement Chart ({unit === 'in' ? 'Inches' : 'Centimetres'})
          </p>
          <table className="w-full min-w-[520px] border-collapse text-left text-xs">
            <thead>
              <tr className="border-b border-[#eaded6] bg-[#faf3ed] text-[10px] uppercase tracking-wider text-[#5b4d4c]">
                <th scope="col" className="px-2 py-2 font-semibold">Size</th>
                <th scope="col" className="px-2 py-2 font-semibold">Ref</th>
                <th scope="col" className="px-2 py-2 font-semibold">Bust</th>
                <th scope="col" className="px-2 py-2 font-semibold">Blouse Waist</th>
                <th scope="col" className="px-2 py-2 font-semibold">Skirt Waist</th>
                <th scope="col" className="px-2 py-2 font-semibold">Hip</th>
                <th scope="col" className="px-2 py-2 font-semibold">Length</th>
                <th scope="col" className="px-2 py-2 font-semibold">Availability</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#f2e9e1]">
              {BRIDAL_VOL3_SIZE_CHART.map((row) => {
                const isSelected = row.size === selectedSize;
                const isCustomRow = row.size === 'Custom Fit';
                return (
                  <tr
                    key={row.size}
                    onClick={() => {
                      if (row.available) onSelectSize(row.size);
                    }}
                    className={`${
                      isSelected
                        ? 'bg-[#f8efe7] font-medium'
                        : row.available
                          ? 'cursor-pointer hover:bg-[#fcf7f2]'
                          : 'bg-[#f9f6f4] text-[#8a7c7a]'
                    }`}
                  >
                    <td className="px-2 py-1.5 font-semibold text-[#291f20]">
                      {row.size} <span className="font-normal text-[#6e605e]">({row.alpha})</span>
                    </td>
                    <td className="px-2 py-1.5">
                      {isCustomRow ? 'MTM' : `US ${row.usRef} / UK ${row.ukRef}`}
                    </td>
                    <td className="px-2 py-1.5">
                      {isCustomRow
                        ? `${formatDimension(28, unit)}–${formatDimension(42, unit)}`
                        : formatDimension(row.bustIn, unit)}
                    </td>
                    <td className="px-2 py-1.5">
                      {isCustomRow ? 'Custom' : formatDimension(row.aboveWaistIn, unit)}
                    </td>
                    <td className="px-2 py-1.5">
                      {isCustomRow
                        ? `${formatDimension(25, unit)}–${formatDimension(42, unit)}`
                        : formatDimension(row.lehengaWaistIn, unit)}
                    </td>
                    <td className="px-2 py-1.5">
                      {isCustomRow ? 'Free / Flared' : formatDimension(row.hipIn, unit)}
                    </td>
                    <td className="px-2 py-1.5">
                      {isCustomRow
                        ? `${formatDimension(36, unit)}–${formatDimension(43, unit)}`
                        : formatDimension(row.lehengaLengthIn, unit)}
                    </td>
                    <td className="px-2 py-1.5 text-[11px]">
                      {row.fitType === 'readymade-base' && (
                        <span className="font-semibold text-emerald-800">Readymade Base</span>
                      )}
                      {row.fitType === 'altered-standard' && (
                        <span className="text-[#291f20]">Tailored Fit</span>
                      )}
                      {row.fitType === 'max-allowance' && (
                        <span className="text-[#291f20]">Max Margin (42&quot;)</span>
                      )}
                      {row.fitType === 'custom-tailored' && (
                        <span className="font-semibold text-[#7a283b]">Made to Measure</span>
                      )}
                      {row.fitType === 'enquiry-only' && (
                        <span className="text-[#7c6e6c]">Enquire (42&quot; limit)</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <p className="mt-2 text-[11px] text-[#6e605e]">
            Select by verified bust and waist measurement first; US/UK labels above apply specifically to this bridal silk collection (4.50 m skirt flare, 42&quot; maximum readymade bust/waist seam capacity, 43&quot; skirt length).
          </p>
        </div>
      )}

      {/* Always-available Bridal Finishing Controls (Padding + Cancan Volume) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <label className="block space-y-1 text-xs">
          <span className="font-medium text-[#291f20]">Blouse Cups &amp; Lining</span>
          <select
            value={value.blousePadding}
            onChange={(e) => update('blousePadding', e.target.value)}
            className="h-9 w-full rounded-sm border border-[#d8c4b8] bg-white px-2.5 text-xs text-[#291f20] focus:border-[#291f20] focus:outline-none"
          >
            {BRIDAL_VOL3_TAILORING_OPTIONS.blousePadding.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>

        <label className="block space-y-1 text-xs">
          <span className="font-medium text-[#291f20]">Lehenga Cancan Volume</span>
          <select
            value={value.skirtCancan}
            onChange={(e) => update('skirtCancan', e.target.value)}
            className="h-9 w-full rounded-sm border border-[#d8c4b8] bg-white px-2.5 text-xs text-[#291f20] focus:border-[#291f20] focus:outline-none"
          >
            {BRIDAL_VOL3_TAILORING_OPTIONS.skirtCancan.map((opt) => (
              <option key={opt.id} value={opt.id}>
                {opt.label}
              </option>
            ))}
          </select>
        </label>
      </div>

      {/* Expand toggle when on standard size */}
      {!isCustomFit && (
        <button
          type="button"
          onClick={() => setShowCustomDetails((prev) => !prev)}
          aria-expanded={showCustomDetails}
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-link underline underline-offset-4 hover:text-link/80"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          {showCustomDetails
            ? 'Hide Neckline, Sleeve & Body-Profile Options'
            : 'Preview Custom Neckline, Sleeve & Lehenga Length Options'}
        </button>
      )}

      {/* Full Utsav-Style Custom Tailoring & Guided Measurement Studio */}
      {expandedStudio && (
        <div
          data-testid="utsav-custom-design-controls"
          className="space-y-4 border-t border-[#eaded6] pt-4"
        >
          <div className="flex items-start justify-between gap-2">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.12em] text-[#291f20]">
                Custom Blouse &amp; Skirt Styling Preferences
              </p>
              <p className="mt-0.5 text-[11px] text-[#5f504e]">
                Choose &ldquo;As Shown&rdquo; to preserve the studio silhouette or select preferred neckline, sleeve, length, and fit ease (reviewed against the embroidered bridal panel before tailoring).
              </p>
            </div>
          </div>

          {/* Front Neckline pills */}
          <div className="space-y-1.5">
            <p className="text-xs font-medium text-[#291f20]">Front Neck Style</p>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {BRIDAL_VOL3_TAILORING_OPTIONS.frontNeckStyles.map((opt) => {
                const active = value.frontNeck === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    aria-pressed={active}
                    onClick={() => update('frontNeck', opt.id)}
                    className={`rounded-sm border px-2.5 py-2 text-left text-[11px] leading-tight transition-colors ${
                      active
                        ? 'border-[#291f20] bg-[#291f20] font-semibold text-[#fff9f4]'
                        : 'border-[#dfd0c6] bg-white text-[#291f20] hover:border-[#9e857a]'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Back Neck, Sleeve, Choli Length & Fit Ease selectors */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <label className="block space-y-1 text-xs">
              <span className="font-medium text-[#291f20]">Back Neck Style</span>
              <select
                value={value.backNeck}
                onChange={(e) => update('backNeck', e.target.value)}
                className="h-9 w-full rounded-sm border border-[#d8c4b8] bg-white px-2.5 text-xs text-[#291f20] focus:border-[#291f20] focus:outline-none"
              >
                {BRIDAL_VOL3_TAILORING_OPTIONS.backNeckStyles.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1 text-xs">
              <span className="font-medium text-[#291f20]">Sleeve Style</span>
              <select
                value={value.sleeveStyle}
                onChange={(e) => update('sleeveStyle', e.target.value)}
                className="h-9 w-full rounded-sm border border-[#d8c4b8] bg-white px-2.5 text-xs text-[#291f20] focus:border-[#291f20] focus:outline-none"
              >
                {BRIDAL_VOL3_TAILORING_OPTIONS.sleeveStyles.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1 text-xs">
              <span className="font-medium text-[#291f20]">Choli Length</span>
              <select
                value={value.choliLength}
                onChange={(e) => update('choliLength', e.target.value)}
                className="h-9 w-full rounded-sm border border-[#d8c4b8] bg-white px-2.5 text-xs text-[#291f20] focus:border-[#291f20] focus:outline-none"
              >
                {BRIDAL_VOL3_TAILORING_OPTIONS.choliLengths.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1 text-xs">
              <span className="font-medium text-[#291f20]">Fit Ease Preference</span>
              <select
                value={value.fitPreference}
                onChange={(e) => update('fitPreference', e.target.value)}
                className="h-9 w-full rounded-sm border border-[#d8c4b8] bg-white px-2.5 text-xs text-[#291f20] focus:border-[#291f20] focus:outline-none"
              >
                {BRIDAL_VOL3_TAILORING_OPTIONS.fitPreferences.map((opt) => (
                  <option key={opt.id} value={opt.id}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </label>
          </div>

          {/* Optional Quick Bridal Choli + Lehenga Measurement Card */}
          {isCustomFit && (
            <div className="space-y-3 rounded-sm border border-[#eaded6] bg-white p-3">
              <div>
                <p className="text-xs font-semibold text-[#291f20]">
                  Guided Choli &amp; Lehenga Profile ({unit === 'in' ? 'Inches' : 'Centimetres'} — Optional Now)
                </p>
                <p className="text-[11px] text-[#5f504e]">
                  Enter known measurements below or leave blank to share after ordering with our bridal fitting team.
                </p>
              </div>
              <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-5">
                {(
                  [
                    ['choliBust', 'Around Bust', unit === 'in' ? '28–42' : '71–107'],
                    ['choliUnderbust', 'Underbust', unit === 'in' ? 'e.g. 31' : 'e.g. 79'],
                    ['choliAboveWaist', 'Blouse Waist', unit === 'in' ? 'e.g. 30' : 'e.g. 76'],
                    ['shoulderWidth', 'Shoulder', unit === 'in' ? 'e.g. 14.5' : 'e.g. 37'],
                    ['armhole', 'Armhole', unit === 'in' ? 'e.g. 16.5' : 'e.g. 42'],
                    ['sleeveLength', 'Sleeve Len', unit === 'in' ? 'e.g. 10.5' : 'e.g. 27'],
                    ['lehengaWaist', 'Skirt Waist', unit === 'in' ? '25–42' : '64–107'],
                    ['aroundHip', 'Around Hip', unit === 'in' ? 'e.g. 40' : 'e.g. 102'],
                    ['lehengaLength', 'Skirt Len (w/ Heels)', unit === 'in' ? '36–43' : '91–109'],
                    ['wearerHeight', 'Your Height', 'e.g. 5 ft 5 in'],
                  ] as const
                ).map(([fieldKey, label, placeholder]) => (
                  <label key={fieldKey} className="block space-y-1 text-[11px]">
                    <span className="font-medium text-[#4e403e]">{label}</span>
                    <input
                      type="text"
                      value={value[fieldKey]}
                      onChange={(e) => update(fieldKey, e.target.value.slice(0, 24))}
                      placeholder={placeholder}
                      className="h-8 w-full rounded-sm border border-[#dfd0c6] bg-[#fffdfb] px-2 text-xs text-[#291f20] placeholder:text-[#9c8e8b] focus:border-[#291f20] focus:outline-none"
                    />
                  </label>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Verified 4-Piece Double Dupatta Trousseau Summary */}
      <div className="border-t border-[#eaded6] pt-2.5 text-[11px] leading-relaxed text-[#5f504e]">
        <strong className="font-semibold text-[#291f20]">4-Piece Double Dupatta Set Included:</strong>{' '}
        Stitched 4.50 m Bridal Silk lehenga (with attached cancan, canvas &amp; beaded latkans) + readymade heavy-embroidered silk blouse + cutwork embroidered Soft Net head veil + embroidered Viscose shoulder drape.
      </div>
    </section>
  );
}
