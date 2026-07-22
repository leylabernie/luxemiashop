export function howToMeasureSchema() {
  return {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'How to measure for a custom-stitched Indian outfit',
    description:
      'Measure your bust, waist, hips, garment length, and sleeves for a custom-stitched lehenga choli, saree blouse, anarkali, or salwar kameez.',
    totalTime: 'PT10M',
    supply: [
      { '@type': 'HowToSupply', name: 'Soft measuring tape' },
      { '@type': 'HowToSupply', name: 'Pen and paper' },
      { '@type': 'HowToSupply', name: 'A friend to assist, if available' },
    ],
    tool: [{ '@type': 'HowToTool', name: 'Soft measuring tape' }],
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Measure your bust',
        text: 'Wear the bra you plan to use with the outfit. Wrap the tape around the fullest part of your bust and keep it level across your back.',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Measure your waist',
        text: 'Measure around your natural waist at the narrowest part of your torso without pulling the tape tight.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Measure your hips',
        text: 'Stand with your feet together and measure around the fullest part of your hips, keeping the tape parallel to the floor.',
      },
      {
        '@type': 'HowToStep',
        position: 4,
        name: 'Measure the garment length',
        text: 'Measure from the garment starting point to the desired hem. Wear the shoes you plan to use when measuring a floor-length lehenga or anarkali.',
      },
      {
        '@type': 'HowToStep',
        position: 5,
        name: 'Measure sleeve length and circumference',
        text: 'Measure from the shoulder point to the desired sleeve end, then measure around the arm where the sleeve will finish.',
      },
    ],
  };
}
