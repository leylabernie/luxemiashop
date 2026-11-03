import { measurementFaqs } from '@/data/sizingMeasurements';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, CheckCircle2, ClipboardList, Printer, Ruler, Users } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';

type MeasurementRow = {
  name: string;
  instruction: string;
  note: string;
};

const measurementGroups: { title: string; rows: MeasurementRow[] }[] = [
  {
    title: 'Upper body and blouse',
    rows: [
      { name: 'Bust', instruction: 'Measure around the fullest part of the bust with the tape level across the back.', note: 'Wear the undergarment planned for the outfit.' },
      { name: 'Underbust', instruction: 'Measure directly below the bust where the band sits.', note: 'Keep the tape close, without pulling it tight.' },
      { name: 'Shoulder', instruction: 'Measure across the back from one shoulder edge to the other.', note: 'A helper makes this measurement more reliable.' },
      { name: 'Blouse length', instruction: 'Measure from the top of the shoulder to the preferred blouse hem.', note: 'Record the starting and ending points for a tailor.' },
      { name: 'Armhole', instruction: 'Wrap the tape around the shoulder and underarm.', note: 'Keep the arm relaxed at your side.' },
      { name: 'Sleeve length', instruction: 'Measure from the shoulder point to the preferred sleeve end.', note: 'Slightly bend the arm for long sleeves.' },
      { name: 'Upper-arm circumference', instruction: 'Measure around the fullest part of the upper arm.', note: 'Do not flex or pull the tape tight.' },
    ],
  },
  {
    title: 'Waist, hips and length',
    rows: [
      { name: 'Natural waist', instruction: 'Measure around the narrowest part of the torso.', note: 'Breathe normally and keep the tape level.' },
      { name: 'Low waist', instruction: 'Measure where the lehenga or trouser waistband will sit.', note: 'This may differ from the natural waist.' },
      { name: 'Hips', instruction: 'Stand with feet together and measure around the fullest part of the hips.', note: 'Check in a mirror that the tape is level.' },
      { name: 'Waist to floor', instruction: 'Measure from the intended waistband to the floor.', note: 'Wear the shoes planned for the event.' },
      { name: 'Inseam', instruction: 'Measure from the crotch seam to the preferred trouser hem.', note: 'A well-fitting pair of trousers can be measured flat.' },
    ],
  },
  {
    title: 'Menswear and full-length garments',
    rows: [
      { name: 'Chest', instruction: 'Measure around the fullest part of the chest and shoulder blades.', note: 'Keep arms relaxed and the tape level.' },
      { name: 'Neck', instruction: 'Measure around the base of the neck.', note: 'Leave comfortable room for one finger.' },
      { name: 'Kurta or sherwani length', instruction: 'Measure from the top of the shoulder to the preferred hem.', note: 'Compare with the exact product listing.' },
      { name: 'Outseam', instruction: 'Measure from the intended waistband to the preferred trouser hem.', note: 'Wear the intended shoes if possible.' },
    ],
  },
];

