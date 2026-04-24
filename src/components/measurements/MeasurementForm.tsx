import { useState } from 'react';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CheckCircle, HelpCircle, Ruler, Send, Info } from 'lucide-react';
import { toast } from 'sonner';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

const measurementSchema = z.object({
  garmentType: z.string().min(1, 'Please select a garment type'),
  
  // Common measurements
  bust: z.string().min(1, 'Bust measurement is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 26 && Number(val) <= 60, {
      message: 'Bust must be between 26-60 inches',
    }),
  waist: z.string().min(1, 'Waist measurement is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 20 && Number(val) <= 55, {
      message: 'Waist must be between 20-55 inches',
    }),
  hips: z.string().min(1, 'Hip measurement is required')
    .refine((val) => !isNaN(Number(val)) && Number(val) >= 30 && Number(val) <= 65, {
      message: 'Hips must be between 30-65 inches',
    }),
  
  // Upper body measurements
  shoulderWidth: z.string().optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 12 && Number(val) <= 22), {
      message: 'Shoulder must be between 12-22 inches',
    }),
  sleeveLength: z.string().optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 4 && Number(val) <= 28), {
      message: 'Sleeve length must be between 4-28 inches',
    }),
  armhole: z.string().optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 14 && Number(val) <= 26), {
      message: 'Armhole must be between 14-26 inches',
    }),
  upperArm: z.string().optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 9 && Number(val) <= 20), {
      message: 'Upper arm must be between 9-20 inches',
    }),
  
  // Lower body measurements
  lehengaLength: z.string().optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 30 && Number(val) <= 50), {
      message: 'Lehenga length must be between 30-50 inches',
    }),
  lehengaFlare: z.string().optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 2 && Number(val) <= 10), {
      message: 'Flare must be between 2-10 meters',
    }),
  
  // Blouse specific
  frontNeckDepth: z.string().optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 4 && Number(val) <= 12), {
      message: 'Front neck depth must be between 4-12 inches',
    }),
  backNeckDepth: z.string().optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 2 && Number(val) <= 14), {
      message: 'Back neck depth must be between 2-14 inches',
    }),
  blouseLength: z.string().optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 12 && Number(val) <= 24), {
      message: 'Blouse length must be between 12-24 inches',
    }),
  
  // Optional
  height: z.string().optional()
    .refine((val) => !val || (!isNaN(Number(val)) && Number(val) >= 48 && Number(val) <= 84), {
      message: 'Height must be between 48-84 inches (4ft - 7ft)',
    }),
  weight: z.string().optional(),
  specialInstructions: z.string().optional(),
  
  // Acknowledgments
  professionalMeasurement: z.boolean().default(false),
  acknowledgeResponsibility: z.boolean().refine((val) => val === true, {
    message: 'You must acknowledge responsibility for your measurements',
  }),
  acknowledgeNoReturns: z.boolean().refine((val) => val === true, {
    message: 'You must acknowledge the no-returns policy for measurement issues',
  }),
});

type MeasurementFormData = z.infer<typeof measurementSchema>;

const MeasurementField = ({ 
  label, 
  tooltip, 
  required = false,
  children 
}: { 
  label: string; 
  tooltip: string; 
  required?: boolean;
  children: React.ReactNode;
}) => (
  <div className="space-y-2">
    <div className="flex items-center gap-2">
      <Label className="text-sm font-medium text-foreground">
        {label}
        {required && <span className="text-destructive ml-1">*</span>}
      </Label>
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <HelpCircle className="w-4 h-4 text-muted-foreground cursor-help" />
          </TooltipTrigger>
          <TooltipContent className="max-w-xs">
            <p>{tooltip}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </div>
    {children}
  </div>
);

