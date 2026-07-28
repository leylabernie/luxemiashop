interface CeremonyVerseLinkBlockProps {
  variant?: 'section' | 'compact';
}

const CeremonyVerseLinkBlock = ({ variant = 'section' }: CeremonyVerseLinkBlockProps) => {
  if (variant === 'compact') {
    return (
      <div className="rounded-lg border border-border bg-secondary/30 p-4 text-sm text-muted-foreground">
        Need it in a specific colour, or matching outfits for a group?{' '}
        <a
          href="https://www.ceremonyverse.com"
          target="_blank"
          rel="noopener"
          className="text-foreground underline underline-offset-4 hover:text-primary"
        >
          We do that too →
        </a>
      </div>
    );
  }

  return (
    <section className="border-t border-border bg-secondary/30 py-12">
      <div className="container mx-auto px-4 lg:px-8 max-w-3xl text-center">
        <h2 className="font-serif text-2xl md:text-3xl mb-3">Planning a whole wedding party?</h2>
        <p className="text-muted-foreground mb-5">
          Matched colours, made to measure, 11–14 weeks. That&apos;s our sister site.
        </p>
        <a
          href="https://www.ceremonyverse.com"
          target="_blank"
          rel="noopener"
          className="inline-flex items-center justify-center px-6 py-3 bg-foreground text-background text-sm uppercase tracking-editorial hover:bg-foreground/90 transition-colors"
        >
          Visit CeremonyVerse →
        </a>
      </div>
    </section>
  );
};

export default CeremonyVerseLinkBlock;