export default function SizingMeasurementsContent({ isStaticFallback = false }: { isStaticFallback?: boolean }) {
  const [unit, setUnit] = useState<'in' | 'cm'>('in');
  return (<>
      <style>{`@media print {
        header, footer, nav, .no-print, [data-sonner-toaster] { display: none !important; }
        main, .measurement-content { padding-top: 0 !important; }
        .print-sheet { box-shadow: none !important; border: 0 !important; }
        .print-break-avoid { break-inside: avoid; }
        body { background: white !important; color: black !important; }
      }`}</style>

      <div className="measurement-content pt-[88px] lg:pt-[130px]">
        <section className="no-print bg-gradient-to-b from-primary/10 to-background py-16 lg:py-24">
          <div className="container mx-auto px-4 text-center">
            <Badge variant="secondary" className="mb-5 gap-2 px-4 py-2">
              <Ruler className="h-4 w-4" /> Free printable fit worksheet
            </Badge>
            <h1 className="mx-auto max-w-4xl font-display text-4xl text-foreground md:text-5xl lg:text-6xl">
              Indian Clothing Measurement Guide
            </h1>
            <p className="mx-auto mt-6 max-w-3xl text-lg text-muted-foreground">
              Record the measurements commonly requested for saree blouses, lehengas, suits, kurtas and sherwanis—then compare them with the exact product listing.
            </p>
            {isStaticFallback && (
              <p role="status" className="mx-auto mt-6 max-w-3xl text-sm text-muted-foreground">
                Worksheet fields, unit selection and the print button become available when this page finishes loading. Enable JavaScript to use these controls; you can still read the instructions below.
              </p>
            )}
            <div className="mt-8 flex flex-wrap justify-center gap-3">
              <button disabled={isStaticFallback}
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-2 rounded-full bg-primary px-6 py-3 font-medium text-primary-foreground transition-opacity hover:opacity-90"
              >
                <Printer className="h-4 w-4" /> Print worksheet
              </button>
              <Link to="/contact" className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3 font-medium text-foreground hover:bg-secondary">Ask a sizing question <ArrowRight className="h-4 w-4" /></Link>
              <Link
                to="/size-guide"
                className="inline-flex items-center gap-2 rounded-full border border-border bg-background px-6 py-3 font-medium text-foreground hover:bg-secondary"
              >
                View LuxeMia size guide <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </section>

        <section className="no-print py-14">
          <div className="container mx-auto px-4">
            <div className="mx-auto grid max-w-5xl gap-5 md:grid-cols-3">
              <Card>
                <CardContent className="pt-6">
                  <Ruler className="mb-3 h-8 w-8 text-primary" />
                  <h2 className="font-semibold text-foreground">Use a soft tape</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Keep it flat and level against the body without compressing the skin.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <Users className="mb-3 h-8 w-8 text-primary" />
                  <h2 className="font-semibold text-foreground">Ask someone to help</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Shoulder, back and full-length measurements are easier to take accurately with a helper.</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <CheckCircle2 className="mb-3 h-8 w-8 text-primary" />
                  <h2 className="font-semibold text-foreground">Measure twice</h2>
                  <p className="mt-2 text-sm text-muted-foreground">Record actual body measurements. Compare them only with the selected listing.</p>
                </CardContent>
              </Card>
            </div>

            <div className="mx-auto mt-14 max-w-4xl">
              <h2 className="font-display text-3xl text-foreground">How to measure for an Indian saree blouse</h2>
              <p className="mt-4 text-muted-foreground">
                Wear the undergarment you plan to use with the blouse, keep the tape level, and record your actual body measurements without adding ease. Compare the results with the exact product listing; this guide does not mean stitching or tailoring is included.
              </p>
              <ol className="mt-6 grid gap-4 text-muted-foreground md:grid-cols-2">
                <li><strong className="text-foreground">1. Bust:</strong> Measure around the fullest part of the bust with the tape level across the back.</li>
                <li><strong className="text-foreground">2. Underbust:</strong> Measure directly below the bust where the blouse band will sit.</li>
                <li><strong className="text-foreground">3. Shoulder:</strong> Measure across the back from one shoulder edge to the other.</li>
                <li><strong className="text-foreground">4. Blouse length:</strong> Measure from the top of the shoulder to the preferred blouse hem.</li>
                <li><strong className="text-foreground">5. Armhole:</strong> Wrap the tape around the shoulder and underarm while the arm rests naturally.</li>
                <li><strong className="text-foreground">6. Sleeve length:</strong> Measure from the shoulder point to the preferred sleeve end.</li>
                <li><strong className="text-foreground">7. Upper-arm circumference:</strong> Measure around the fullest part of the relaxed upper arm without pulling the tape tight.</li>
              </ol>
            </div>
          </div>
        </section>

        <section className="pb-16">
          <div className="container mx-auto px-4">
            <div className="print-sheet mx-auto max-w-5xl rounded-2xl border border-border bg-card p-5 shadow-sm md:p-8">
              <div className="flex flex-col gap-5 border-b border-border pb-6 md:flex-row md:items-start md:justify-between">
                <div>
                  <div className="flex items-center gap-2 text-sm font-medium text-primary">
                    <ClipboardList className="h-4 w-4" /> LuxeMia measurement worksheet
                  </div>
                  <h2 className="mt-2 font-display text-3xl text-foreground">My outfit measurements</h2>
                  <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
                    Worksheet only—this does not confirm sizing, tailoring availability or fit. Check the product page and ask before ordering when details are unclear.
                  </p>
                </div>
                <div className="no-print flex rounded-full border border-border p-1 text-sm">
                  <button disabled={isStaticFallback} type="button" onClick={() => setUnit('in')} className={`rounded-full px-4 py-2 ${unit === 'in' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>Inches</button>
                  <button disabled={isStaticFallback} type="button" onClick={() => setUnit('cm')} className={`rounded-full px-4 py-2 ${unit === 'cm' ? 'bg-primary text-primary-foreground' : 'text-muted-foreground'}`}>Centimeters</button>
                </div>
                <div className="hidden text-sm print:block">Unit: ________</div>
              </div>

              <div className="grid gap-4 border-b border-border py-6 sm:grid-cols-2 lg:grid-cols-4">
                {['Name', 'Event and date', 'Outfit or product', 'Shoes / heel height'].map((label) => (
                  <label key={label} className="text-sm font-medium text-foreground">
                    {label}
                    <input disabled={isStaticFallback} aria-label={label} className="mt-2 w-full border-0 border-b border-border bg-transparent px-1 py-2 font-normal outline-none focus:border-primary" />
                  </label>
                ))}
              </div>

              <div className="space-y-10 pt-8">
                {measurementGroups.map((group) => (
                  <div key={group.title} className="print-break-avoid">
                    <h3 className="font-display text-2xl text-foreground">{group.title}</h3>
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full min-w-[680px] border-collapse text-left text-sm">
                        <thead>
                          <tr className="border-b-2 border-border">
                            <th className="w-[18%] px-3 py-3 font-semibold">Measurement</th>
                            <th className="w-[40%] px-3 py-3 font-semibold">How to measure</th>
                            <th className="w-[27%] px-3 py-3 font-semibold">Check</th>
                            <th className="w-[15%] px-3 py-3 font-semibold">My {unit}</th>
                          </tr>
                        </thead>
                        <tbody>
                          {group.rows.map((row, index) => (
                            <tr key={row.name} className={index % 2 === 0 ? 'bg-secondary/30' : ''}>
                              <td className="px-3 py-4 font-medium text-foreground">{row.name}</td>
                              <td className="px-3 py-4 text-muted-foreground">{row.instruction}</td>
                              <td className="px-3 py-4 text-muted-foreground">{row.note}</td>
                              <td className="px-3 py-4">
                                <input disabled={isStaticFallback} aria-label={`${row.name} in ${unit}`} inputMode="decimal" className="w-full min-w-20 border-0 border-b border-border bg-transparent px-1 py-2 outline-none focus:border-primary" />
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-10 grid gap-5 border-t border-border pt-6 md:grid-cols-2">
                <label className="text-sm font-medium text-foreground">
                  Product listing size options
                  <textarea disabled={isStaticFallback} aria-label="Product listing size options" rows={3} className="mt-2 w-full rounded-md border border-border bg-background p-3 font-normal outline-none focus:border-primary" />
                </label>
                <label className="text-sm font-medium text-foreground">
                  Questions to ask before ordering
                  <textarea disabled={isStaticFallback} aria-label="Questions to ask before ordering" rows={3} className="mt-2 w-full rounded-md border border-border bg-background p-3 font-normal outline-none focus:border-primary" />
                </label>
              </div>
            </div>
          </div>
        </section>

        <section className="no-print bg-secondary/30 py-16">
          <div className="container mx-auto px-4">
            <div className="mx-auto max-w-3xl">
              <h2 className="text-center font-display text-3xl text-foreground">Measurement questions</h2>
              <div className="mt-8 space-y-6">
                {measurementFaqs.map((faq) => (
                  <div key={faq.question} className="border-b border-border pb-6">
                    <h3 className="text-lg font-semibold text-foreground">{faq.question}</h3>
                    <p className="mt-2 text-muted-foreground">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        <section className="no-print bg-primary py-16 text-primary-foreground">
          <div className="container mx-auto px-4 text-center">
            <h2 className="font-display text-3xl md:text-4xl">Shop with your measurements ready</h2>
            <p className="mx-auto mt-4 max-w-2xl text-primary-foreground/90">
              Compare your worksheet with the size and construction details on each listing. U.S. shipping is free at $150 and above and $14.99 below that.
            </p>
            <div className="mt-8 flex flex-wrap justify-center gap-4">
              <Link to="/lehengas" className="inline-flex items-center gap-2 rounded-full bg-background px-6 py-3 font-medium text-foreground">Shop lehengas <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/sarees" className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-background/15 px-6 py-3 font-medium text-primary-foreground">Shop sarees <ArrowRight className="h-4 w-4" /></Link>
              <Link to="/suits" className="inline-flex items-center gap-2 rounded-full border border-primary-foreground/30 bg-background/15 px-6 py-3 font-medium text-primary-foreground">Shop suits <ArrowRight className="h-4 w-4" /></Link>
            </div>
          </div>
        </section>
      </div>

  </>);
}