const MeasurementForm = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<MeasurementFormData>({
    resolver: zodResolver(measurementSchema),
    defaultValues: {
      garmentType: '',
      bust: '',
      waist: '',
      hips: '',
      shoulderWidth: '',
      sleeveLength: '',
      armhole: '',
      upperArm: '',
      lehengaLength: '',
      lehengaFlare: '',
      frontNeckDepth: '',
      backNeckDepth: '',
      blouseLength: '',
      height: '',
      weight: '',
      specialInstructions: '',
      professionalMeasurement: false,
      acknowledgeResponsibility: false,
      acknowledgeNoReturns: false,
    },
  });

  const garmentType = form.watch('garmentType');

  const onSubmit = async (data: MeasurementFormData) => {
    setIsSubmitting(true);
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    console.log('Measurements submitted:', data);
    setIsSubmitted(true);
    toast.success('Measurements submitted successfully!', {
      description: 'Your measurements have been saved. You can now proceed with your order.',
    });
    setIsSubmitting(false);
  };

  if (isSubmitted) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-900 rounded-lg p-8 text-center"
      >
        <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />
        <h3 className="text-xl font-semibold text-foreground mb-2">Measurements Saved!</h3>
        <p className="text-muted-foreground mb-6">
          Your measurements have been recorded. You can now proceed with your custom order. 
          A copy has been sent to your email for your records.
        </p>
        <Button onClick={() => setIsSubmitted(false)} variant="outline">
          Submit New Measurements
        </Button>
      </motion.div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Warning Banner */}
      <div className="bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 rounded-lg p-4">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="font-semibold text-amber-800 dark:text-amber-200 mb-1">
              Important Measurement Notice
            </h4>
            <p className="text-sm text-amber-700 dark:text-amber-300">
              You are fully responsible for the accuracy of your measurements. Garments made with 
              incorrect measurements cannot be returned or exchanged. We strongly recommend having 
              a professional tailor take your measurements.
            </p>
          </div>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          {/* Garment Type Selection */}
          <div className="bg-card border border-border rounded-lg p-6">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Ruler className="w-5 h-5 text-primary" />
              Select Garment Type
            </h3>
            <FormField
              control={form.control}
              name="garmentType"
              render={({ field }) => (
                <FormItem>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select garment type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="lehenga">Lehenga Set (Lehenga + Blouse + Dupatta)</SelectItem>
                      <SelectItem value="saree-blouse">Saree Blouse Only</SelectItem>
                      <SelectItem value="anarkali">Anarkali Suit</SelectItem>
                      <SelectItem value="sharara">Sharara Set</SelectItem>
                      <SelectItem value="gown">Gown / Dress</SelectItem>
                      <SelectItem value="suit">Salwar Suit / Kurta Set</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {garmentType && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              {/* Essential Measurements */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Essential Measurements <span className="text-destructive">*</span>
                </h3>
                <p className="text-sm text-muted-foreground mb-6">
                  All measurements should be in inches. Measure over undergarments only.
                </p>
                
                <div className="grid md:grid-cols-3 gap-6">
                  <FormField
                    control={form.control}
                    name="bust"
                    render={({ field }) => (
                      <FormItem>
                        <MeasurementField 
                          label="Bust / Chest" 
                          tooltip="Measure around the fullest part of your bust, keeping the tape parallel to the floor."
                          required
                        >
                          <FormControl>
                            <div className="relative">
                              <Input {...field} placeholder="e.g., 36" className="pr-10" />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">in</span>
                            </div>
                          </FormControl>
                        </MeasurementField>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="waist"
                    render={({ field }) => (
                      <FormItem>
                        <MeasurementField 
                          label="Waist" 
                          tooltip="Measure at the narrowest point of your natural waist, usually just above the belly button."
                          required
                        >
                          <FormControl>
                            <div className="relative">
                              <Input {...field} placeholder="e.g., 30" className="pr-10" />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">in</span>
                            </div>
                          </FormControl>
                        </MeasurementField>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="hips"
                    render={({ field }) => (
                      <FormItem>
                        <MeasurementField 
                          label="Hips" 
                          tooltip="Measure around the fullest part of your hips/buttocks, keeping the tape parallel to the floor."
                          required
                        >
                          <FormControl>
                            <div className="relative">
                              <Input {...field} placeholder="e.g., 40" className="pr-10" />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">in</span>
                            </div>
                          </FormControl>
                        </MeasurementField>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Upper Body Measurements */}
              {(garmentType === 'lehenga' || garmentType === 'saree-blouse' || garmentType === 'anarkali' || garmentType === 'gown' || garmentType === 'suit') && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Upper Body / Blouse Measurements
                  </h3>
                  
                  <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <FormField
                      control={form.control}
                      name="shoulderWidth"
                      render={({ field }) => (
                        <FormItem>
                          <MeasurementField 
                            label="Shoulder Width" 
                            tooltip="Measure from the edge of one shoulder to the other across the back."
                          >
                            <FormControl>
                              <div className="relative">
                                <Input {...field} placeholder="e.g., 14" className="pr-10" />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">in</span>
                              </div>
                            </FormControl>
                          </MeasurementField>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="sleeveLength"
                      render={({ field }) => (
                        <FormItem>
                          <MeasurementField 
                            label="Sleeve Length" 
                            tooltip="Measure from shoulder point to desired sleeve end (wrist for full, elbow for half)."
                          >
                            <FormControl>
                              <div className="relative">
                                <Input {...field} placeholder="e.g., 22" className="pr-10" />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">in</span>
                              </div>
                            </FormControl>
                          </MeasurementField>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="armhole"
                      render={({ field }) => (
                        <FormItem>
                          <MeasurementField 
                            label="Armhole" 
                            tooltip="Measure around the armhole, from front shoulder to back shoulder around the arm."
                          >
                            <FormControl>
                              <div className="relative">
                                <Input {...field} placeholder="e.g., 18" className="pr-10" />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">in</span>
                              </div>
                            </FormControl>
                          </MeasurementField>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="upperArm"
                      render={({ field }) => (
                        <FormItem>
                          <MeasurementField 
                            label="Upper Arm" 
                            tooltip="Measure around the fullest part of your upper arm."
                          >
                            <FormControl>
                              <div className="relative">
                                <Input {...field} placeholder="e.g., 12" className="pr-10" />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">in</span>
                              </div>
                            </FormControl>
                          </MeasurementField>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Blouse-specific measurements */}
                  <div className="grid md:grid-cols-3 gap-6 mt-6">
                    <FormField
                      control={form.control}
                      name="frontNeckDepth"
                      render={({ field }) => (
                        <FormItem>
                          <MeasurementField 
                            label="Front Neck Depth" 
                            tooltip="Measure from the hollow of your neck to where you want the neckline to end."
                          >
                            <FormControl>
                              <div className="relative">
                                <Input {...field} placeholder="e.g., 7" className="pr-10" />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">in</span>
                              </div>
                            </FormControl>
                          </MeasurementField>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="backNeckDepth"
                      render={({ field }) => (
                        <FormItem>
                          <MeasurementField 
                            label="Back Neck Depth" 
                            tooltip="Measure from the base of your neck to where you want the back neckline to end."
                          >
                            <FormControl>
                              <div className="relative">
                                <Input {...field} placeholder="e.g., 6" className="pr-10" />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">in</span>
                              </div>
                            </FormControl>
                          </MeasurementField>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="blouseLength"
                      render={({ field }) => (
                        <FormItem>
                          <MeasurementField 
                            label="Blouse Length" 
                            tooltip="Measure from shoulder to desired blouse end (usually at waist or below)."
                          >
                            <FormControl>
                              <div className="relative">
                                <Input {...field} placeholder="e.g., 15" className="pr-10" />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">in</span>
                              </div>
                            </FormControl>
                          </MeasurementField>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Lower Body Measurements (Lehenga specific) */}
              {(garmentType === 'lehenga' || garmentType === 'sharara' || garmentType === 'gown' || garmentType === 'anarkali') && (
                <div className="bg-card border border-border rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-foreground mb-4">
                    Lower Body / Lehenga Measurements
                  </h3>
                  
                  <div className="grid md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="lehengaLength"
                      render={({ field }) => (
                        <FormItem>
                          <MeasurementField 
                            label="Lehenga / Skirt Length" 
                            tooltip="Measure from waist to floor or desired hem length. For heels, add heel height."
                          >
                            <FormControl>
                              <div className="relative">
                                <Input {...field} placeholder="e.g., 42" className="pr-10" />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">in</span>
                              </div>
                            </FormControl>
                          </MeasurementField>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="lehengaFlare"
                      render={({ field }) => (
                        <FormItem>
                          <MeasurementField 
                            label="Preferred Flare" 
                            tooltip="Circumference at the hem. Standard is 4-5 meters. Bridal typically 6-8 meters."
                          >
                            <FormControl>
                              <div className="relative">
                                <Input {...field} placeholder="e.g., 5" className="pr-10" />
                                <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">m</span>
                              </div>
                            </FormControl>
                          </MeasurementField>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>
              )}

              {/* Additional Information */}
              <div className="bg-card border border-border rounded-lg p-6">
                <h3 className="text-lg font-semibold text-foreground mb-4">
                  Additional Information (Optional)
                </h3>
                
                <div className="grid md:grid-cols-2 gap-6 mb-6">
                  <FormField
                    control={form.control}
                    name="height"
                    render={({ field }) => (
                      <FormItem>
                        <MeasurementField 
                          label="Height" 
                          tooltip="Your total height. Helps us adjust proportions if needed."
                        >
                          <FormControl>
                            <div className="relative">
                              <Input {...field} placeholder="e.g., 64" className="pr-10" />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">in</span>
                            </div>
                          </FormControl>
                        </MeasurementField>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="weight"
                    render={({ field }) => (
                      <FormItem>
                        <MeasurementField 
                          label="Weight" 
                          tooltip="Optional - helps with fit recommendations."
                        >
                          <FormControl>
                            <div className="relative">
                              <Input {...field} placeholder="e.g., 130" className="pr-10" />
                              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-sm text-muted-foreground">lbs</span>
                            </div>
                          </FormControl>
                        </MeasurementField>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="specialInstructions"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Special Instructions or Preferences</FormLabel>
                      <FormControl>
                        <textarea 
                          {...field}
                          className="w-full min-h-[100px] rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                          placeholder="Any specific fitting preferences, adjustments, or notes for our tailors..."
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Acknowledgments */}
              <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-6 space-y-4">
                <h3 className="text-lg font-semibold text-foreground flex items-center gap-2">
                  <Info className="w-5 h-5 text-destructive" />
                  Required Acknowledgments
                </h3>

                <FormField
                  control={form.control}
                  name="professionalMeasurement"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm text-muted-foreground">
                          These measurements were taken by a professional tailor (recommended but not required)
                        </FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="acknowledgeResponsibility"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium text-foreground">
                          I understand that I am fully responsible for the accuracy of my measurements. <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormDescription>
                          Any errors in measurements provided by me are my responsibility.
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="acknowledgeNoReturns"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel className="text-sm font-medium text-foreground">
                          I understand that garments cannot be returned or exchanged due to incorrect measurements I have provided. <span className="text-destructive">*</span>
                        </FormLabel>
                        <FormDescription>
                          Custom orders are final sale. Fitting issues from measurement errors are not covered.
                        </FormDescription>
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Submit Button */}
              <div className="flex justify-end">
                <Button 
                  type="submit" 
                  size="lg"
                  disabled={isSubmitting}
                  className="min-w-[200px]"
                >
                  {isSubmitting ? (
                    <>
                      <span className="animate-spin mr-2">⏳</span>
                      Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 mr-2" />
                      Submit Measurements
                    </>
                  )}
                </Button>
              </div>
            </motion.div>
          )}
        </form>
      </Form>
    </div>
  );
};

export default MeasurementForm;