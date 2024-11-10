"use client";
import { motion } from "framer-motion";
import Image from "next/image";

interface SocialLinkProps {
  href: string;
  imageSrc: string;
  alt: string;
  size?: number;
}

const SocialLink = ({ href, imageSrc, alt, size = 24 }: SocialLinkProps) => {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center justify-center p-2 rounded-full bg-muted hover:bg-muted/80 transition-colors"
      aria-label={`Visit our ${alt}`}
    >
      <Image
        src={imageSrc}
        alt={alt}
        width={size}
        height={size}
        className="dark:invert" // Inverts color in dark mode if needed
      />
    </motion.a>
  );
};

export default SocialLink;
