export function howToMeasureSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to take body measurements for Indian clothing',
    description:
      'Record the body measurements commonly used when comparing the fit of saree blouses, lehengas, suits, kurtas and sherwanis.',
    totalTime: 'PT10M',
    supply: [
      { '@type': 'HowToSupply', name: 'Measurement worksheet' },
      { '@type': 'HowToSupply', name: 'Pen or pencil' },
      { '@type': 'HowToSupply', name: 'A helper, if available' },
    ],
    tool: [{ '@type': 'HowToTool', name: 'Soft measuring tape' }],
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Prepare to measure',
        text: 'Wear the undergarments and shoes planned for the outfit. Stand naturally and ask someone to help with back and length measurements when possible.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Measure the upper body',
        text: 'Measure the bust or chest, underbust, shoulder, armhole, upper arm and sleeve length. Keep the tape level without compressing the body.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Measure the waist and hips',
        text: 'Measure the natural waist, the position where the garment waistband will sit, and the fullest part of the hips.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Measure garment lengths',
        text: 'Measure from the intended starting point to the preferred hem. Wear the planned shoes for floor-length garments.',
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Check the selected product',
        text: 'Record every measurement twice, then compare the results with the size and construction details on the exact product listing.',
      },
    ],
  };
}
