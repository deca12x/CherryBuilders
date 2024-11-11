"use client";
import { motion } from "framer-motion";
import Image from "next/image";

interface SocialLinkProps {
  href: string;
  imageSrc: string;
  alt: string;
}

const SocialLink = ({ href, imageSrc, alt }: SocialLinkProps) => {
  return (
    <motion.a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      whileHover={{ scale: 1.1 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center justify-center w-[40px] h-[40px] rounded-full bg-black border border-muted-foreground hover:bg-muted/80 transition-colors"
      aria-label={`Visit our ${alt}`}
    >
      <Image src={imageSrc} alt={alt} width={24} height={24} />
    </motion.a>
  );
};

export default SocialLink;
