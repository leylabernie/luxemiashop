import { motion } from 'framer-motion';

interface ImageCategoryHeroProps {
  image: string;
  imageWebp?: string;
  alt: string;
  eyebrow: string;
  title: string;
  description: string;
}

const ImageCategoryHero = ({
  image,
  imageWebp,
  alt,
  eyebrow,
  title,
  description,
}: ImageCategoryHeroProps) => (
  <section className="relative flex h-72 items-end overflow-hidden bg-[#3b292c] md:h-96 md:items-center">
    <picture aria-hidden="true" className="absolute inset-0 block overflow-hidden">
      {imageWebp && <source srcSet={imageWebp} type="image/webp" />}
      <img
        src={image}
        alt=""
        className="absolute inset-0 h-full w-full scale-110 object-cover opacity-60 blur-2xl"
        decoding="async"
      />
    </picture>

    <picture className="absolute inset-0 block overflow-hidden">
      {imageWebp && <source srcSet={imageWebp} type="image/webp" />}
      <img
        src={image}
        alt={alt}
        width={900}
        height={1200}
        className="absolute inset-0 h-full w-full object-contain object-center md:object-right"
        fetchPriority="high"
        decoding="async"
      />
    </picture>

    <div className="absolute inset-0 bg-gradient-to-t from-[#2f2023]/95 via-[#4a3136]/48 to-[#4a3136]/10 md:bg-gradient-to-r md:from-[#2f2023]/94 md:via-[#4a3136]/58 md:to-[#4a3136]/10" />
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-16 bg-[linear-gradient(90deg,transparent,rgba(244,196,188,0.6),transparent)] opacity-70" />

    <div className="container relative z-10 mx-auto max-w-7xl px-5 pb-7 text-center text-[#fff9f4] md:px-8 md:pb-0 md:text-left">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-xl"
      >
        <p className="mb-3 flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.22em] text-[#f1bbb5] md:justify-start md:text-sm">
          <span className="h-px w-8 bg-[#f1bbb5]" />
          {eyebrow}
        </p>
        <h1 className="mb-3 font-serif text-3xl tracking-[-0.02em] md:text-5xl">{title}</h1>
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-[#fff9f4]/86 md:mx-0 md:text-base">
          {description}
        </p>
      </motion.div>
    </div>
  </section>
);

export default ImageCategoryHero;
