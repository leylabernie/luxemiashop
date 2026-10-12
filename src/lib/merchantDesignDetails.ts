/** Recover only decoration explicitly named in the product title. */
export function getTitleDesignDetails(title = ''): string {
  const patterns: [RegExp, string][] = [
    [/\bchikankari\b/i, 'Chikankari embroidery'],
    [/\b(?:zardozi|zardosi)\b/i, 'Zardozi embroidery'],
    [/\bzari\b/i, 'Zari work'],
    [/\bsequins?\b/i, 'Sequin work'],
    [/\bmirror\s+work\b/i, 'Mirror work'],
    [/\b(?:beads?|beaded|beadwork)\b/i, 'Beadwork'],
    [/\blace\b/i, 'Lace detailing'],
    [/\bgota\s+patti\b/i, 'Gota patti work'],
    [/\b(?:embroidered|embroidery)\b/i, 'Embroidery'],
    [/\b(?:printed|print)\b/i, 'Printed detailing'],
  ];
  return patterns.filter(([pattern]) => pattern.test(title))
    .map(([, detail]) => detail).join('; ');
}
