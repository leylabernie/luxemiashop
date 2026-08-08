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
  <section className="relative flex h-72 items-end overflow-hidden bg-[#211410] md:h-96 md:items-center">
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

    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/35 to-black/10 md:bg-gradient-to-r md:from-black/90 md:via-black/55 md:to-black/10" />

    <div className="container relative z-10 mx-auto px-4 pb-7 text-center text-white md:px-8 md:pb-0 md:text-left">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7 }}
        className="max-w-xl"
      >
        <p className="mb-3 text-xs uppercase tracking-luxury text-[#e4c58e] md:text-sm">
          {eyebrow}
        </p>
        <h1 className="mb-3 font-serif text-3xl md:text-5xl">{title}</h1>
        <p className="mx-auto max-w-lg text-sm leading-relaxed text-white/85 md:mx-0 md:text-base">
          {description}
        </p>
      </motion.div>
    </div>
  </section>
);

export default ImageCategoryHero;
